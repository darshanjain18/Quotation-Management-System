# QMS — Quotation Management System

## Project overview

QMS is a professional **Software Quotation Management System** for creating, calculating, saving, viewing, editing, and deleting software quotations. Authenticated users manage customer details, dynamic product/service line items, GST, and INR totals. Data is stored securely in **Supabase (PostgreSQL)** with Row Level Security, and the app is built for deployment on **Vercel**.

Core workflow: **Login → Create Quotation → Add Products → Auto Calculate → Save → View List → View Quotation → Delete**.

## Features

- Supabase email/password authentication with session restore, logout, and protected routes
- Create, edit, list, view, search, filter, sort, and delete quotations
- Customer fields: name, company, email, phone (country code + 10-digit validation)
- Quotation fields: number, date, valid until, selectable GST rate (default 18%)
- Dynamic product/service rows with add/remove
- Live calculations: line totals, subtotal, GST, grand total (INR)
- Professional quotation document view with print layout
- PDF download for individual quotations
- Dashboard with live totals from Supabase data
- Secure persistence via atomic `upsert_quotation` RPC + RLS

## Technology stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + Vite + JavaScript (JSX) |
| Routing | React Router |
| Backend / Database / Auth | Supabase (PostgreSQL + Supabase Auth) |
| Styling | Tailwind CSS v4 |
| Forms & validation | React Hook Form + Zod |
| Icons | Lucide React |
| Notifications | Sonner |
| PDF export | jsPDF + jspdf-autotable |
| Tests | Vitest + Testing Library |
| Version control | Git & GitHub |
| Deployment | Vercel |

## Installation instructions

1. Clone the repository and open the project folder.

2. Install dependencies:

```bash
npm install
```

3. Create your local environment file:

```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env` (see below).

5. Apply the Supabase SQL migrations (see **Supabase setup**).

6. Create a test Auth user in Supabase (Email provider).

7. Start the development server:

```bash
npm run dev
```

8. Open the local URL shown in the terminal (usually `http://localhost:5173`).

### Useful scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

## Required environment variables

Create a `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key (safe for the browser with RLS) |

**Important:** Never commit `.env`, service-role keys, passwords, or other secrets. Only `.env.example` should be in Git.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **Email** authentication (Authentication → Providers).
3. Copy **Project URL** and **anon/publishable key** into `.env`.
4. Open **SQL Editor** and run these migrations **in order**:
   - [`supabase/migrations/20260318000000_quotations_schema.sql`](supabase/migrations/20260318000000_quotations_schema.sql)
   - [`supabase/migrations/20260318000001_restrict_direct_table_writes.sql`](supabase/migrations/20260318000001_restrict_direct_table_writes.sql)
5. Confirm these exist:
   - Tables: `quotations`, `quotation_items`
   - Function: `upsert_quotation`
6. Create a test user: Authentication → Users → Add user.
7. After Vercel deploy, add your live site URL under Authentication → URL configuration (Site URL / Redirect URLs).

### Security notes

- RLS restricts each user to their own quotations and items
- Saves go through `upsert_quotation`, which sets `user_id` from `auth.uid()` and recalculates totals server-side
- Direct client INSERT/UPDATE on quotation tables is revoked so totals cannot be spoofed via the API

## Deployment information

### Vercel

1. Push this repository to GitHub (do not include `.env`).
2. Import the repo in [Vercel](https://vercel.com).
3. Set environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy. [`vercel.json`](vercel.json) rewrites routes to `index.html` for React Router.
5. Update Supabase Auth URLs with your Vercel domain.
6. Smoke-test the live app: login → create → view → PDF/print → delete.

### Deployment checklist

- [ ] Both SQL migrations applied in Supabase
- [ ] Email auth enabled + test user created
- [ ] Local `.env` works (`npm run dev`)
- [ ] `npm test`, `npm run lint`, `npm run build` pass
- [ ] GitHub repo has no secrets
- [ ] Vercel env vars set
- [ ] Live smoke test completed

## Validation rules

- Customer name is required
- Email must be valid when provided
- Quantity must be an integer greater than 0 (decimals not allowed)
- Price cannot be negative
- At least one product is required
- Quotation date is required

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

## Submission package

| Item | Value |
|------|-------|
| GitHub Repository | `https://github.com/YOUR_USER/YOUR_REPO` |
| Live Vercel URL | `https://YOUR_APP.vercel.app` |
| Test login email | _(your Supabase Auth test user email)_ |
| Test login password | _(your Supabase Auth test user password)_ |

## License

Private assignment project.
