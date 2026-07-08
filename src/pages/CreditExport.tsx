import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Award, Download, TrendingUp, Shield, Clock, PiggyBank, Loader2, Share2, FileJson } from "lucide-react";
import { useProfile, useIncomeLogs, useSavingsGoals, useLoans, useExpenses } from "@/hooks/use-cloud-data";
import { generateCreditReport } from "@/lib/credit-report";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function CreditExport() {
  const [exporting, setExporting] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: income = [] } = useIncomeLogs();
  const { data: savings = [] } = useSavingsGoals();
  const { data: loans = [] } = useLoans();
  const { data: expenses = [] } = useExpenses();

  const score = profile?.credit_score || 300;
  const daysActive = new Set(income.map((i: any) => i.date?.slice(0, 10))).size;
  const totalSaved = savings.reduce((s: number, g: any) => s + (g.current_amount || 0), 0);
  const loansRepaid = loans.filter((l: any) => l.status === 'repaid' || l.status === 'closed').length;

  const scoreColor = score >= 700 ? 'text-success' : score >= 500 ? 'text-warning' : 'text-destructive';
  const scoreLabel = score >= 800 ? 'Excellent' : score >= 700 ? 'Good' : score >= 600 ? 'Fair' : score >= 500 ? 'Poor' : 'Building';

  const factors = [
    { icon: TrendingUp, label: "Income Consistency", value: `${daysActive} days logged`, score: Math.min(daysActive * 5, 100) },
    { icon: PiggyBank, label: "Savings Behavior", value: `₹${totalSaved.toLocaleString("en-IN")} saved`, score: Math.min(Math.floor(totalSaved / 100), 100) },
    { icon: Clock, label: "Repayment History", value: `${loansRepaid} loans repaid`, score: loansRepaid > 0 ? 80 : 20 },
    { icon: Shield, label: "App Activity", value: `${daysActive + savings.length} actions`, score: Math.min((daysActive + savings.length) * 3, 100) },
  ];

  const handleExport = async (share: boolean) => {
    setExporting(true);
    try {
      const blob = await generateCreditReport({
        profile, income, savings, loans, expenses, score, scoreLabel, factors,
      });
      const filename = `RozanaPay_Credit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      if (share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'RozanaPay Credit Report' });
          setExporting(false);
          return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success("Credit report downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate report");
    }
    setExporting(false);
  };

  // DPDP Act 2023 §11: users have the right to receive all personal data
  // held about them in a portable machine-readable format.
  const handleDataExport = async () => {
    if (!user) return;
    setExportingData(true);
    try {
      const tables = [
        'profiles','income_logs','expenses','savings_goals','loans','loan_ledger',
        'transactions','bnpl_orders','bill_payments','gold_investments','group_savings',
        'insurance_policies','notifications','rewards','upi_mandates','credit_score_history',
      ] as const;
      const bundle: Record<string, unknown> = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email ?? null,
        notice: 'Personal data export under DPDP Act 2023.',
      };
      for (const t of tables) {
        const { data, error } = await supabase.from(t as any).select('*');
        bundle[t] = error ? { error: error.message } : data;
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RozanaPay_MyData_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Your data has been downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Could not export your data');
    }
    setExportingData(false);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Financial Identity</h1>
        <p className="text-sm text-muted-foreground mb-5">Your RozanaPay credit profile</p>

        {/* Score Card */}
        <div className="bg-card rounded-2xl p-6 shadow-elevated text-center mb-6">
          <Award className="h-10 w-10 mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground mb-1">RozanaPay Score</p>
          <h2 className={`text-5xl font-bold ${scoreColor}`}>{score}</h2>
          <p className={`text-sm font-semibold ${scoreColor} mt-1`}>{scoreLabel}</p>
          <div className="w-full h-3 rounded-full bg-muted mt-4">
            <div
              className="h-full rounded-full gradient-accent transition-all"
              style={{ width: `${(score / 900) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>300</span>
            <span>900</span>
          </div>
        </div>

        {/* Score Factors */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Score Factors</h3>
          <div className="space-y-3">
            {factors.map((f, i) => (
              <div key={i} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <f.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <span className="text-xs text-muted-foreground">{f.score}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.value}</p>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${f.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export */}
        <button
          onClick={() => handleExport(false)}
          disabled={exporting}
          className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-elevated mb-3 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          {exporting ? "Generating…" : "Download Credit Report (PDF)"}
        </button>
        <button
          onClick={() => handleExport(true)}
          disabled={exporting}
          className="w-full py-3 rounded-xl bg-muted text-foreground font-semibold flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          Share with Bank / NBFC
        </button>
        <p className="text-xs text-center text-muted-foreground mb-6">
          Share your financial identity with banks & NBFCs to access formal credit
        </p>

        {/* DPDP data portability */}
        <div className="border-t border-border/50 pt-5 mb-8">
          <h3 className="text-sm font-black text-foreground mb-1">Your data, your right 🛡️</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Download every record we hold about you as a JSON file (DPDP Act 2023).
          </p>
          <button
            onClick={handleDataExport}
            disabled={exportingData}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exportingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
            {exportingData ? 'Preparing…' : 'Download my data (JSON)'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
