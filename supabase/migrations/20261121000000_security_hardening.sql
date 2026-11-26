-- =====================================================================
-- Pennywise  |  Security hardening + reproducible schema
-- Closes every issue found in the 2026-11-21 audit (see docs/SECURITY.md):
--   * negative-amount transfers (free money)
--   * client-forgeable wallets / transactions / OTPs
--   * legacy transfer_funds() + 5-arg execute_transfer() bypassing limits
--   * unvalidated recipient, failed attempts never audited
--   * missing profiles / notifications / signup trigger in migrations
--
-- Conventions introduced here
--   * transactions.amount is SIGNED: income > 0, expense/transfer < 0
--   * all money movement happens in SECURITY DEFINER RPCs that return
--     {success, code, ...}; business failures RETURN (they do not RAISE)
--     so failed-attempt counters and audit rows are really committed.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Preconditions: fail loudly instead of silently corrupting data
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.wallets GROUP BY user_id HAVING count(*) > 1) THEN
    RAISE EXCEPTION
      'Some users have more than one wallet row. Merge them manually, then re-run this migration.';
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- 1. Remove the insecure surface
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.transfer_funds(numeric, bigint, text, text);
DROP FUNCTION IF EXISTS public.execute_transfer(numeric, bigint, text, text, text);
DROP FUNCTION IF EXISTS public.execute_transfer(numeric, bigint, text, text, text, text);
DROP FUNCTION IF EXISTS public.contribute_to_goal(uuid, numeric, text);
DROP FUNCTION IF EXISTS public.withdraw_from_goal(uuid, numeric, text);
DROP TABLE    IF EXISTS public.transfer_otps;        -- client-issued OTPs were forgeable

DROP POLICY IF EXISTS "Users can insert own wallet"       ON public.wallets;
DROP POLICY IF EXISTS "Users can update own wallet"       ON public.wallets;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

-- Belt and braces: even if a policy is added by mistake, the grant is gone.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.wallets, public.transactions, public.audit_logs
  FROM anon, authenticated;
REVOKE UPDATE ON public.users FROM anon, authenticated;       -- editable data lives in profiles
REVOKE ALL ON public.users, public.wallets, public.transactions, public.audit_logs,
              public.beneficiaries, public.budgets, public.savings_goals FROM anon;

-- ---------------------------------------------------------------------
-- 2. profiles + notifications (used by the app, previously missing)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  email       text,
  avatar_url  text,
  currency    text NOT NULL DEFAULT 'PKR',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE ALL ON public.profiles FROM anon;
REVOKE INSERT, DELETE, TRUNCATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT  UPDATE (full_name, avatar_url, currency, updated_at) ON public.profiles TO authenticated;

CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  message     text NOT NULL,
  type        text NOT NULL DEFAULT 'info',
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications"   ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.notifications FROM anon;
REVOKE INSERT, DELETE, TRUNCATE, UPDATE ON public.notifications FROM authenticated;
GRANT  UPDATE (is_read) ON public.notifications TO authenticated;     -- only "mark as read"
CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

DO $$
BEGIN  -- realtime is optional locally, present on Supabase
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables
                     WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 3. Transaction PIN (server-verified, hashed, with lockout)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transaction_pins (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash        text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transaction_pins ENABLE ROW LEVEL SECURITY;      -- no policies: clients can't touch it
REVOKE ALL ON public.transaction_pins FROM anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Constraints, canonical amount sign, indexes
-- ---------------------------------------------------------------------
-- wallets
UPDATE public.wallets SET balance = 0 WHERE balance IS NULL;
ALTER TABLE public.wallets ALTER COLUMN balance SET DEFAULT 0;
ALTER TABLE public.wallets ALTER COLUMN balance SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_user_id_key') THEN
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_balance_nonneg') THEN
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_nonneg CHECK (balance >= 0) NOT VALID;
  END IF;
END $$;

-- transactions: new columns
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS reference       text,
  ADD COLUMN IF NOT EXISTS balance_after   numeric,
  ADD COLUMN IF NOT EXISTS note            text,
  ADD COLUMN IF NOT EXISTS beneficiary_id  bigint REFERENCES public.beneficiaries(id) ON DELETE SET NULL;

-- canonical sign: income > 0 ; expense & transfer < 0
UPDATE public.transactions SET amount = -abs(amount) WHERE type IN ('expense', 'transfer') AND amount > 0;
UPDATE public.transactions SET amount =  abs(amount) WHERE type = 'income' AND amount < 0;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_amount_sign') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_amount_sign CHECK (
      (type = 'income' AND amount > 0) OR (type IN ('expense', 'transfer') AND amount < 0)
    ) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_status_valid') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_valid
      CHECK (status IN ('pending', 'completed', 'failed', 'reversed')) NOT VALID;
  END IF;
  BEGIN
    ALTER TABLE public.transactions VALIDATE CONSTRAINT transactions_amount_sign;
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Some legacy rows still violate transactions_amount_sign; constraint left NOT VALID (new rows are enforced).';
  END;
