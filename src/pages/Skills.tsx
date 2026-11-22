import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ChevronDown, CheckCircle2, ExternalLink, Info, Lightbulb } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import { track } from "@/lib/track";
import { COURSES, LESSONS, SKILLS_CHECKED_ON, readDone, saveDone, type LessonId } from "@/lib/skills";

const tf = (key: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t(key));

export default function Skills() {
  useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState<LessonId | null>(null);
  const [done, setDone] = useState<LessonId[]>(readDone);

  const toggle = (id: LessonId) => {
    const next = open === id ? null : id;
    setOpen(next);
    if (next) track("lesson_open", { lesson: id });
  };

  const markDone = (id: LessonId) => {
    if (done.includes(id)) return;
    const next = [...done, id];
    setDone(next);
    saveDone(next);
    track("lesson_done", { lesson: id });
    setOpen(null);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("sk.title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{t("sk.subtitle")}</p>

        {/* Money lessons */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("sk.lessons")}</p>
          <p className="text-xs font-bold text-primary">{tf("sk.progress", { d: done.length, n: LESSONS.length })}</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${(done.length / LESSONS.length) * 100}%` }} />
        </div>

        <div className="space-y-3 mb-7">
          {LESSONS.map((l, i) => {
            const isOpen = open === l.id;
            const isDone = done.includes(l.id);
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl shadow-card overflow-hidden"
              >
                <button onClick={() => toggle(l.id)} className="w-full flex items-center gap-3 p-4 text-left" aria-expanded={isOpen}>
                  <span className="text-2xl">{l.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground leading-snug">{t(`sk.l.${l.id}.title`)}</p>
                    <p className="text-[11px] text-muted-foreground">{t(`sk.l.${l.id}.why`)}</p>
                  </div>
                  {isDone && <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-label={t("sk.done")} />}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <ol className="px-4 pb-3 space-y-2">
                        {Array.from({ length: l.steps }, (_, k) => (
                          <li key={k} className="flex gap-2.5 text-sm text-foreground">
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{k + 1}</span>
                            <span>{t(`sk.l.${l.id}.s${k + 1}`)}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="px-4 pb-4">
                        <button
                          onClick={() => markDone(l.id)}
                          disabled={isDone}
                          className="w-full gradient-primary text-primary-foreground text-sm font-bold py-3 rounded-xl disabled:opacity-60 active:scale-[0.98] transition-all"
                        >
                          {isDone ? t("sk.done") : t("sk.markDone")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Free official courses */}
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("sk.courses")}</p>
        <div className="space-y-3 mb-5">
          {COURSES.map((c) => (
            <div key={c.id} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-foreground leading-snug">{t(`sk.c.${c.id}.name`)}</p>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-success/10 text-success shrink-0">{t("sk.free")}</span>
              </div>
              <p className="text-xs text-foreground mb-2">{t(`sk.c.${c.id}.what`)}</p>
              <p className="text-[11px] text-muted-foreground bg-muted rounded-xl p-2 mb-3">{t(`sk.c.${c.id}.how`)}</p>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("course_link_open", { course: c.id })}
                className="flex items-center justify-center gap-1.5 w-full bg-primary/10 text-primary text-xs font-bold py-2.5 rounded-xl"
              >
                {t("ben.open")} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Our own courses: planned, ask what people want */}
        <div className="flex gap-3 bg-accent/10 rounded-2xl p-4 mb-5">
          <Lightbulb className="h-5 w-5 text-accent shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{t("sk.ownTitle")}</p>
            <p className="text-xs text-foreground mt-0.5 mb-2">{t("sk.ownBody")}</p>
            <button
              onClick={() => { track("course_suggest_open"); navigate("/support"); }}
              className="text-xs font-bold text-primary"
            >
              {t("sk.ownCta")} →
            </button>
          </div>
        </div>

        <div className="flex gap-2 text-[11px] text-muted-foreground bg-muted rounded-xl p-3">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{tf("sk.note", { date: new Date(SKILLS_CHECKED_ON).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })}</span>
        </div>
      </div>
    </MobileLayout>
  );
}
