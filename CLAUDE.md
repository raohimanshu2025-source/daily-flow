# CLAUDE.md — RozanaPay project context

Claude Code reads this file automatically. Read it fully before you change anything, then read `HANDOVER.md` (setup) and `BACKEND_SETUP.md` (backend rebuild).

## Goal for whoever picks this up
The app must look and behave **exactly** as it does on the live demo (https://rozana-pocket-power.lovable.app). Do not redesign, rename, re-theme or "clean up" the UI unless the owner asks for it. Reference screenshots are in `docs/screenshots/`.

## What the app is
RozanaPay is a mobile-first PWA fintech app for India's unbanked gig workers (delivery riders, drivers, daily-wage workers). Users track daily income, save small amounts automatically, get a behavioral credit score (300–900) and instant micro-loans (₹500–₹10,000), plus BNPL, digital gold, UPI QR, bill pay, insurance, group savings (chit funds), rewards, an AI chatbot and smart nudges. Built to work with an RBI-licensed NBFC/bank partner (Key Fact Statement, grievance portal with SLA, DPDP data export).

Users have low digital literacy: big tap targets, little text, Hindi + English toggle, bold colourful glassmorphism.

## Tech stack
- React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + shadcn/ui (`src/components/ui`)
- React Router v6, TanStack Query, Framer Motion, Recharts
- Backend: Supabase (Postgres + RLS, Auth, Storage, Edge Functions in Deno)
- PWA (`public/manifest.json`, service worker) + Capacitor Android wrapper (`capacitor.config.ts`, see `NATIVE_BUILD.md`)
- Run: `npm install` then `npm run dev` (port 8080)

## Folder map
- `src/App.tsx` — all routes. `ProtectedRoute` sends signed-out users to `/`, unverified email users to `/verify-email`.
- `src/pages/` — one file per screen:
  - Public: `Welcome` (landing at `/`), `onboarding/PhoneLogin`, `OtpVerify`, `ForgotPassword`, `ResetPassword`, `VerifyEmail`
  - Signed-in: `onboarding/ProfileSetup`, `Dashboard`, `Income`, `Savings`, `Loans`, `Transactions`, `Analytics`, `Expenses`, `Notifications`, `Services`, `UpiQr`, `Bnpl`, `DigitalGold`, `Insurance`, `Rewards`, `BillPayments`, `ChatBot`, `GroupSavings`, `CreditExport`, `SmartNudges`, `KycUpload`, `Support`, `OAuthConsent`
  - Admin: `admin/AdminDashboard` (role-gated via `user_roles` table + `has_role()`)
- `src/components/MobileLayout.tsx` — the shared phone-style shell with bottom navigation. Every signed-in screen uses it.
- `src/hooks/` — `use-auth` (session), `use-cloud-data` (backend reads), `use-language` (Hindi/English), `use-theme` (light/dark)
- `src/lib/` — `store.ts`, `store-features.ts`, `store-expenses.ts` (localStorage demo store with seeded sample data), `i18n.ts` (all Hindi/English strings), `credit-report.ts` (PDF/report export), `notifications.ts`, `native.ts` (Capacitor), `mcp/`
- `src/integrations/supabase/` — client + generated types
- `supabase/migrations/` — 13 SQL files = full database (20 tables, RLS policies, functions, triggers, pg_cron jobs for interest accrual and credit-score recalculation)
- `supabase/functions/` — edge functions: `chat`, `smart-nudges` (AI; call an OpenAI-compatible chat API), `loan-automation`, `partner-nbfc`, `mcp`

## Design system (keep identical)
- Font: **Plus Jakarta Sans** (Google Fonts, imported at top of `src/index.css`), heavy weights (800/900) for headings and numbers.
- All colours are HSL CSS variables in `src/index.css`, mapped in `tailwind.config.ts`. Never hardcode hex colours in components — use tokens (`bg-primary`, `text-muted-foreground`, etc.).
- Key tokens: background `250 100% 98%`, primary purple `262 83% 58%`, secondary pink `340 82% 52%`, accent yellow `45 100% 51%`, success `152 69% 45%`, plus warning/info/orange/pink/cyan.
- Gradients: `--gradient-primary`, `--gradient-hero` (purple → magenta → pink → orange), `--gradient-warm`, `--gradient-cool`, `--gradient-success`, etc.
- Radius `1rem`; rounded cards, glassmorphism panels, Framer Motion entrance animations.
- Dark mode is supported via the same variables — keep both themes working.

## Data model in short
- Demo data shows from browser localStorage (`src/lib/store*.ts`) so the app looks full on first open. Real data lives in Supabase tables.
- Money is stored in **paise** (integers) in an **immutable double-entry ledger** — never UPDATE or DELETE ledger rows; post reversing entries.
- Roles are in a separate `user_roles` table checked with `has_role()`. Never put roles on profiles or check admin on the client.
- Protected profile fields (credit score, KYC status, limits) are guarded by triggers — only server code changes them.
- KYC files go to private bucket `kyc-documents` via signed URLs.
- OTP requests are rate-limited server-side.

## Backend (since 2026-10-03)
- Own Supabase project `pgwhilwdivniwzrwimae` (Mumbai, ap-south-1); site hosted on Netlify at https://rozanapay.netlify.app (auto-deploys from `main`). Lovable Cloud is no longer used.
- `supabase/migrations/20261003000000_security_and_money_fixes.sql` documents the security/money fixes on top of the original 13 migrations.
- Loans: users may only INSERT `pending` loans of ₹500–10,000 (trigger `guard_loan_insert`). Statuses: pending → disbursed → (overdue) → repaid; also approved/rejected/closed.
- Ledger: `post_loan_entry` is server-only. Borrowers repay via `repay_loan()`, which only works while `app_settings.simulated_repayments = 'on'`. When a real payment gateway is added, repayments must be posted from its webhook and that setting turned off.
- Ledger order is `loan_ledger.seq`, never timestamps.
- Nightly pg_cron jobs: `run_daily_loan_charges()` (interest only after disbursal; late fee capped by `app_settings.late_fee_cap_pct`) and `recompute_all_credit_scores()`.
- Trusted SQL functions bypass protected-column guards with `set_config('rozanapay.internal','on',true)`; never use `session_replication_role`.
- Credit score = ML scorecard (`scorecard-v1`, logistic regression on WoE bins) in `public.scorecard_bins`, active version in `app_settings.credit_model_version`. Pipeline + model card in `ml/credit-model/` (trained on SYNTHETIC data — retrain on real outcomes before real lending). Feature names in `compute_credit_score` must match `ml/credit-model/generate_data.py`.
- Safe to spend (`/safe-to-spend`, dashboard card): next-7-day income forecast in `src/lib/forecast.ts` (weighted weekday profile + calibrated careful estimate), method chosen by backtest in `ml/cashflow-forecast/` (simulated data; see its MODEL_CARD). Python/TS parity tests there.
- Govt benefits finder (`/benefits`): on-device eligibility rules in `src/lib/benefits.ts`; re-check schemes and bump `BENEFITS_CHECKED_ON`.
- AI functions (`chat`, `smart-nudges`) need the `AI_API_KEY` secret (any OpenAI-compatible API; defaults to Gemini). `chat` requires a signed-in user's token.

## Rules
1. Keep the look identical; compare with `docs/screenshots/` and the live demo.
2. Every new table: GRANTs + RLS enabled + policies in the same migration.
3. Never commit private keys. `.env` only holds public values (URL, publishable key, project id). Secrets go into Supabase function secrets.
4. Do not hand-edit `src/integrations/supabase/types.ts` — regenerate it.
5. Keep every user-visible string in both Hindi and English via `src/lib/i18n.ts`.

## Known gaps (next work)
Done since the move: honest landing stats, Privacy/Terms (`/privacy`, `/terms`, content in `src/lib/legal.ts`), account deletion (`delete-account` function), real Transactions page, honest loan KFS (no fake lender/grievance contacts), Capacitor appId `in.rozanapay.app` with no Lovable `server` block.
Still open: real payment rails (Razorpay/Cashfree + webhooks into ledger, then set `simulated_repayments` off), real KYC provider (DigiLocker/Digio), SMS provider for phone OTP, tests + CI, error monitoring, Play Store assets, demo-only screens on `src/lib/store.ts` (Gold, Insurance, Bills, Group Savings, UPI QR), real NBFC partner in the KFS, contact email + Grievance Officer in `LEGAL_CONFIG`.