END $$;

-- idempotency is per user, not global
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_idempotency_key_key;
CREATE UNIQUE INDEX IF NOT EXISTS transactions_user_idem_uidx
  ON public.transactions (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS transactions_reference_uidx
  ON public.transactions (reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_user_created_idx
  ON public.transactions (user_id, created_at DESC);

-- savings goals / budgets sanity
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'goals_amounts_valid') THEN
    ALTER TABLE public.savings_goals ADD CONSTRAINT goals_amounts_valid
      CHECK (current_amount >= 0 AND target_amount > 0 AND current_amount <= target_amount) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budgets_amount_valid') THEN
    ALTER TABLE public.budgets ADD CONSTRAINT budgets_amount_valid CHECK (amount > 0) NOT VALID;
  END IF;
END $$;
-- goals: the client may rename / delete, but money fields only move through RPCs
REVOKE UPDATE ON public.savings_goals FROM authenticated;
GRANT  UPDATE (name, color, target_amount) ON public.savings_goals TO authenticated;
REVOKE INSERT ON public.savings_goals FROM authenticated;
GRANT  INSERT (user_id, name, target_amount, color) ON public.savings_goals TO authenticated;

-- IBAN: ISO 13616 mod-97 check on top of the Pakistani format
CREATE OR REPLACE FUNCTION public.is_valid_pk_iban(p_iban text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE
  v_rearranged text;
  v_numeric    text := '';
  v_char       text;
  i            integer;
BEGIN
  IF p_iban IS NULL OR p_iban !~ '^PK\d{2}[A-Z]{4}\d{16}$' THEN RETURN false; END IF;
  v_rearranged := substr(p_iban, 5) || substr(p_iban, 1, 4);
  FOR i IN 1..length(v_rearranged) LOOP
    v_char := substr(v_rearranged, i, 1);
    IF v_char ~ '[A-Z]' THEN v_numeric := v_numeric || (ascii(v_char) - 55)::text;
    ELSE v_numeric := v_numeric || v_char; END IF;
  END LOOP;
  RETURN (v_numeric::numeric % 97) = 1;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'beneficiaries_iban_checksum') THEN
    ALTER TABLE public.beneficiaries ADD CONSTRAINT beneficiaries_iban_checksum
      CHECK (public.is_valid_pk_iban(iban)) NOT VALID;     -- enforced for all new rows
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.beneficiaries GROUP BY user_id, iban HAVING count(*) > 1) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS beneficiaries_user_iban_uidx ON public.beneficiaries (user_id, iban);
  ELSE
    RAISE NOTICE 'Duplicate (user_id, iban) beneficiaries exist; unique index skipped.';
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS beneficiaries_user_idx ON public.beneficiaries (user_id);
CREATE INDEX IF NOT EXISTS savings_goals_user_idx ON public.savings_goals (user_id);
CREATE INDEX IF NOT EXISTS budgets_user_idx       ON public.budgets (user_id);

-- ---------------------------------------------------------------------
-- 5. Signup trigger (profile + wallet + welcome bonus), idempotent
--    NOTE: if your remote project already has a trigger on auth.users that
--    creates these rows, drop it first (see docs/SECURITY.md, "Deploying").
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_name  text := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(COALESCE(NEW.email, 'user'), '@', 1));
  v_bonus numeric := 50000;   -- sandbox welcome balance (simulated money)
  v_new_wallet uuid;
