-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- 2. Policies for 'users' table
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Policies for 'wallets' table
CREATE POLICY "Users can view own wallet" 
  ON public.wallets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" 
  ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" 
  ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- 4. Policies for 'transactions' table
CREATE POLICY "Users can view own transactions" 
  ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Policies for 'beneficiaries' table
CREATE POLICY "Users can view own beneficiaries" 
  ON public.beneficiaries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beneficiaries" 
  ON public.beneficiaries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries" 
  ON public.beneficiaries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own beneficiaries" 
  ON public.beneficiaries FOR DELETE USING (auth.uid() = user_id);

-- 6. Policies for 'budgets' table
CREATE POLICY "Users can view own budgets" 
  ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" 
  ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" 
  ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" 
  ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- 7. Policies for 'savings_goals' table
CREATE POLICY "Users can view own goals" 
  ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" 
  ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
  ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" 
  ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);