# ExpenseFlow — Smart Expense Management PWA

A full-stack expense management app built with Next.js 16, Supabase, and Tailwind CSS. Works as a desktop dashboard and installable mobile PWA.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Charts**: Recharts
- **Deployment**: Vercel

## Features

- 🔐 Google OAuth login via Supabase
- 💳 Multi-wallet system (Cash / Bank / E-Wallet)
- 💸 Transactions: Income, Expense, Transfer
- 📊 Dashboard with income/expense charts and category breakdown
- 🤝 Debt tracking with partial repayments and progress bars
- 📱 Mobile PWA (installable, bottom nav, numeric keypad, bottom sheets)
- ⚡ Atomic balance updates via PostgreSQL functions

---

## Setup

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) → New Project.

### 2. Run the Database Schema

In Supabase SQL Editor, run the contents of `supabase/schema.sql`.

This creates all tables, RLS policies, functions, and default categories.

### 3. Configure Google OAuth

In Supabase Dashboard → Authentication → Providers → Google:
1. Enable Google provider
2. Add your Google OAuth Client ID & Secret (from [Google Cloud Console](https://console.cloud.google.com))
3. Add `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback` to Google OAuth authorized redirect URIs

### 4. Set Environment Variables

Edit `.env.local` with your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Find these in: Supabase Dashboard → Settings → API

### 5. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add the two environment variables in Vercel project settings
4. Deploy

### After deploying, update Supabase Auth settings:
- Authentication → URL Configuration → Site URL → `https://your-app.vercel.app`
- Add `https://your-app.vercel.app/**` to Redirect URLs

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected routes with sidebar/bottom nav
│   │   ├── page.tsx          # Dashboard (charts, stats, recent txns)
│   │   ├── wallets/          # Wallet management
│   │   ├── transactions/     # Transaction list + new transaction
│   │   └── debts/            # Debt tracking
│   ├── auth/
│   │   ├── login/            # Google login page
│   │   └── callback/         # OAuth callback route
│   └── layout.tsx
├── components/
│   ├── ui/                   # Button, Card, Input, BottomSheet, NumericKeypad
│   ├── layout/               # Sidebar (desktop), BottomNav (mobile), MobileHeader
│   ├── dashboard/            # StatsCard, IncomeExpenseChart, CategoryPieChart
│   ├── wallets/              # WalletCard, WalletForm
│   ├── transactions/         # TransactionItem, TransactionForm
│   └── debts/                # DebtCard, DebtForm, RepaymentForm
├── hooks/                    # useWallets, useTransactions, useDebts, useCategories
├── lib/
│   └── supabase/             # client.ts, server.ts, middleware.ts
└── types/
    └── database.ts           # Full TypeScript types for all tables
```

## PWA Installation

1. Open the app in mobile Chrome or Safari
2. Tap Share → "Add to Home Screen"
3. The app installs as a standalone app with offline support
