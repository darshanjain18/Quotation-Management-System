# QMS — Quotation Management System

Professional software quotation management app built with React (Vite), Supabase Auth/PostgreSQL, and Tailwind CSS.

## Features

- Email/password authentication with session restore and protected routes
- Create, edit, list, view, search, filter, and delete quotations
- Dynamic product/service line items with live INR totals
- GST rate selection (default 18%)
- Dashboard metrics from real Supabase data
- Print-friendly quotation document layout
- PDF download for individual quotations
- Row Level Security and atomic `upsert_quotation` RPC

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + Vite + JavaScript |
| Routing | React Router |
| Backend/DB/Auth | Supabase |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |
| PDF | jsPDF + jspdf-autotable |
| Tests | Vitest + Testing Library |
| Deploy | Vercel |

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill `.env` with your Supabase project values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

4. Apply SQL migrations in your Supabase project (SQL Editor), in order:
   - [`supabase/migrations/20260318000000_quotations_schema.sql`](supabase/migrations/20260318000000_quotations_schema.sql)
   - [`supabase/migrations/20260318000001_restrict_direct_table_writes.sql`](supabase/migrations/20260318000001_restrict_direct_table_writes.sql) (required if the first migration was applied before write restrictions were added)
   - Confirm tables `quotations` and `quotation_items` exist
   - Confirm function `upsert_quotation` exists

5. In Supabase Auth settings, enable **Email** provider and create a test user (Authentication → Users → Add user).

6. Start the app:

```bash
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key (safe for browser with RLS) |

Never commit `.env` or the service-role key.

## Database security notes

- RLS is enabled on `quotations` and `quotation_items`
- Policies restrict access to `auth.uid()` ownership
- Saves go through `upsert_quotation(jsonb)`, which:
  - Uses `auth.uid()` for `user_id` (client cannot spoof owner)
  - Recalculates line totals, GST, and grand total server-side
  - Writes header + items atomically
- Direct INSERT/UPDATE on quotation tables is revoked for authenticated clients so totals cannot be spoofed via the API

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel Environment Variables.
4. Deploy. `vercel.json` rewrites all routes to `index.html` for React Router.
5. In Supabase Auth → URL configuration, add your Vercel URL to Site URL / Redirect URLs.

### Deployment checklist

- [ ] Both SQL migrations applied in Supabase
- [ ] Email auth enabled + test user created
- [ ] Local `.env` works (`npm run dev`)
- [ ] `npm test`, `npm run lint`, `npm run build` pass
- [ ] GitHub repo has no secrets (`.env` not committed)
- [ ] Vercel env vars set
- [ ] Live smoke test: login → create → view → PDF → delete

## Assignment calculation example

| Field | Value |
|-------|-------|
| Product | Accounting Software |
| Qty | 2 |
| Unit price | ₹25,000 |
| Discount | 5% |
| Subtotal | ₹47,500 |
| GST 18% | ₹8,550 |
| Grand total | ₹56,050 |

## Submission package (PDF assignment)

Fill these before submitting:

| Item | Value |
|------|-------|
| GitHub Repository | `https://github.com/YOUR_USER/YOUR_REPO` |
| Live Vercel URL | `https://YOUR_APP.vercel.app` |
| Test login email | _(your Supabase Auth test user email)_ |
| Test login password | _(your Supabase Auth test user password)_ |

Expected demo flow: Login → Create Quotation → Add Products → Auto Calculate → Save → View List → View Quotation → Download PDF / Print → Delete → confirm live on Vercel.

## License

Private assignment project.
