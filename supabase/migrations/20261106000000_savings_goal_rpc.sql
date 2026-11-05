-- Add goal_id to transactions for tracking savings movements
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.savings_goals(id) ON DELETE SET NULL;

-- ─── Contribute to Goal ───
CREATE OR REPLACE FUNCTION contribute_to_goal(
  p_goal_id UUID,
  p_amount NUMERIC,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_wallet_balance NUMERIC;
  v_goal_current NUMERIC;
  v_goal_target NUMERIC;
  v_goal_name TEXT;
  v_existing_tx UUID;
  v_new_wallet_balance NUMERIC;
  v_new_goal_amount NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be greater than 0'; END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_tx FROM public.transactions WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN RAISE EXCEPTION 'Duplicate request detected'; END IF;
  END IF;

  SELECT current_amount, target_amount, name INTO v_goal_current, v_goal_target, v_goal_name
  FROM public.savings_goals
  WHERE id = p_goal_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Goal not found or unauthorized'; END IF;
  IF v_goal_current + p_amount > v_goal_target THEN
    RAISE EXCEPTION 'Contribution exceeds goal target (Rs. %)', v_goal_target;
  END IF;

  SELECT balance INTO v_wallet_balance
  FROM public.wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_wallet_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Available: Rs. %', v_wallet_balance;
  END IF;

  v_new_wallet_balance := v_wallet_balance - p_amount;
  v_new_goal_amount := v_goal_current + p_amount;

  UPDATE public.wallets SET balance = v_new_wallet_balance, updated_at = NOW() WHERE user_id = v_user_id;
  UPDATE public.savings_goals SET current_amount = v_new_goal_amount, updated_at = NOW() WHERE id = p_goal_id;

  INSERT INTO public.transactions (user_id, amount, type, category, description, status, currency, idempotency_key, goal_id)
  VALUES (v_user_id, -p_amount, 'expense', 'Savings', 'Contributed to ' || v_goal_name, 'completed', 'PKR', p_idempotency_key, p_goal_id);

  INSERT INTO public.audit_logs (user_id, action, status, payload)
  VALUES (v_user_id, 'GOAL_CONTRIBUTE', 'SUCCESS', jsonb_build_object('goal_id', p_goal_id, 'amount', p_amount));

  RETURN json_build_object('success', true, 'new_wallet_balance', v_new_wallet_balance, 'new_goal_amount', v_new_goal_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Withdraw from Goal ───
CREATE OR REPLACE FUNCTION withdraw_from_goal(
  p_goal_id UUID,
  p_amount NUMERIC,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_wallet_balance NUMERIC;
  v_goal_current NUMERIC;
  v_goal_name TEXT;
  v_existing_tx UUID;
  v_new_wallet_balance NUMERIC;
  v_new_goal_amount NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be greater than 0'; END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_tx FROM public.transactions WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN RAISE EXCEPTION 'Duplicate request detected'; END IF;
  END IF;

  SELECT current_amount, name INTO v_goal_current, v_goal_name
  FROM public.savings_goals
  WHERE id = p_goal_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Goal not found or unauthorized'; END IF;
  IF v_goal_current < p_amount THEN
    RAISE EXCEPTION 'Insufficient goal balance. Available: Rs. %', v_goal_current;
  END IF;

  SELECT balance INTO v_wallet_balance
  FROM public.wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  v_new_wallet_balance := v_wallet_balance + p_amount;
  v_new_goal_amount := v_goal_current - p_amount;

  UPDATE public.wallets SET balance = v_new_wallet_balance, updated_at = NOW() WHERE user_id = v_user_id;
  UPDATE public.savings_goals SET current_amount = v_new_goal_amount, updated_at = NOW() WHERE id = p_goal_id;

  INSERT INTO public.transactions (user_id, amount, type, category, description, status, currency, idempotency_key, goal_id)
  VALUES (v_user_id, p_amount, 'income', 'Savings', 'Withdrawn from ' || v_goal_name, 'completed', 'PKR', p_idempotency_key, p_goal_id);

  INSERT INTO public.audit_logs (user_id, action, status, payload)
  VALUES (v_user_id, 'GOAL_WITHDRAW', 'SUCCESS', jsonb_build_object('goal_id', p_goal_id, 'amount', p_amount));

  RETURN json_build_object('success', true, 'new_wallet_balance', v_new_wallet_balance, 'new_goal_amount', v_new_goal_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;