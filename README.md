# RozanaPay 💸

**A full-stack fintech super-app for India's 100M+ unbanked gig workers** — combining daily income tracking, automated micro-savings, AI-driven behavioral credit scoring, instant micro-loans (₹500–₹10,000), and RBI-compliant digital lending infrastructure.

🔗 **Live demo**: https://rozana-pocket-power.lovable.app

---

## Why RozanaPay?

India's gig workers — delivery partners, drivers, domestic helpers — earn daily in cash but are invisible to traditional credit bureaus. Banks reject them; loan sharks exploit them. RozanaPay turns their **daily income + savings behavior** into a credit identity, powering an income → save → borrow loop that no Indian fintech currently offers to this segment.

## ✨ Key Features

| Area | What's built |
|---|---|
| **Income & Dashboard** | Daily income logging, cash-flow analytics, savings-goal tracking |
| **Automated Micro-Savings** | Fixed-daily and percentage-based savings automation |
| **AI Credit Scoring** | 300–900 behavioral score (10 factors), nightly scheduled recomputation, score-history tracking |
| **Micro-Loans** | ₹500–₹10k loans, immutable double-entry ledger (paise precision), atomic disbursement RPCs, idempotency guards |
| **Repayments** | UPI-mandate repayment flow with authorization + reminders |
| **RBI Digital Lending Compliance** | Key Fact Statements (KFS) with net disbursal, APR/fee disclosures, cooling-off period, consent capture, grievance-redressal portal with SLA tracking |
| **KYC** | Aadhaar/PAN document upload with signed, expiring URLs + admin review workflow |
| **Financial Identity Export** | Branded PDF credit report users can share with banks |
| **Engagement** | AI chatbot, smart nudges, streak-based coin rewards |
| **Admin Suite** | Role-based loan approval, KYC review, audit-log viewer, risk boards |
| **DPDP Compliance** | "Download my data" (JSON) self-service export |
| **MCP Server** | OAuth 2.1-protected MCP server exposing profile/loan tools |

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- **Backend**: Lovable Cloud (managed PostgreSQL with Row-Level Security, Edge Functions, Auth)
- **PWA + Native**: Installable PWA with offline asset caching; Capacitor-ready for Android builds
- **Security**: RLS on every table, audit logging, OTP rate limiting, signed KYC URLs, separate `user_roles` table with security-definer checks, immutable ledger triggers

## 🏗 Architecture Highlights

- **Immutable financial ledger** — database triggers block updates/deletes; every entry is paise-precise and idempotent
- **Compliance by design** — digital-lending disclosures, grievance SLA, DPDP data export built into the schema, not bolted on
- **Least-privilege access** — sensitive functions locked to service role; admin actions scoped via `has_role()` security-definer functions
- **Low-literacy UX** — large tap targets, bilingual (Hindi/English), bold glassmorphism design

## 🚀 Getting Started

```sh
npm install
npm run dev
```

## 📌 Status

MVP complete (13 build phases: security core → native wrapper → ledger → credit engine → repayment automation → admin suite → RBI/DPDP compliance → MCP). Live demo is fully functional with simulated money movement; production lending requires a licensed NBFC/bank partner and live payment rails.

---

> ⚠️ Demo build — does not process real money. Regulatory model designed for licensed NBFC partnership per RBI digital lending guidelines.
