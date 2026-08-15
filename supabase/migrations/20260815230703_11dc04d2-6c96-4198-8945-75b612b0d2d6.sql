-- 1. Lock the anonymous role out of every user data table
REVOKE ALL ON public.audit_log, public.bill_payments, public.bnpl_orders, public.credit_score_history,
  public.expenses, public.gold_investments, public.group_savings, public.income_logs,
  public.insurance_policies, public.loan_balances, public.loan_ledger, public.loans,
  public.notifications, public.otp_attempts, public.profiles, public.rewards,
  public.savings_goals, public.support_tickets, public.transactions, public.upi_mandates,
  public.user_roles FROM anon;

-- 2. Pin search_path on the remaining trigger function
ALTER FUNCTION public.loan_ledger_immutable() SET search_path = public;

-- 3. Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.disburse_loan(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_review_kyc(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.compute_credit_score(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.recompute_all_credit_scores() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.post_loan_entry(uuid, text, bigint, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_protected_column_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.upi_mandate_guard() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.loan_ledger_immutable() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;

-- OTP rate limiting must stay callable before sign-in
GRANT EXECUTE ON FUNCTION public.check_otp_rate_limit(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_otp_attempt(text) TO anon, authenticated;