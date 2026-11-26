-- 1. Create OTP Table
CREATE TABLE IF NOT EXISTS public.transfer_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transfer_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own OTPs" ON public.transfer_otps
  FOR ALL USING (auth.uid() = user_id);

-- 2. Update execute_transfer RPC with OTP Check
CREATE OR REPLACE FUNCTION execute_transfer(
  p_amount NUMERIC,
  p_recipient_id BIGINT,
  p_recipient_name TEXT,
  p_note TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_otp TEXT DEFAULT NULL -- ✅ Naya Parameter
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_existing_tx_id UUID;
  v_daily_transfer_total NUMERIC;
  v_daily_limit NUMERIC := 100000.00;
  v_per_tx_limit NUMERIC := 50000.00;
  v_otp_threshold NUMERIC := 10000.00; -- ✅ Threshold 10k
  v_valid_otp UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- ✅ OTP Step-up Check
  IF p_amount >= v_otp_threshold THEN
    IF p_otp IS NULL THEN 
      RAISE EXCEPTION 'OTP required for transfers above Rs. %', v_otp_threshold; 
    END IF;

    SELECT id INTO v_valid_otp FROM public.transfer_otps 
    WHERE user_id = v_user_id AND otp_code = p_otp AND expires_at > NOW() LIMIT 1;
    
    IF v_valid_otp IS NULL THEN 
      RAISE EXCEPTION 'Invalid or expired OTP.'; 
    END IF;
    
    DELETE FROM public.transfer_otps WHERE id = v_valid_otp; -- Consume OTP
  END IF;

  -- Limits
  IF p_amount > v_per_tx_limit THEN RAISE EXCEPTION 'Transaction amount exceeds the per-transfer limit of Rs. %', v_per_tx_limit; END IF;
  
  -- Idempotency
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_tx_id FROM public.transactions WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN RAISE EXCEPTION 'Duplicate request detected. This transfer was already processed.'; END IF;
  END IF;

  -- Daily Limit
  SELECT COALESCE(SUM(amount), 0) INTO v_daily_transfer_total
  FROM public.transactions
  WHERE user_id = v_user_id AND type = 'transfer' AND status = 'completed' AND created_at >= CURRENT_DATE;

  IF (v_daily_transfer_total + p_amount) > v_daily_limit THEN
    RAISE EXCEPTION 'Daily transfer limit exceeded. You have transferred Rs. % today. Limit is Rs. %', v_daily_transfer_total, v_daily_limit;
  END IF;

  -- Lock Wallet
  SELECT balance INTO v_current_balance FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_current_balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance...'; END IF;

  -- Deduct and Insert
  UPDATE public.wallets SET balance = balance - p_amount, updated_at = NOW() WHERE user_id = v_user_id;
  
  INSERT INTO public.transactions (
    user_id, amount, type, category, description, status, currency, idempotency_key
  ) VALUES (
    v_user_id, p_amount, 'transfer', 'Transfer', COALESCE(p_note, 'Transfer to ' || p_recipient_name), 'completed', 'PKR', p_idempotency_key
  );

  INSERT INTO public.audit_logs (user_id, action, status, payload) 
  VALUES (v_user_id, 'TRANSFER', 'SUCCESS', jsonb_build_object('amount', p_amount, 'recipient', p_recipient_name));

  RETURN json_build_object('success', true, 'new_balance', v_current_balance - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;