BEGIN
  INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, COALESCE(NEW.email, NEW.id::text || '@no-email.local'), v_name)
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, v_name, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.wallets (user_id, balance, currency, wallet_type)
    VALUES (NEW.id, v_bonus, 'PKR', 'main')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_new_wallet;
  IF v_new_wallet IS NOT NULL THEN        -- keep ledger == balance from day one
    INSERT INTO public.transactions
      (user_id, amount, type, category, description, status, currency, balance_after, reference, idempotency_key)
    VALUES
      (NEW.id, v_bonus, 'income', 'Bonus', 'Welcome bonus (sandbox money)', 'completed', 'PKR', v_bonus,
       'PW-' || upper(encode(extensions.gen_random_bytes(5), 'hex')), 'welcome-' || NEW.id::text);
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- back-fill profile rows for users that pre-date this migration
INSERT INTO public.profiles (id, full_name, email)
  SELECT u.id, COALESCE(NULLIF(u.name, ''), split_part(u.email, '@', 1)), u.email
  FROM public.users u
  ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 6. Private helpers
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.audit(p_user uuid, p_action text, p_status text, p_payload jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  INSERT INTO public.audit_logs (user_id, action, status, payload) VALUES (p_user, p_action, p_status, p_payload);
$$;

-- returns: ok | not_set | wrong | locked.  Counters are persisted because callers RETURN, not RAISE.
CREATE OR REPLACE FUNCTION private.verify_pin(p_user uuid, p_pin text, OUT result text, OUT attempts_left integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_row public.transaction_pins%ROWTYPE;
  c_max_attempts CONSTANT integer := 5;
BEGIN
  SELECT * INTO v_row FROM public.transaction_pins WHERE user_id = p_user FOR UPDATE;
  IF NOT FOUND THEN result := 'not_set'; attempts_left := 0; RETURN; END IF;

  IF v_row.locked_until IS NOT NULL AND v_row.locked_until > now() THEN
    result := 'locked'; attempts_left := 0; RETURN;
  END IF;

  IF p_pin IS NOT NULL AND v_row.pin_hash = extensions.crypt(p_pin, v_row.pin_hash) THEN
    UPDATE public.transaction_pins SET failed_attempts = 0, locked_until = NULL WHERE user_id = p_user;
    result := 'ok'; attempts_left := c_max_attempts; RETURN;
  END IF;

  UPDATE public.transaction_pins
     SET failed_attempts = CASE WHEN failed_attempts + 1 >= c_max_attempts THEN 0 ELSE failed_attempts + 1 END,
         locked_until    = CASE WHEN failed_attempts + 1 >= c_max_attempts THEN now() + interval '15 minutes' ELSE NULL END
   WHERE user_id = p_user
  RETURNING c_max_attempts - failed_attempts INTO attempts_left;

  IF attempts_left IS NULL OR attempts_left >= c_max_attempts THEN   -- the update just locked the account
    result := 'locked'; attempts_left := 0;
  ELSE
    result := 'wrong';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION private.fresh_totp(p_window_seconds integer DEFAULT 300)
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT COALESCE(auth.jwt() ->> 'aal', '') = 'aal2'
     AND EXISTS (
       SELECT 1 FROM jsonb_array_elements(COALESCE(auth.jwt() -> 'amr', '[]'::jsonb)) a
       WHERE a ->> 'method' = 'totp'
         AND (a ->> 'timestamp')::bigint > extract(epoch FROM now())::bigint - p_window_seconds
     );
$$;

CREATE OR REPLACE FUNCTION private.has_verified_totp(p_user uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.mfa_factors WHERE user_id = p_user AND status = 'verified' AND factor_type = 'totp');
EXCEPTION WHEN undefined_table OR undefined_column THEN
  RETURN false;
END $$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. PIN management RPCs
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_transaction_pin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.transaction_pins WHERE user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.set_transaction_pin(p_pin text, p_current_pin text DEFAULT NULL)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_exists boolean;
  v_check record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_pin IS NULL OR p_pin !~ '^\d{6}$' THEN
    RETURN json_build_object('success', false, 'code', 'pin_format');
  END IF;
  IF p_pin ~ '^(\d)\1{5}$'
     OR p_pin IN ('012345','123456','234567','345678','456789','987654','876543','765432','654321','543210') THEN
    RETURN json_build_object('success', false, 'code', 'pin_too_weak');
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.transaction_pins WHERE user_id = v_uid) INTO v_exists;
  IF v_exists THEN
    SELECT * INTO v_check FROM private.verify_pin(v_uid, p_current_pin);
    IF v_check.result <> 'ok' THEN
      PERFORM private.audit(v_uid, 'PIN_CHANGE', 'FAILED', jsonb_build_object('reason', v_check.result));
      RETURN json_build_object('success', false, 'code', CASE v_check.result WHEN 'locked' THEN 'pin_locked' ELSE 'wrong_pin' END,
                               'attempts_left', v_check.attempts_left);
    END IF;
  END IF;

  INSERT INTO public.transaction_pins (user_id, pin_hash, failed_attempts, locked_until, updated_at)
  VALUES (v_uid, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)), 0, NULL, now())
  ON CONFLICT (user_id) DO UPDATE
     SET pin_hash = EXCLUDED.pin_hash, failed_attempts = 0, locked_until = NULL, updated_at = now();

  PERFORM private.audit(v_uid, CASE WHEN v_exists THEN 'PIN_CHANGE' ELSE 'PIN_SET' END, 'SUCCESS', '{}'::jsonb);
  RETURN json_build_object('success', true, 'code', 'ok');
