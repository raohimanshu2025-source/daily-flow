import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useSupportTickets, useCreateTicket } from "@/hooks/use-cloud-data";
import { toast } from "@/hooks/use-toast";
import { LifeBuoy, Phone, Mail, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const categories = [
  "Loan / repayment",
  "KYC & documents",
  "Auto-debit / UPI mandate",
  "Savings & rewards",
  "Data privacy (DPDP)",
  "Other",
];

const statusStyle: Record<string, string> = {
  open: "bg-warning/10 text-warning",
  in_progress: "bg-info/10 text-info",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

export default function Support() {
  const { data: tickets = [], isLoading } = useSupportTickets();
  const createTicket = useCreateTicket();

  const [category, setCategory] = useState(categories[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (subject.trim().length < 4 || description.trim().length < 10) {
      toast({ title: "Add a bit more detail", description: "Subject and description help us resolve faster.", variant: "destructive" });
      return;
    }
    try {
      await createTicket.mutateAsync({ category, subject: subject.trim(), description: description.trim() });
      setSubject("");
      setDescription("");
      toast({ title: "Complaint registered", description: "You will get a response within 30 days as per RBI norms." });
    } catch (e) {
      toast({ title: "Could not submit", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6 pb-8 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" /> Help & Grievance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            शिकायत दर्ज करें — Raise a complaint and track its status.
          </p>
        </div>

        {/* Grievance officer — RBI Digital Lending Guidelines */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-2">
          <p className="text-sm font-bold text-foreground">Grievance Redressal Officer</p>
          <p className="text-xs text-muted-foreground">
            As required under RBI Digital Lending Guidelines, 2022.
          </p>
          <div className="text-sm text-foreground space-y-1 pt-1">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> grievance@rozanapay.in</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> 1800-000-0000 (9am–6pm, Mon–Sat)</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Response SLA: 30 days</p>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            If unresolved in 30 days, escalate to the RBI Complaint Management System at cms.rbi.org.in.
          </p>
        </div>

        {/* New ticket */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <p className="text-sm font-bold text-foreground">Raise a complaint</p>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    category === c ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={120}
            placeholder="Subject"
            className="w-full px-3 py-3 rounded-xl bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Describe the issue — include loan ID or transaction reference if relevant."
            className="w-full px-3 py-3 rounded-xl bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <button
            onClick={submit}
            disabled={createTicket.isPending}
            className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {createTicket.isPending ? "Submitting..." : "Submit complaint"}
          </button>
        </div>

        {/* History */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-foreground">Your complaints</p>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && tickets.length === 0 && (
            <div className="bg-card rounded-xl p-6 shadow-card text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No complaints raised yet.</p>
            </div>
          )}
          {tickets.map((t: any) => (
            <div key={t.id} className="bg-card rounded-xl p-4 shadow-card space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{t.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 ${statusStyle[t.status] ?? statusStyle.open}`}>
                  {String(t.status).replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-wrap">{t.description}</p>
              {t.admin_response && (
                <div className="bg-success/10 rounded-lg p-3 text-xs text-foreground flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>{t.admin_response}</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Raised {new Date(t.created_at).toLocaleDateString("en-IN")} · Response due{" "}
                {new Date(t.sla_due_at).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
