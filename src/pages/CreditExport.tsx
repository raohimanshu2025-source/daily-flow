import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Award, Download, TrendingUp, Shield, Clock, PiggyBank, Loader2, Share2, FileJson, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { useProfile, useIncomeLogs, useSavingsGoals, useLoans, useExpenses } from "@/hooks/use-cloud-data";
import { generateCreditReport } from "@/lib/credit-report";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function CreditExport() {
  useLanguage();
  const [exporting, setExporting] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
  // English label/factors go into the PDF (its font cannot draw Hindi); the screen shows translated ones.
  const scoreLabel = score >= 800 ? 'Excellent' : score >= 700 ? 'Good' : score >= 600 ? 'Fair' : score >= 500 ? 'Poor' : 'Building';
  const scoreLabelShown = t(score >= 800 ? 'score.band.excellent' : score >= 700 ? 'score.band.good' : score >= 600 ? 'score.band.fair' : score >= 500 ? 'score.band.poor' : 'cex.building');

  const factors = [
    { icon: TrendingUp, label: "Income Consistency", value: `${daysActive} days logged`, score: Math.min(daysActive * 5, 100) },
    { icon: PiggyBank, label: "Savings Behavior", value: `₹${totalSaved.toLocaleString("en-IN")} saved`, score: Math.min(Math.floor(totalSaved / 100), 100) },
    { icon: Clock, label: "Repayment History", value: `${loansRepaid} loans repaid`, score: loansRepaid > 0 ? 80 : 20 },
    { icon: Shield, label: "App Activity", value: `${daysActive + savings.length} actions`, score: Math.min((daysActive + savings.length) * 3, 100) },
  ];
  const factorsShown = [
    { label: t("cex.f.income"), value: t("cex.f.incomeVal").replace("{n}", String(daysActive)) },
    { label: t("cex.f.savings"), value: t("cex.f.savingsVal").replace("{amt}", totalSaved.toLocaleString("en-IN")) },
    { label: t("cex.f.repay"), value: t("cex.f.repayVal").replace("{n}", String(loansRepaid)) },
    { label: t("cex.f.activity"), value: t("cex.f.activityVal").replace("{n}", String(daysActive + savings.length)) },
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
          await navigator.share({ files: [file], title: t('cex.shareTitle') });
          setExporting(false);
          return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success(t("cex.reportDone"));
    } catch (e) {
      console.error(e);
      toast.error(t("cex.reportFail"));
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
        'insurance_policies','notifications','rewards','upi_mandates','credit_score_history','app_events',
      ] as const;
      const bundle: Record<string, unknown> = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email ?? null,
        notice: 'Personal data export under DPDP Act 2023.',
      };
      for (const t of tables) {
        // Filter to the signed-in user: admins can read other users' rows, and
        // a personal export must never include anyone else's data.
        const { data, error } = await supabase.from(t as any).select('*').eq('user_id', user.id);
        bundle[t] = error ? { error: error.message } : data;
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RozanaPay_MyData_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('cex.dataDone'));
    } catch (e) {
      console.error(e);
      toast.error(t('cex.dataFail'));
    }
    setExportingData(false);
  };

  // DPDP Act 2023 §12: right to erasure. The server keeps only records the law
  // requires (loans that moved money, the loan ledger, the audit log).
  const handleDeleteAccount = async () => {
    if (deleteText.trim().toUpperCase() !== "DELETE") return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", { body: { confirm: "DELETE" } });
      if (error) {
        let code = "";
        try { code = (await (error as any).context?.json())?.error ?? ""; } catch { /* ignore */ }
        toast.error(code === "OUTSTANDING_LOAN" ? t("delete.owed") : t("delete.failed"));
        setDeleting(false);
        return;
      }
      if (!data?.ok) throw new Error("delete failed");
      try { localStorage.clear(); } catch { /* ignore */ }
      await signOut().catch(() => {});
      toast.success(t("delete.done"));
      navigate("/", { replace: true });
    } catch (e) {
      console.error(e);
      toast.error(t("delete.failed"));
      setDeleting(false);
    }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">{t("cex.title")}</h1>
        <p className="text-sm text-muted-foreground mb-5">{t("cex.subtitle")}</p>

        {/* Score Card */}
        <div className="bg-card rounded-2xl p-6 shadow-elevated text-center mb-6">
          <Award className="h-10 w-10 mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground mb-1">{t("cex.scoreName")}</p>
          <h2 className={`text-5xl font-bold ${scoreColor}`}>{score}</h2>
          <p className={`text-sm font-semibold ${scoreColor} mt-1`}>{scoreLabelShown}</p>
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
          <h3 className="font-semibold text-foreground mb-3">{t("cex.factors")}</h3>
          <div className="space-y-3">
            {factors.map((f, i) => (
              <div key={i} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <f.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{factorsShown[i].label}</p>
                      <span className="text-xs text-muted-foreground">{f.score}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{factorsShown[i].value}</p>
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
          {exporting ? t("cex.generating") : t("cex.downloadPdf")}
        </button>
        <button
          onClick={() => handleExport(true)}
          disabled={exporting}
          className="w-full py-3 rounded-xl bg-muted text-foreground font-semibold flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          {t("cex.share")}
        </button>
        <p className="text-xs text-center text-muted-foreground mb-6">
          {t("cex.shareHint")}
        </p>

        {/* DPDP data portability */}
        <div className="border-t border-border/50 pt-5 mb-8">
          <h3 className="text-sm font-black text-foreground mb-1">{t("cex.dataTitle")}</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {t("cex.dataDesc")}
          </p>
          <button
            onClick={handleDataExport}
            disabled={exportingData}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exportingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
            {exportingData ? t('cex.preparing') : t('cex.dataDownload')}
          </button>

          <div className="mt-6">
            <h3 className="text-sm font-black text-foreground mb-1">{t("delete.title")}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t("delete.desc")}</p>
            <button
              onClick={() => { setDeleteText(""); setDeleteOpen(true); }}
              className="w-full py-3 rounded-xl border-2 border-destructive/30 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {t("delete.title")}
            </button>
          </div>
          <p className="text-[11px] text-center text-muted-foreground mt-4">
            <button onClick={() => navigate("/privacy")} className="text-primary font-semibold">{t("legal.privacy")}</button>
            {" • "}
            <button onClick={() => navigate("/terms")} className="text-primary font-semibold">{t("legal.terms")}</button>
          </p>
        </div>

        <AlertDialog open={deleteOpen} onOpenChange={(o) => !deleting && setDeleteOpen(o)}>
          <AlertDialogContent className="rounded-2xl max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("delete.confirmBody")}</AlertDialogDescription>
            </AlertDialogHeader>
            <label className="text-xs font-semibold text-foreground" htmlFor="delete-confirm">{t("delete.typeToConfirm")}</label>
            <input
              id="delete-confirm"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground font-bold tracking-widest focus:outline-none focus:border-destructive"
              placeholder="DELETE"
              disabled={deleting}
            />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>{t("delete.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }}
                disabled={deleting || deleteText.trim().toUpperCase() !== "DELETE"}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? t("delete.working") : t("delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MobileLayout>
  );
}
