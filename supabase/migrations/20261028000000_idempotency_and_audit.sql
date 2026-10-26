-- 1. Transactions table mein Idempotency Key column add karein
ALTER TABLE public.transactions 
ADD COLUMN idempotency_key TEXT UNIQUE;

-- 2. Audit Log table banayein
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Enable karein Audit Logs par (Sirf user apna log dekh sake)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs" 
  ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);

-- 4. Purana execute_transfer function update karein (Idempotency aur Audit log ke sath)
CREATE OR REPLACE FUNCTION execute_transfer(
  p_amount NUMERIC,
  p_recipient_id BIGINT,
  p_recipient_name TEXT,
  p_note TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL -- Naya parameter
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_existing_tx_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ✅ IDEMPOTENCY CHECK (Agar same key pehle aayi hai toh error dein)
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_tx_id FROM public.transactions WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RAISE EXCEPTION 'Duplicate request detected. This transfer was already processed.';
    END IF;
  END IF;

  -- LOCK WALLET (FOR UPDATE)
  SELECT balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF v_current_balance < p_amount THEN
    -- AUDIT LOG: Failed Transaction
    INSERT INTO public.audit_logs (user_id, action, status, payload)
    VALUES (v_user_id, 'TRANSFER', 'FAILED', jsonb_build_object('amount', p_amount, 'reason', 'Insufficient balance'));
    
    RAISE EXCEPTION 'Insufficient balance. Available: Rs. %', v_current_balance;
  END IF;

  -- Balance Deduct
  UPDATE public.wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Insert Transaction Record
  INSERT INTO public.transactions (
    user_id, amount, type, category, description, status, currency, idempotency_key
  ) VALUES (
    v_user_id, p_amount, 'transfer', 'Transfer', COALESCE(p_note, 'Transfer to ' || p_recipient_name), 'completed', 'PKR', p_idempotency_key
  );

  -- AUDIT LOG: Successful Transaction
  INSERT INTO public.audit_logs (user_id, action, status, payload)
  VALUES (v_user_id, 'TRANSFER', 'SUCCESS', jsonb_build_object('amount', p_amount, 'recipient', p_recipient_name));

  RETURN json_build_object('success', true, 'new_balance', v_current_balance - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;