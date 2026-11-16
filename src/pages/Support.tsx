import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useSupportTickets, useCreateTicket } from "@/hooks/use-cloud-data";
import { toast } from "@/hooks/use-toast";
import { LifeBuoy, Phone, Mail, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

// `value` is what is stored in the database (keep in English); `key` is only for the displayed label.
const categoryOptions = [
  { value: "Loan / repayment", key: "loan" },
  { value: "KYC & documents", key: "kyc" },
  { value: "Auto-debit / UPI mandate", key: "autodebit" },
  { value: "Savings & rewards", key: "savings" },
  { value: "Data privacy (DPDP)", key: "privacy" },
  { value: "Other", key: "other" },
];
const categories = categoryOptions.map((c) => c.value);

const categoryLabel = (value: string) => {
  const opt = categoryOptions.find((c) => c.value === value);
  return opt ? t(`sup.cat.${opt.key}`) : value;
};

const statusLabel = (status: string) => {
  const key = `sup.status.${status}`;
  const label = t(key);
  return label === key ? String(status).replace("_", " ") : label;
};

const statusStyle: Record<string, string> = {
  open: "bg-warning/10 text-warning",
  in_progress: "bg-info/10 text-info",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

export default function Support() {
  const { data: tickets = [], isLoading } = useSupportTickets();
  const createTicket = useCreateTicket();
  useLanguage();

  const [category, setCategory] = useState(categories[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (subject.trim().length < 4 || description.trim().length < 10) {
      toast({ title: t("sup.toast.moreTitle"), description: t("sup.toast.moreDesc"), variant: "destructive" });
      return;
    }
    try {
      await createTicket.mutateAsync({ category, subject: subject.trim(), description: description.trim() });
      setSubject("");
      setDescription("");
      toast({ title: t("sup.toast.doneTitle"), description: t("sup.toast.doneDesc") });
    } catch (e) {
      toast({ title: t("sup.toast.failTitle"), description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6 pb-8 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" /> {t("svc.support")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("sup.subtitle")}
          </p>
        </div>

        {/* Grievance officer — RBI Digital Lending Guidelines */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-2">
          <p className="text-sm font-bold text-foreground">{t("sup.officer")}</p>
          <p className="text-xs text-muted-foreground">
            {t("sup.officerNote")}
          </p>
          <div className="text-sm text-foreground space-y-1 pt-1">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> grievance@rozanapay.in</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> 1800-000-0000 {t("sup.phoneHours")}</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {t("sup.sla")}</p>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            {t("sup.escalate")}
          </p>
        </div>

        {/* New ticket */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <p className="text-sm font-bold text-foreground">{t("sup.raise")}</p>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("sup.category")}</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    category === c ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {categoryLabel(c)}
                </button>
              ))}
            </div>
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={120}
            placeholder={t("sup.subjectPh")}
            className="w-full px-3 py-3 rounded-xl bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder={t("sup.descPh")}
            className="w-full px-3 py-3 rounded-xl bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <button
            onClick={submit}
            disabled={createTicket.isPending}
            className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {createTicket.isPending ? t("sup.submitting") : t("sup.submit")}
          </button>
        </div>

        {/* History */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-foreground">{t("sup.yours")}</p>
          {isLoading && <p className="text-sm text-muted-foreground">{t("sup.loading")}</p>}
          {!isLoading && tickets.length === 0 && (
            <div className="bg-card rounded-xl p-6 shadow-card text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("sup.empty")}</p>
            </div>
          )}
          {tickets.map((tk: any) => (
            <div key={tk.id} className="bg-card rounded-xl p-4 shadow-card space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tk.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{categoryLabel(tk.category)}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 ${statusStyle[tk.status] ?? statusStyle.open}`}>
                  {statusLabel(tk.status)}
                </span>
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-wrap">{tk.description}</p>
              {tk.admin_response && (
                <div className="bg-success/10 rounded-lg p-3 text-xs text-foreground flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>{tk.admin_response}</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                {t("sup.raisedDue")
                  .replace("{raised}", new Date(tk.created_at).toLocaleDateString("en-IN"))
                  .replace("{due}", new Date(tk.sla_due_at).toLocaleDateString("en-IN"))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
