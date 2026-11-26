-- =====================================================================
-- Pennywise | Real dashboard insights (replaces the hard-coded chart data)
-- One round trip: monthly cash-flow, closing balance per month, spending
-- by category and totals, all computed from the user's own ledger.
-- SECURITY INVOKER => RLS applies; months are bucketed in Asia/Karachi.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_insights(p_months integer DEFAULT 6)
RETURNS json LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  c_tz CONSTANT text := 'Asia/Karachi';
  v_uid      uuid := auth.uid();
  v_months   integer := LEAST(GREATEST(COALESCE(p_months, 6), 1), 24);
  v_from     timestamptz;
  v_balance  numeric;
  v_cashflow json;
  v_categories json;
  v_income   numeric;
  v_expenses numeric;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  v_from := (date_trunc('month', now() AT TIME ZONE c_tz) - make_interval(months => v_months - 1)) AT TIME ZONE c_tz;
  SELECT COALESCE(balance, 0) INTO v_balance FROM public.wallets WHERE user_id = v_uid;
  v_balance := COALESCE(v_balance, 0);

  WITH months AS (
    SELECT (date_trunc('month', now() AT TIME ZONE c_tz) - make_interval(months => g)) AS local_start
    FROM generate_series(v_months - 1, 0, -1) AS g
  ), agg AS (
    SELECT m.local_start,
           COALESCE(sum(t.amount) FILTER (WHERE t.amount > 0), 0)  AS income,
           COALESCE(-sum(t.amount) FILTER (WHERE t.amount < 0), 0) AS expenses
    FROM months m
    LEFT JOIN public.transactions t
      ON t.user_id = v_uid AND t.status = 'completed'
     AND t.created_at >= (m.local_start AT TIME ZONE c_tz)
     AND t.created_at <  ((m.local_start + interval '1 month') AT TIME ZONE c_tz)
    GROUP BY m.local_start
  ), closing AS (
    SELECT a.*,
           v_balance - COALESCE((
             SELECT sum(t.amount) FROM public.transactions t
             WHERE t.user_id = v_uid AND t.status = 'completed'
               AND t.created_at >= ((a.local_start + interval '1 month') AT TIME ZONE c_tz)
           ), 0) AS closing_balance
    FROM agg a
  )
  SELECT json_agg(json_build_object(
           'month', to_char(local_start, 'YYYY-MM'),
           'income', income, 'expenses', expenses, 'net', income - expenses,
           'closing_balance', closing_balance) ORDER BY local_start),
         COALESCE(sum(income), 0), COALESCE(sum(expenses), 0)
    INTO v_cashflow, v_income, v_expenses
  FROM closing;

  SELECT json_agg(json_build_object('category', cat, 'amount', amt) ORDER BY amt DESC)
    INTO v_categories
  FROM (
    SELECT COALESCE(NULLIF(t.category, ''), 'Others') AS cat, -sum(t.amount) AS amt
    FROM public.transactions t
    WHERE t.user_id = v_uid AND t.status = 'completed' AND t.amount < 0 AND t.created_at >= v_from
    GROUP BY 1
  ) s;

  RETURN json_build_object(
    'currency', 'PKR',
    'months', v_months,
    'balance', v_balance,
    'cashflow', COALESCE(v_cashflow, '[]'::json),
    'categories', COALESCE(v_categories, '[]'::json),
    'totals', json_build_object(
      'income', v_income, 'expenses', v_expenses, 'net', v_income - v_expenses,
      'savings_rate', CASE WHEN v_income > 0 THEN round((v_income - v_expenses) / v_income * 100, 1) END),
    'generated_at', now());
END $$;

REVOKE ALL ON FUNCTION public.get_insights(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_insights(integer) TO authenticated;
