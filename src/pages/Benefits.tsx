import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Landmark, Lock, ExternalLink, CheckCircle2, HelpCircle, Info, Pencil } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useProfile } from "@/hooks/use-cloud-data";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import {
  BENEFITS_CHECKED_ON, findBenefits, workFromOccupation,
  type BenefitAnswers, type IncomeBand, type Work, type YesNo,
} from "@/lib/benefits";

const INCOMES: IncomeBand[] = ["lt10", "10to15", "15to25", "gt25"];
const WORKS: Work[] = ["platform", "driver", "vendor", "construction", "shop", "other"];
const YN: YesNo[] = ["yes", "no", "unsure"];

const tf = (key: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t(key));

function Chips<T extends string>({ value, options, label, onChange, cols = 2 }: {
  value?: T; options: T[]; label: (o: T) => string; onChange: (o: T) => void; cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
            value === o ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
          }`}
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}

export default function Benefits() {
  useLanguage(); // re-render on Hindi/English switch
  const { data: profile } = useProfile();

  const [age, setAge] = useState("");
  const [income, setIncome] = useState<IncomeBand>();
  const [work, setWork] = useState<Work>();
  const [bank, setBank] = useState<YesNo>();
  const [epf, setEpf] = useState<YesNo>();
  const [tax, setTax] = useState<YesNo>();
  const [answers, setAnswers] = useState<BenefitAnswers | null>(null);

  // Pre-fill from the profile once (age and work were given during sign-up).
  useEffect(() => {
    if (!profile) return;
    if (profile.age && !age) setAge(String(profile.age));
    const w = workFromOccupation(profile.occupation);
    if (w && !work) setWork(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const ageNum = parseInt(age, 10);
  const ready = ageNum >= 10 && ageNum <= 100 && income && work && bank && epf && tax;

  const submit = () => {
    if (!ready) return;
    setAnswers({ age: ageNum, income: income!, work: work!, bank: bank!, epf: epf!, tax: tax! });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const results = answers ? findBenefits(answers) : [];
  const yn = (o: YesNo) => t(`ben.${o}`);

  return (
    <MobileLayout>
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Landmark className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("ben.title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{t("ben.subtitle")}</p>
        <div className="flex items-center gap-2 text-xs text-success bg-success/10 rounded-xl px-3 py-2 mb-5">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>{t("ben.private")}</span>
        </div>

        {!answers ? (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold text-foreground mb-2">{t("ben.q.age")}</p>
              <input
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value.slice(0, 3))}
                className="w-full bg-muted rounded-xl px-4 py-3 text-base font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-2">{t("ben.q.income")}</p>
              <Chips value={income} options={INCOMES} label={(o) => t(`ben.inc.${o}`)} onChange={setIncome} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-2">{t("ben.q.work")}</p>
              <Chips value={work} options={WORKS} label={(o) => t(`ben.work.${o}`)} onChange={setWork} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-2">{t("ben.q.bank")}</p>
              <Chips value={bank} options={YN} label={yn} onChange={setBank} cols={3} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t("ben.q.epf")}</p>
              <p className="text-[11px] text-muted-foreground mb-2">{t("ben.q.epfHint")}</p>
              <Chips value={epf} options={YN} label={yn} onChange={setEpf} cols={3} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-2">{t("ben.q.tax")}</p>
              <Chips value={tax} options={YN} label={yn} onChange={setTax} cols={3} />
            </div>
            <button
              onClick={submit}
              disabled={!ready}
              className="w-full gradient-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-glow disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {t("ben.find")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-extrabold text-foreground">
                {results.length ? tf("ben.found", { n: results.length }) : t("ben.none")}
              </p>
              <button
                onClick={() => setAnswers(null)}
                className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0"
              >
                <Pencil className="h-3.5 w-3.5" /> {t("ben.edit")}
              </button>
            </div>

            {results.map(({ scheme, match }, i) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-foreground leading-snug">{t(`ben.s.${scheme.id}.name`)}</p>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                      match === "yes" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}
                  >
                    {match === "yes" ? <CheckCircle2 className="h-3 w-3" /> : <HelpCircle className="h-3 w-3" />}
                    {t(`ben.match.${match}`)}
                  </span>
                </div>
                <p className="text-xs text-foreground mb-2">
                  <span className="font-semibold">{t("ben.get")}: </span>{t(`ben.s.${scheme.id}.get`)}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted rounded-xl p-2">
                    <p className="text-[10px] text-muted-foreground">{t("ben.cost")}</p>
                    <p className="text-xs font-semibold text-foreground">{t(`ben.s.${scheme.id}.cost`)}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-2">
                    <p className="text-[10px] text-muted-foreground">{t("ben.docs")}</p>
                    <p className="text-xs font-semibold text-foreground">{t(`ben.s.${scheme.id}.docs`)}</p>
                  </div>
                </div>
                <a
                  href={scheme.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full bg-primary/10 text-primary text-xs font-bold py-2.5 rounded-xl"
                >
                  {t("ben.open")} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            ))}

            <p className="text-xs text-muted-foreground text-center pt-1">{t("ben.csc")}</p>
          </div>
        )}

        <div className="flex gap-2 text-[11px] text-muted-foreground bg-muted rounded-xl p-3 mt-5">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{tf("ben.disclaimer", { date: new Date(BENEFITS_CHECKED_ON).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })}</span>
        </div>
      </div>
    </MobileLayout>
  );
}