END $$;

-- ---------------------------------------------------------------------
-- 8. execute_transfer  (the only way money leaves a wallet)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.execute_transfer(
  p_amount          numeric,
  p_beneficiary_id  bigint,
  p_note            text,
  p_idempotency_key text,
  p_pin             text
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  c_per_tx_limit  CONSTANT numeric := 50000;
  c_daily_limit   CONSTANT numeric := 100000;
  c_mfa_threshold CONSTANT numeric := 10000;
  c_tz            CONSTANT text    := 'Asia/Karachi';

  v_uid        uuid := auth.uid();
  v_wallet_id  uuid;
  v_balance    numeric;
  v_ben        public.beneficiaries%ROWTYPE;
  v_prior      public.transactions%ROWTYPE;
  v_day_start  timestamptz;
  v_today      numeric;
  v_pin        record;
  v_new_bal    numeric;
  v_tx_id      uuid;
  v_ref        text;
  v_note       text := NULLIF(left(btrim(COALESCE(p_note, '')), 140), '');

  fail_code text;
  fail_extra jsonb := '{}'::jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  IF p_amount IS NULL OR p_amount <= 0 OR p_amount <> round(p_amount, 2) OR p_amount > 1000000000 THEN
    PERFORM private.audit(v_uid, 'TRANSFER', 'FAILED', jsonb_build_object('code', 'invalid_amount'));
    RETURN json_build_object('success', false, 'code', 'invalid_amount');
  END IF;
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) NOT BETWEEN 8 AND 100 THEN
    RETURN json_build_object('success', false, 'code', 'invalid_request');
  END IF;

  -- Serialise every money operation of this user (also makes idempotency race-free)
  SELECT id, balance INTO v_wallet_id, v_balance FROM public.wallets WHERE user_id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'code', 'wallet_not_found');
  END IF;

  -- Idempotent replay: same key => same result, no second debit
  SELECT * INTO v_prior FROM public.transactions WHERE user_id = v_uid AND idempotency_key = p_idempotency_key;
  IF FOUND THEN
    RETURN json_build_object('success', true, 'replayed', true,
      'transaction_id', v_prior.id, 'reference', v_prior.reference,
      'new_balance', v_prior.balance_after, 'amount', abs(v_prior.amount),
      'created_at', v_prior.created_at);
  END IF;

  -- Beneficiary must belong to the caller (never trust a client-supplied name)
  SELECT * INTO v_ben FROM public.beneficiaries WHERE id = p_beneficiary_id AND user_id = v_uid;
  IF NOT FOUND THEN fail_code := 'invalid_beneficiary'; END IF;

  IF fail_code IS NULL AND p_amount > c_per_tx_limit THEN
    fail_code := 'per_tx_limit'; fail_extra := jsonb_build_object('limit', c_per_tx_limit);
  END IF;

  IF fail_code IS NULL THEN
    v_day_start := date_trunc('day', now() AT TIME ZONE c_tz) AT TIME ZONE c_tz;
    SELECT COALESCE(sum(-amount), 0) INTO v_today FROM public.transactions
     WHERE user_id = v_uid AND type = 'transfer' AND status = 'completed' AND created_at >= v_day_start;
    IF v_today + p_amount > c_daily_limit THEN
      fail_code := 'daily_limit';
      fail_extra := jsonb_build_object('limit', c_daily_limit, 'used_today', v_today);
    END IF;
  END IF;

  IF fail_code IS NULL AND v_balance < p_amount THEN
    fail_code := 'insufficient_funds'; fail_extra := jsonb_build_object('available', v_balance);
  END IF;

  -- Step-up: a TOTP code verified in the last 5 minutes (checked in the signed JWT, not the client)
  IF fail_code IS NULL AND p_amount >= c_mfa_threshold AND NOT private.fresh_totp(300) THEN
    fail_code := CASE WHEN private.has_verified_totp(v_uid) THEN 'mfa_required' ELSE 'mfa_not_enrolled' END;
    fail_extra := jsonb_build_object('threshold', c_mfa_threshold);
  END IF;

  -- Transaction PIN last: the attempt counter only moves when everything else is already valid
  IF fail_code IS NULL THEN
    SELECT * INTO v_pin FROM private.verify_pin(v_uid, p_pin);
    IF v_pin.result = 'not_set' THEN fail_code := 'pin_not_set';
    ELSIF v_pin.result = 'locked' THEN fail_code := 'pin_locked';
    ELSIF v_pin.result = 'wrong' THEN
      fail_code := 'wrong_pin'; fail_extra := jsonb_build_object('attempts_left', v_pin.attempts_left);
    END IF;
  END IF;

  IF fail_code IS NOT NULL THEN
    PERFORM private.audit(v_uid, 'TRANSFER', 'FAILED',
      jsonb_build_object('code', fail_code, 'amount', p_amount, 'beneficiary_id', p_beneficiary_id));
    RETURN ((json_build_object('success', false, 'code', fail_code)::jsonb) || fail_extra)::json;
  END IF;

  v_new_bal := v_balance - p_amount;
  v_ref := 'PW-' || upper(encode(extensions.gen_random_bytes(5), 'hex'));

  UPDATE public.wallets SET balance = v_new_bal, updated_at = now() WHERE id = v_wallet_id;

  INSERT INTO public.transactions
    (user_id, amount, type, category, description, note, status, currency,
     idempotency_key, reference, balance_after, beneficiary_id)
  VALUES
    (v_uid, -p_amount, 'transfer', 'Transfer', 'Transfer to ' || v_ben.name, v_note, 'completed', 'PKR',
     p_idempotency_key, v_ref, v_new_bal, v_ben.id)
  RETURNING id INTO v_tx_id;

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_uid, 'Transfer sent',
          'Rs. ' || to_char(p_amount, 'FM999,999,990.00') || ' sent to ' || v_ben.name || ' (' || v_ref || ')',
          'transfer');

  PERFORM private.audit(v_uid, 'TRANSFER', 'SUCCESS',
    jsonb_build_object('amount', p_amount, 'beneficiary_id', v_ben.id, 'reference', v_ref));

  RETURN json_build_object('success', true, 'replayed', false,
    'transaction_id', v_tx_id, 'reference', v_ref, 'new_balance', v_new_bal, 'amount', p_amount,
    'beneficiary', json_build_object('name', v_ben.name, 'bank', v_ben.bank,
                                     'iban_masked', left(v_ben.iban, 4) || repeat('•', 12) || right(v_ben.iban, 4)),
    'created_at', now());
