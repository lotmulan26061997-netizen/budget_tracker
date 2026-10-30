# Budget Tracker · កម្មវិធីតាមដានថវិកា

A lightweight personal budget tracker with bilingual Khmer/English UI, dark mode, and cloud sync via Supabase.

## Features

- **Track income, expenses & savings deposits** across pay periods
- **10 expense categories** (Rent, Food, Travel, Phone, etc.)
- **Auto-calculated summaries** — savings rate, cumulative totals, target vs. actual
- **Cloud sync** — data stored in Supabase with user authentication
- **Offline mode** — works with localStorage when not logged in
- **Dark mode** — follows system preference
- **Backup & restore** — export/import JSON data
- **Copy to Excel** — one-click TSV export
- **Bilingual** — English + Khmer labels

## Project Structure

```
budget_tracker/
├── index.html              # Entry point with auth screen + app shell
├── css/
│   └── style.css           # All styles (theme, layout, auth, components)
├── js/
│   ├── supabase-client.js  # Supabase init, auth & CRUD functions
│   └── app.js              # Application logic & views
├── sql/
│   └── schema.sql          # Database schema (run in Supabase SQL Editor)
├── .gitignore
└── README.md
```

## Mobile & PWA Installation

You can install this app on any smartphone like a native iOS or Android app:

### On iPhone (Safari):
1. Open the deployed website in Safari.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. The app icon will now appear on your iPhone home screen and run full-screen without browser bars!

### On Android (Chrome):
1. Open the website in Google Chrome.
2. Tap the **"Install"** button in the top bar (or tap the 3 dots menu `⋮` → **"Install app"** / **"Add to Home screen"**).
3. Tap **Install**.

---

## Setup

### 1. Supabase Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Paste and run the contents of `sql/schema.sql`

### 2. Local Development

No build step required — open `index.html` in a browser or use a local server:

```bash
npx serve .
```

### 3. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the repository → Framework: **Other** → **Deploy**

## Auth

- **Sign up** with email + password (Supabase Auth)
- **Offline mode** available for localStorage-only usage
- Existing local data can be imported to the cloud after signing in

## Data Storage

| Mode    | Storage          | Sync   |
|---------|-----------------|--------|
| Online  | Supabase (cloud) | ✅ Real-time across devices |
| Offline | localStorage     | ❌ Browser-only |
