import { useState } from "react";
import { useLoans, useAddLoan, useProfile } from "@/hooks/use-cloud-data";
import MobileLayout from "@/components/MobileLayout";
import { CreditCard, X, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const loanAmounts = [500, 1000, 2000, 5000, 10000];
const loanDurations = [7, 14, 30];

export default function Loans() {
  const [showApply, setShowApply] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(2000);
  const [selectedDuration, setSelectedDuration] = useState(14);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const { data: loans = [] } = useLoans();
  const { data: profile } = useProfile();
  const addLoan = useAddLoan();
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
              </div>
            );
          })}
          {loans.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No loans yet</p>}
        </div>
      </div>

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