END $$;

-- ---------------------------------------------------------------------
-- 9. Savings goals: wallet <-> goal moves (same guarantees)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.move_goal_funds(p_direction text, p_goal_id uuid, p_amount numeric, p_key text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_wallet_id uuid; v_balance numeric;
  v_goal public.savings_goals%ROWTYPE;
  v_prior public.transactions%ROWTYPE;
  v_new_balance numeric; v_new_goal numeric;
  v_action text := CASE p_direction WHEN 'in' THEN 'GOAL_CONTRIBUTE' ELSE 'GOAL_WITHDRAW' END;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount <> round(p_amount, 2) OR p_amount > 1000000000 THEN
    RETURN json_build_object('success', false, 'code', 'invalid_amount');
  END IF;
  IF p_key IS NULL OR length(p_key) NOT BETWEEN 8 AND 100 THEN
    RETURN json_build_object('success', false, 'code', 'invalid_request');
  END IF;

  -- lock order is always wallet -> goal (no deadlocks between the two RPCs)
  SELECT id, balance INTO v_wallet_id, v_balance FROM public.wallets WHERE user_id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'code', 'wallet_not_found'); END IF;

  SELECT * INTO v_prior FROM public.transactions WHERE user_id = v_uid AND idempotency_key = p_key;
  IF FOUND THEN
    RETURN json_build_object('success', true, 'replayed', true, 'reference', v_prior.reference,
                             'new_wallet_balance', v_prior.balance_after);
  END IF;

  SELECT * INTO v_goal FROM public.savings_goals WHERE id = p_goal_id AND user_id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'code', 'goal_not_found'); END IF;

  IF p_direction = 'in' THEN
    IF v_balance < p_amount THEN v_code := 'insufficient_funds';
    ELSIF v_goal.current_amount + p_amount > v_goal.target_amount THEN v_code := 'exceeds_target'; END IF;
  ELSE
    IF v_goal.current_amount < p_amount THEN v_code := 'insufficient_goal_funds'; END IF;
  END IF;
  IF v_code IS NOT NULL THEN
    PERFORM private.audit(v_uid, v_action, 'FAILED', jsonb_build_object('code', v_code, 'goal_id', p_goal_id, 'amount', p_amount));
    RETURN json_build_object('success', false, 'code', v_code);
  END IF;

  IF p_direction = 'in' THEN
    v_new_balance := v_balance - p_amount; v_new_goal := v_goal.current_amount + p_amount;
  ELSE
    v_new_balance := v_balance + p_amount; v_new_goal := v_goal.current_amount - p_amount;
  END IF;

  UPDATE public.wallets       SET balance = v_new_balance, updated_at = now() WHERE id = v_wallet_id;
  UPDATE public.savings_goals SET current_amount = v_new_goal, updated_at = now() WHERE id = p_goal_id;

  INSERT INTO public.transactions
    (user_id, amount, type, category, description, status, currency, idempotency_key, goal_id, reference, balance_after)
  VALUES
    (v_uid, CASE p_direction WHEN 'in' THEN -p_amount ELSE p_amount END,
     CASE p_direction WHEN 'in' THEN 'expense' ELSE 'income' END, 'Savings',
     CASE p_direction WHEN 'in' THEN 'Contributed to ' ELSE 'Withdrawn from ' END || v_goal.name,
     'completed', 'PKR', p_key, p_goal_id,
     'PW-' || upper(encode(extensions.gen_random_bytes(5), 'hex')), v_new_balance);

  PERFORM private.audit(v_uid, v_action, 'SUCCESS', jsonb_build_object('goal_id', p_goal_id, 'amount', p_amount));
  RETURN json_build_object('success', true, 'replayed', false,
                           'new_wallet_balance', v_new_balance, 'new_goal_amount', v_new_goal);
