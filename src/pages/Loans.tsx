import { useState } from "react";
import { useLoans, useAddLoan, useProfile, useLoanLedger, useRepayLoan, useUpiMandate, useCreateMandate, useRevokeMandate } from "@/hooks/use-cloud-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MobileLayout from "@/components/MobileLayout";
import { CreditCard, X, Clock, CheckCircle, AlertCircle, RefreshCw, TrendingUp, TrendingDown, Wallet, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

const loanAmounts = [500, 1000, 2000, 5000, 10000];
const loanDurations = [7, 14, 30];
const quickRepay = [100, 500, 1000, 2000];

const FACTOR_META: Record<string, { label: string; good: (v: any) => boolean; format: (v: any) => string }> = {
  income_days_30:    { label: "Income days (30d)",  good: (v) => v >= 15,    format: (v) => `${v} days` },
  income_total_30:   { label: "Income (30d)",        good: (v) => v >= 10000, format: (v) => `₹${Number(v).toLocaleString("en-IN")}` },
  savings_balance:   { label: "Savings balance",     good: (v) => v >= 2000,  format: (v) => `₹${Number(v).toLocaleString("en-IN")}` },
  loans_on_time:     { label: "On-time loans",       good: (v) => v >= 1,     format: (v) => `${v}` },
  loans_overdue:     { label: "Overdue loans",       good: (v) => v === 0,    format: (v) => `${v}` },
  outstanding_paise: { label: "Outstanding",         good: (v) => v === 0,    format: (v) => `₹${Math.round(Number(v) / 100).toLocaleString("en-IN")}` },
  bnpl_active:       { label: "Active BNPL",         good: (v) => v <= 1,     format: (v) => `${v}` },
  kyc_verified:      { label: "KYC verified",        good: (v) => v === true, format: (v) => v ? "Yes" : "No" },
  account_age_days:  { label: "Account age",         good: (v) => v >= 30,    format: (v) => `${v} days` },
};

function CreditScorePanel({ latest, recomputing, onRecompute }: { latest: any; recomputing: boolean; onRecompute: () => void }) {
  const factors = (latest?.factors || {}) as Record<string, any>;
  const entries = Object.entries(factors).filter(([k]) => FACTOR_META[k]);
  const positives = entries.filter(([k, v]) => FACTOR_META[k].good(v)).slice(0, 3);
  const negatives = entries.filter(([k, v]) => !FACTOR_META[k].good(v)).slice(0, 3);
  const bandColor: Record<string, string> = {
    excellent: "bg-success/10 text-success",
    good: "bg-success/10 text-success",
    fair: "bg-warning/10 text-warning",
    poor: "bg-destructive/10 text-destructive",
    very_poor: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="bg-card rounded-2xl p-4 mb-6 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Score breakdown</p>
          {latest ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-foreground">{latest.score}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${bandColor[latest.band] || "bg-muted text-muted-foreground"}`}>
                {String(latest.band).replace("_", " ")}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(latest.computed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">Not computed yet</p>
          )}
        </div>
        <button
          onClick={onRecompute}
          disabled={recomputing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-foreground active:scale-95 transition disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${recomputing ? "animate-spin" : ""}`} />
          {recomputing ? "Updating..." : "Recompute"}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <TrendingUp className="h-3 w-3 text-success" />
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Helping</p>
            </div>
            <div className="space-y-1">
              {positives.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
              {positives.map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="text-foreground">{FACTOR_META[k].label}</span>
                  <span className="text-muted-foreground"> · {FACTOR_META[k].format(v)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Hurting</p>
            </div>
            <div className="space-y-1">
              {negatives.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
              {negatives.map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="text-foreground">{FACTOR_META[k].label}</span>
                  <span className="text-muted-foreground"> · {FACTOR_META[k].format(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Loans() {
  const [showApply, setShowApply] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(2000);
  const [selectedDuration, setSelectedDuration] = useState(14);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [repayLoanId, setRepayLoanId] = useState<string | null>(null);

  const { data: loans = [] } = useLoans();
  const { data: profile } = useProfile();
  const addLoan = useAddLoan();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: latestScore } = useQuery({
    queryKey: ['credit_score_latest', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_score_history')
        .select('score, band, factors, computed_at, model_version')
        .eq('user_id', user!.id)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [recomputing, setRecomputing] = useState(false);
  const handleRecompute = async () => {
    if (!user) return;
    setRecomputing(true);
    try {
      const { error } = await supabase.rpc('compute_credit_score', { _user_id: user.id });
      if (error) throw error;
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['credit_score_latest'] }),
        qc.invalidateQueries({ queryKey: ['profile'] }),
      ]);
      toast.success("Credit score updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRecomputing(false);
    }
  };

  const activeLoans = loans.filter(l => ['approved', 'active', 'pending'].includes(l.status || ''));
  const interestRate = 2;
  const totalRepay = selectedAmount + (selectedAmount * interestRate * selectedDuration) / (100 * 30);
  const interestAmount = Math.round(totalRepay - selectedAmount);
  const apr = (interestRate * 12).toFixed(2); // monthly rate × 12 months
  const processingFee = Math.round(selectedAmount * 0.01); // 1% sample

  const handleApply = async () => {
    if (!agreedTerms) { toast.error("Please accept the loan terms"); return; }
    try {
      await addLoan.mutateAsync({ amount: selectedAmount, duration: selectedDuration, interest_rate: interestRate });
      // Phase 1: audit log for compliance
      await supabase.rpc('log_audit_event', {
        _action: 'loan.applied',
        _entity_type: 'loan',
        _entity_id: null,
        _metadata: {
          amount: selectedAmount,
          duration_days: selectedDuration,
          interest_rate: interestRate,
          apr_pct: Number(apr),
          consent: true,
        },
      });
      setShowApply(false);
      setAgreedTerms(false);
      toast.success("Loan applied!");
    } catch (err: any) { toast.error(err.message); }
  };

  const statusConfig: Record<string, any> = {
    pending: { icon: Clock, label: "Pending", className: "bg-warning/10 text-warning" },
    approved: { icon: CheckCircle, label: "Approved", className: "bg-success/10 text-success" },
    active: { icon: CreditCard, label: "Active", className: "bg-primary/10 text-primary" },
    repaid: { icon: CheckCircle, label: "Repaid", className: "bg-success/10 text-success" },
    overdue: { icon: AlertCircle, label: "Overdue", className: "bg-destructive/10 text-destructive" },
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">Micro Loans</h1>

        <div className="gradient-primary rounded-2xl p-5 mb-6 shadow-elevated">
          <p className="text-primary-foreground/70 text-sm mb-1">Your Credit Score</p>
          <h2 className="text-3xl font-bold text-primary-foreground mb-2">{profile?.credit_score || 300}</h2>
          <div className="w-full h-2 rounded-full bg-primary-foreground/20">
            <div className="h-full rounded-full bg-primary-foreground transition-all" style={{ width: `${((profile?.credit_score || 300) / 900) * 100}%` }} />
          </div>
          <p className="text-xs text-primary-foreground/60 mt-2">Max eligible: ₹{Math.min((profile?.credit_score || 300) * 15, 10000).toLocaleString("en-IN")}</p>
        </div>

        <CreditScorePanel
          latest={latestScore}
          recomputing={recomputing}
          onRecompute={handleRecompute}
        />

        <button onClick={() => setShowApply(true)}
          className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform shadow-card">
          <CreditCard className="h-5 w-5" /> Apply for Loan
        </button>

        <h3 className="font-semibold text-foreground mb-3">Your Loans ({activeLoans.length} active)</h3>
        <div className="space-y-3">
          {loans.map((loan) => {
            const cfg = statusConfig[loan.status || 'pending'];
            const Icon = cfg.icon;
            return (
              <div key={loan.id} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 ${cfg.className}`}>
                    <Icon className="h-3 w-3" /> {cfg.label}
                  </div>
                  <p className="text-lg font-bold text-foreground">₹{loan.amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{loan.duration} days · {loan.interest_rate}% interest</span>
                  <span>Applied {new Date(loan.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
                {loan.status === "active" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Repaid</span>
                      <span className="font-medium text-foreground">₹{loan.repaid_amount} / ₹{loan.amount}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full gradient-accent" style={{ width: `${(loan.repaid_amount / loan.amount) * 100}%` }} />
                    </div>
                  </div>
                )}
                {['active','approved','disbursed'].includes(loan.status || '') && (
                  <button
                    onClick={() => setRepayLoanId(loan.id)}
                    className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
                  >
                    <Wallet className="h-4 w-4" /> Repay & Manage UPI Mandate
                  </button>
                )}
              </div>
            );
          })}
          {loans.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No loans yet</p>}
        </div>
      </div>

      {repayLoanId && (
        <RepayModal
          loanId={repayLoanId}
          loan={loans.find((l) => l.id === repayLoanId)!}
          onClose={() => setRepayLoanId(null)}
        />
      )}

      {showApply && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
          <div className="bg-card w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Apply for Loan</h2>
              <button onClick={() => setShowApply(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Loan Amount</label>
                <div className="flex flex-wrap gap-2">
                  {loanAmounts.map((a) => (
                    <button key={a} onClick={() => setSelectedAmount(a)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedAmount === a ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      ₹{a.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Duration</label>
                <div className="flex gap-3">
                  {loanDurations.map((d) => (
                    <button key={d} onClick={() => setSelectedDuration(d)}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${selectedDuration === d ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {d} days
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-medium text-foreground">₹{selectedAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Interest ({interestRate}%/month)</span>
                  <span className="font-medium text-foreground">₹{interestAmount}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Processing Fee (1%)</span>
                  <span className="font-medium text-foreground">₹{processingFee}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Representative APR</span>
                  <span className="font-medium text-foreground">{apr}%</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between text-sm">
                  <span className="font-semibold text-foreground">Total Repayment</span>
                  <span className="font-bold text-foreground">₹{(Math.round(totalRepay) + processingFee).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-xs text-foreground/80 space-y-1.5">
                <p className="font-bold text-foreground">Loan Disclosure (RBI / Google Play compliant)</p>
                <p>• Lender: RozanaPay NBFC Partner (Reg. No: pending)</p>
                <p>• Min/Max tenure: 7–30 days · Min/Max APR: 24%–36%</p>
                <p>• Late fee: ₹50/day after due date · No rollover</p>
                <p>• Repayment auto-debited via UPI mandate on due date</p>
                <p>• Full schedule, grievance officer & policies available in app settings</p>
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="mt-0.5 accent-primary w-4 h-4" />
                <span>I understand the total repayment amount, APR, late fees, and authorize repayment via UPI auto-debit.</span>
              </label>
              <button onClick={handleApply} disabled={addLoan.isPending || !agreedTerms}
                className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg active:scale-[0.98] transition-all disabled:opacity-40">
                {addLoan.isPending ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}

function RepayModal({ loanId, loan, onClose }: { loanId: string; loan: any; onClose: () => void }) {
  const { data: ledger = [] } = useLoanLedger(loanId);
  const { data: mandate } = useUpiMandate(loanId);
  const repay = useRepayLoan();
  const createMandate = useCreateMandate();
  const revokeMandate = useRevokeMandate();

  const [amount, setAmount] = useState<number>(quickRepay[0]);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [vpa, setVpa] = useState("");
  const [maxAmount, setMaxAmount] = useState<number>(loan.amount);

  const outstandingPaise = ledger[0]?.balance_after_paise ?? loan.amount * 100;
  const outstandingRupees = Math.max(0, Math.round(outstandingPaise / 100));
  const vpaValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(vpa.trim());

  const handleRepay = async () => {
    const amt = customAmount ? Number(customAmount) : amount;
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > outstandingRupees) { toast.error(`Max repayable: ₹${outstandingRupees}`); return; }
    try {
      await repay.mutateAsync({
        loanId,
        amount: amt,
        referenceId: mandate?.status === 'active' ? `mandate:${mandate.id}` : `manual:${Date.now()}`,
      });
      toast.success(`₹${amt} repaid`);
      setCustomAmount("");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateMandate = async () => {
    if (!vpaValid) { toast.error("Enter a valid UPI ID (e.g. name@bank)"); return; }
    if (maxAmount <= 0) { toast.error("Max amount must be positive"); return; }
    try {
      await createMandate.mutateAsync({ loanId, vpa, maxAmount });
      toast.success("UPI auto-debit mandate active");
      setVpa("");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRevoke = async () => {
    if (!mandate) return;
    if (!confirm("Revoke this UPI mandate? Auto-debit will stop.")) return;
    try {
      await revokeMandate.mutateAsync({ mandateId: mandate.id, loanId });
      toast.success("Mandate revoked");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
      <div className="bg-card w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Repay Loan</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <div className="gradient-primary rounded-2xl p-4 mb-4 text-primary-foreground">
          <p className="text-xs opacity-70">Outstanding balance</p>
          <p className="text-3xl font-bold">₹{outstandingRupees.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-60 mt-1">Principal ₹{loan.amount} · {loan.duration}d · {loan.interest_rate}% /mo</p>
        </div>

        {/* Quick repay */}
        <p className="text-sm font-medium text-foreground mb-2">Quick repay</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {quickRepay.map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(a); setCustomAmount(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${amount === a && !customAmount ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >₹{a}</button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount (₹)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="w-full mb-3 px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={handleRepay}
          disabled={repay.isPending || outstandingRupees === 0}
          className="w-full py-3 mb-5 rounded-xl gradient-primary text-primary-foreground font-bold active:scale-[0.98] transition disabled:opacity-40"
        >
          {repay.isPending ? "Processing…" : outstandingRupees === 0 ? "Fully repaid" : `Pay ₹${customAmount || amount} via UPI`}
        </button>

        {/* Mandate block */}
        <div className="bg-muted/60 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            {mandate?.status === 'active' ? (
              <ShieldCheck className="h-4 w-4 text-success" />
            ) : (
              <ShieldOff className="h-4 w-4 text-muted-foreground" />
            )}
            <p className="text-sm font-semibold text-foreground">UPI Auto-debit Mandate</p>
          </div>
          {mandate?.status === 'active' ? (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>VPA: <span className="font-medium text-foreground">{mandate.vpa}</span></p>
              <p>Max per debit: <span className="font-medium text-foreground">₹{Math.round(mandate.max_amount_paise / 100).toLocaleString("en-IN")}</span></p>
              <p>Created {new Date(mandate.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              <button
                onClick={handleRevoke}
                disabled={revokeMandate.isPending}
                className="mt-2 w-full py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold active:scale-95 transition disabled:opacity-40"
              >
                {revokeMandate.isPending ? "Revoking…" : "Revoke mandate"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Authorize RozanaPay to auto-debit your UPI for repayments on due date. Cancel anytime.
              </p>
              <input
                type="text"
                placeholder="Your UPI ID (e.g. name@okhdfc)"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                type="number"
                placeholder="Max amount per debit (₹)"
                value={maxAmount || ""}
                onChange={(e) => setMaxAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={handleCreateMandate}
                disabled={createMandate.isPending || !vpaValid}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition disabled:opacity-40"
              >
                {createMandate.isPending ? "Authorizing…" : "Authorize UPI mandate"}
              </button>
            </div>
          )}
        </div>

        {/* Ledger */}
        <p className="text-sm font-semibold text-foreground mb-2">Payment history</p>
        {ledger.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">No entries yet</p>
        ) : (
          <div className="space-y-1.5">
            {ledger.slice(0, 10).map((e: any) => (
              <div key={e.id} className="flex justify-between items-center text-xs py-2 border-b border-border/40">
                <div>
                  <p className="font-medium text-foreground capitalize">{e.entry_type.replace('_', ' ')}</p>
                  <p className="text-muted-foreground">{new Date(e.posted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${e.credit_paise > 0 ? 'text-success' : 'text-foreground'}`}>
                    {e.credit_paise > 0 ? '−' : '+'}₹{Math.round((e.debit_paise || e.credit_paise) / 100).toLocaleString("en-IN")}
                  </p>
                  <p className="text-muted-foreground text-[10px]">Bal ₹{Math.round(e.balance_after_paise / 100).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
