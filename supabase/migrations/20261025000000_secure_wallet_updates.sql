-- 1. Client ki direct UPDATE permission ko band karein
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;

-- 2. Secure Server-Side Function (RPC) banayein
CREATE OR REPLACE FUNCTION transfer_funds(
  p_amount NUMERIC,
  p_recipient_id BIGINT,
  p_recipient_name TEXT,
  p_note TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
BEGIN
  -- User ID check karein
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Row ko lock karein taake ek waqt mein ek hi transaction ho (Race condition se bachne ke liye)
  SELECT balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Balance check karein (Backend par, frontend par nahi)
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: Rs. %', v_current_balance;
  END IF;

  -- Balance deduct karein
  UPDATE public.wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Transaction record insert karein
  INSERT INTO public.transactions (
    user_id, amount, type, category, description, status, currency
  ) VALUES (
    v_user_id, p_amount, 'transfer', 'Transfer', COALESCE(p_note, 'Transfer to ' || p_recipient_name), 'completed', 'PKR'
  );

  -- Nayi balance return karein
  RETURN json_build_object('success', true, 'new_balance', v_current_balance - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;