END $$;

CREATE OR REPLACE FUNCTION public.contribute_to_goal(p_goal_id uuid, p_amount numeric, p_idempotency_key text)
RETURNS json LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT private.move_goal_funds('in', p_goal_id, p_amount, p_idempotency_key);
$$;
CREATE OR REPLACE FUNCTION public.withdraw_from_goal(p_goal_id uuid, p_amount numeric, p_idempotency_key text)
RETURNS json LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT private.move_goal_funds('out', p_goal_id, p_amount, p_idempotency_key);
$$;

-- ---------------------------------------------------------------------
-- 10. Ledger integrity check (admin / CI only, not exposed to clients)
--     balance must always equal the sum of that wallet's transactions
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW private.ledger_drift AS
  SELECT w.user_id, w.balance AS wallet_balance,
         COALESCE(t.total, 0) AS ledger_total,
         w.balance - COALESCE(t.total, 0) AS drift
  FROM public.wallets w
  LEFT JOIN (SELECT user_id, sum(amount) AS total FROM public.transactions WHERE status = 'completed' GROUP BY user_id) t
    ON t.user_id = w.user_id;

-- ---------------------------------------------------------------------
-- 11. Grants: only signed-in users may call the RPCs
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.execute_transfer(numeric, bigint, text, text, text)      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.contribute_to_goal(uuid, numeric, text)                   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.withdraw_from_goal(uuid, numeric, text)                   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_transaction_pin(text, text)                           FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_transaction_pin()                                     FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.execute_transfer(numeric, bigint, text, text, text)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.contribute_to_goal(uuid, numeric, text)                TO authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_from_goal(uuid, numeric, text)                TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_transaction_pin(text, text)                        TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_transaction_pin()                                  TO authenticated;

-- helpers created after the first REVOKE (section 6) must be locked down too
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon, authenticated;
