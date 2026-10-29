-- 1. Strict Pakistani IBAN format par database CHECK constraint lagayein
-- Format: PK + 2 digits + 4 letters (Bank Code) + 16 digits (Account Number) = 24 chars
ALTER TABLE public.beneficiaries
ADD CONSTRAINT check_pakistani_iban
CHECK (iban ~ '^PK\d{2}[A-Z]{4}\d{16}$');

-- 2. execute_transfer function ko update karein taake Daily Limit lag sake
CREATE OR REPLACE FUNCTION execute_transfer(
  p_amount NUMERIC,
  p_recipient_id BIGINT,
  p_recipient_name TEXT,
  p_note TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_existing_tx_id UUID;
  v_daily_transfer_total NUMERIC;
  v_daily_limit NUMERIC := 100000.00; -- 1 Lakh Daily Limit
  v_per_tx_limit NUMERIC := 50000.00; -- 50k Per Transaction Limit
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Per transaction limit check
  IF p_amount > v_per_tx_limit THEN
    RAISE EXCEPTION 'Transaction amount exceeds the per-transfer limit of Rs. %', v_per_tx_limit;
  END IF;

  -- Idempotency check (Duplicate protection)
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_tx_id FROM public.transactions WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RAISE EXCEPTION 'Duplicate request detected. This transfer was already processed.';
    END IF;
  END IF;

  -- Calculate today's total transfers
  SELECT COALESCE(SUM(amount), 0) INTO v_daily_transfer_total
  FROM public.transactions
  WHERE user_id = v_user_id
    AND type = 'transfer'
    AND status = 'completed'
    AND created_at >= CURRENT_DATE;

  -- Daily limit check
  IF (v_daily_transfer_total + p_amount) > v_daily_limit THEN
    RAISE EXCEPTION 'Daily transfer limit exceeded. You have transferred Rs. % today. Limit is Rs. %', v_daily_transfer_total, v_daily_limit;
  END IF;

  -- Lock wallet (FOR UPDATE)
  SELECT balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF v_current_balance < p_amount THEN
    INSERT INTO public.audit_logs (user_id, action, status, payload)
    VALUES (v_user_id, 'TRANSFER', 'FAILED', jsonb_build_object('amount', p_amount, 'reason', 'Insufficient balance'));
    
    RAISE EXCEPTION 'Insufficient balance. Available: Rs. %', v_current_balance;
  END IF;

  -- Balance Deduct
  UPDATE public.wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Insert Transaction
  INSERT INTO public.transactions (
    user_id, amount, type, category, description, status, currency, idempotency_key
  ) VALUES (
    v_user_id, p_amount, 'transfer', 'Transfer', COALESCE(p_note, 'Transfer to ' || p_recipient_name), 'completed', 'PKR', p_idempotency_key
  );

  -- Insert Audit Log
  INSERT INTO public.audit_logs (user_id, action, status, payload)
  VALUES (v_user_id, 'TRANSFER', 'SUCCESS', jsonb_build_object('amount', p_amount, 'recipient', p_recipient_name));

  RETURN json_build_object('success', true, 'new_balance', v_current_balance - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;