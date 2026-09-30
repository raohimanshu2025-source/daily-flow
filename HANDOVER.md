# RozanaPay — Project Handover

Give this file to any AI coding assistant (Claude Code, Claude.ai, etc.) along with the repository. It contains everything needed to understand, run, and extend the project.

## 1. What this project is

RozanaPay is a fintech super-app for India's unbanked gig workers: daily income tracking, automated micro-savings, behavioral credit scoring (300–900), instant micro-loans (₹500–₹10,000), BNPL, digital gold, UPI QR, rewards, and RBI/DPDP-compliant lending infrastructure (Key Fact Statements, grievance portal with SLA, data export).

Live demo: https://rozana-pocket-power.lovable.app

## 2. Tech stack

- Frontend: React 18 + TypeScript + Vite 5, Tailwind CSS v3, shadcn/ui, Framer Motion, Recharts
- Backend: Supabase (managed PostgreSQL, Row-Level Security, Edge Functions, Auth, Storage)
- Mobile: PWA (manifest + service worker) and Capacitor-ready for Android (see NATIVE_BUILD.md)
- MCP server: `src/lib/mcp/` + `supabase/functions/mcp/` (OAuth 2.1 protected)

## 3. Run the frontend locally (verified working)

```sh
git clone <repo-url> && cd daily-flow
npm install        # or: bun install
npm run dev        # http://localhost:8080
```

Production build verified: `npm run build` succeeds (chunk-size warnings only).

The design system lives entirely in code — the palette is CSS variables in `src/index.css` + `tailwind.config.ts`, so a fresh clone renders pixel-identical to the live app.

## 4. Environment variables (.env)

```
VITE_SUPABASE_PROJECT_ID=<project ref>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon/publishable key>
VITE_SUPABASE_URL=https://<project ref>.supabase.co
```

These three are public-by-design client values. Never commit real secrets — `.env` should be gitignored once any private key is added.

## 5. Rebuilding the backend on a new Supabase project

The entire database design is captured in `supabase/migrations/` (13 files, in timestamp order). Apply them in order to a fresh Supabase project (SQL editor or `supabase db push`) to recreate:

- 20 tables with Row-Level Security (~60 policies)
- 14 functions (credit scoring, immutable loan ledger posting, OTP rate limiting, KYC admin review, audit logging, role checks via `has_role()`)
- 13 triggers (protected-column guards, ledger immutability, updated_at, UPI mandate guard, new-user profile creation)
- Scheduled jobs via pg_cron (interest accrual + nightly credit-score recomputation) — included in the migrations

Then manually:

1. Create a private storage bucket named `kyc-documents`.
2. Deploy the 5 edge functions in `supabase/functions/`: `chat`, `loan-automation`, `mcp`, `partner-nbfc`, `smart-nudges`.
3. Configure Auth: enable phone OTP (requires your own SMS provider, e.g. Twilio/MSG91 — this is the biggest external dependency), email, and optionally Google (set redirect URLs).
4. Set edge-function secrets: `LOVABLE_API_KEY` (or swap the chat function to your own LLM key), plus the standard `SUPABASE_*` vars Supabase provides automatically.

Note: `chat` and `smart-nudges` call the Lovable AI gateway; when moving off Lovable, point them at any OpenAI-compatible API instead.

## 6. Architecture rules to respect when editing

- Money is stored in paise (bigint) in an immutable double-entry ledger (`loan_ledger`) — DB triggers block UPDATE/DELETE. Never bypass; post reversing entries instead.
- Roles live ONLY in `user_roles`, checked via the `has_role()` security-definer function. Never put roles on profiles.
- Protected columns (loan status/amount, KYC status, credit score) are guarded by `prevent_protected_column_update()` — change them only through the provided RPCs.
- Every new public table needs: GRANTs, `ENABLE ROW LEVEL SECURITY`, and policies.
- Never touch schemas: auth, storage, realtime, supabase_functions, vault.
- `src/integrations/supabase/client.ts`, `previewAuthStorage.ts`, `types.ts` are auto-generated — do not edit.

## 7. Known gaps / good first tasks

- `.env` is committed to the repo (public values only today) — add a .gitignore rule.
- `src/lib/store.ts` is a legacy localStorage MVP store with seeded demo data; live pages use `src/hooks/use-cloud-data.ts`.
- Only one example test exists; no CI. Adding a test suite + GitHub Actions is high value.
- Landing page shows invented demo stats ("10L+ users", "₹50Cr+ disbursed") — replace before real use.
- Missing Privacy Policy / Terms pages.
- Payment rails are simulated — integrating Razorpay/Cashfree with webhook reconciliation into the ledger is the highest-value next feature.
- Real KYC verification (Digio etc.) is not wired; upload + admin review flow exists.
