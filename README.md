# Quotation Management System (QMS)

A production-ready web application for creating, managing, and exporting software quotations. Users authenticate securely, build quotations with customer details and product line items, calculate GST and totals automatically, and export print/PDF documents — all backed by Supabase Auth, PostgreSQL, and Row Level Security.

## Highlights

- Secure email/password authentication with persistent sessions
- Full quotation CRUD with search, status filters, and sorting
- Line-item pricing with quantity, unit price, discount, and GST
- Atomic create/update via a single Postgres RPC (`upsert_quotation`)
- Dashboard metrics for volume, revenue, and expired quotations
- Print-ready document view and client-side PDF download
- Per-user data isolation with RLS and restricted direct table writes

## Technology stack

| Area | Choice |
|------|--------|
| UI | React 19, Vite, React Router, Tailwind CSS |
| Forms & validation | React Hook Form, Zod |
| Backend | Supabase Auth + PostgreSQL |
| PDF | jsPDF, jspdf-autotable |
| UX helpers | Lucide icons, Sonner toasts |
| Quality | Vitest, ESLint |
| Hosting | Vercel (SPA rewrites via `vercel.json`) |

## Project structure

```
src/
  app/                 # Router
  components/ui/       # Shared UI primitives
  features/
    auth/              # Session provider, route guards
    quotations/        # Forms, calculations, schema, services, PDF
  layouts/             # Authenticated shell (sidebar)
  pages/               # Route-level screens
  lib/                 # Supabase client
  utils/               # Money formatting, country dial codes
supabase/migrations/   # Schema, RLS, RPC, write restrictions
```

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project with Email auth enabled

### Install

```bash
npm install
cp .env.example .env
```

### Environment variables

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

Keep `.env` out of version control. `.env.example` documents the required keys.

### Database

In the Supabase SQL Editor, run these migrations in order:

1. `supabase/migrations/20260318000000_quotations_schema.sql`  
   Tables, indexes, RLS policies, `round_money`, and `upsert_quotation`
2. `supabase/migrations/20260318000001_restrict_direct_table_writes.sql`  
   Revokes direct client writes; mutations go through the RPC

Then create a test user under **Authentication → Users**.

### Run locally

```bash
npm run dev
```

Other commands:

```bash
npm run build
npm run lint
npm test
```

## Architecture notes

- **Auth**: `AuthProvider` restores the session on load and exposes `signIn` / `signOut`. Protected routes redirect unauthenticated users to `/login`.
- **Writes**: Quotation create/update (including line items and server-calculated totals) goes through `upsert_quotation` so clients cannot persist mismatched totals.
- **Reads / deletes**: Authenticated clients can `select` quotations and items, and `delete` quotations they own. RLS enforces `user_id = auth.uid()`.
- **Calculations**: Shared helpers in `src/features/quotations/calculations.js` keep form previews aligned with persisted amounts.
- **PDF**: `exportQuotationPdf` mirrors the on-screen document layout; currency uses `Rs.` because the ₹ glyph is unreliable in jsPDF.

## Validation rules

| Rule | Detail |
|------|--------|
| Customer name | Required |
| Email | Optional; must be valid when provided |
| Quantity | Integer greater than 0 |
| Unit price | ≥ 0 |
| Discount | 0–100% |
| Products | At least one line item |
| Quotation date | Required |
| Valid until | Optional; must be on or after quotation date |

## Sample calculation

| Input | Value |
|-------|-------|
| Product | Accounting Software |
| Quantity | 2 |
| Unit price | ₹25,000 |
| Discount | 5% |
| GST rate | 18% |

**Result:** subtotal ₹47,500 · GST ₹8,550 · total ₹56,050

## Deployment (Vercel)

1. Push the repository to GitHub (without `.env`).
2. Import the project in Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Deploy, then add the production URL to Supabase Auth URL settings.
5. Smoke-test login, create, edit, view, delete, print, and PDF export.

## Submission

| Item | Value |
|------|-------|
| GitHub repository | `https://github.com/YOUR_USER/YOUR_REPO` |
| Live URL | `https://YOUR_APP.vercel.app` |
| Test email | your test user email |
| Test password | your test user password |
