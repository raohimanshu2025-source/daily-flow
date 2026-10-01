# RozanaPay — Backend Setup Checklist

Follow this in order to stand up the RozanaPay backend on a fresh Supabase project. Read `HANDOVER.md` first for the full picture.

## Step 1 — Create the project
1. Go to https://supabase.com → New project → pick a name, region (Mumbai recommended for India), and a strong database password. Save the password somewhere safe.
2. Wait for the project to finish provisioning (~2 min).

## Step 2 — Apply the database design
All 13 migration files live in `supabase/migrations/` in timestamp order. They create 20 tables, ~60 RLS policies, 14 functions, 13 triggers, and the nightly pg_cron jobs (interest accrual + credit-score recomputation).

Option A (SQL Editor, simplest):
1. Open Supabase Dashboard → SQL Editor → New query.
2. Paste each migration file's contents **in filename order**, running one at a time.
3. Confirm no errors after each run.

Option B (CLI):
```sh
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Verify: Table Editor should show 20 tables (profiles, loans, loan_ledger, savings_goals, income_logs, expenses, bnpl_orders, user_roles, notifications, etc.).

## Step 3 — Create the storage bucket
1. Dashboard → Storage → New bucket.
2. Name: `kyc-documents` (exact spelling — the app references it).
3. Set **Public: OFF** (private). KYC documents must only be reachable via signed URLs.

## Step 4 — Configure Auth
1. Dashboard → Authentication → Providers.
2. **Email**: enable (on by default). For production, disable "Confirm email" only if you have another verification path; otherwise leave it on.
3. **Phone (OTP)**: enable, then connect an SMS provider — Twilio or MSG91. This requires a paid account with the provider and is the biggest external dependency. Until this is done, phone login will not send real OTPs.
4. **Google (optional)**: enable, create OAuth credentials in Google Cloud Console, and add your app's URL to the allowed redirect URLs.
5. Authentication → URL Configuration: set Site URL to your app's URL and add it to Redirect URLs.

## Step 5 — Deploy the 5 edge functions
```sh
supabase functions deploy chat
supabase functions deploy loan-automation
supabase functions deploy mcp
supabase functions deploy partner-nbfc
supabase functions deploy smart-nudges
```
(Or deploy each from the Dashboard → Edge Functions.)

## Step 6 — Set edge-function secrets
Dashboard → Edge Functions → Secrets (or `supabase secrets set`):
- `LOVABLE_API_KEY` — used by `chat` and `smart-nudges` for AI. If moving off Lovable, replace with your own OpenAI-compatible API key and update those two functions.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase provides these automatically; verify they exist.

## Step 7 — Point the frontend at the new backend
Update `.env` in the repo root:
```
VITE_SUPABASE_PROJECT_ID=<your-new-project-ref>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-new-anon-key>
VITE_SUPABASE_URL=https://<your-new-project-ref>.supabase.co
```
Find these in Dashboard → Project Settings → API. These three are public-by-design client values.

## Step 8 — Smoke test
1. `npm run dev` → sign up with email → confirm a row appears in `profiles`.
2. Log an income entry → check it appears in `income_logs`.
3. Apply for a loan → check `loans` row + `loan_ledger` entries.
4. Upload a KYC doc → confirm it lands in the `kyc-documents` bucket.

## Known limitations after setup
- Money movement is simulated — real payments need Razorpay/Cashfree + webhook reconciliation into `loan_ledger`.
- Real KYC verification (Digio etc.) is not wired; only upload + admin review exists.
- The old app's user data does not transfer — this is a fresh, empty backend.
