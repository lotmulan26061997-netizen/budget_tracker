# Budget Tracker · កម្មវិធីតាមដានថវិកា

A lightweight personal budget tracker with bilingual Khmer/English UI, dark mode support, and local storage persistence.

## Features

- **Track income, expenses & savings deposits** across pay periods
- **10 expense categories** (Rent, Food, Travel, Phone, etc.)
- **Auto-calculated summaries** — savings rate, cumulative totals, target vs. actual
- **Dark mode** — follows system preference or manual toggle
- **Backup & restore** — export/import JSON data
- **Copy to Excel** — one-click TSV export
- **Bilingual** — English + Khmer labels

## Project Structure

```
budget_tracker/
├── index.html          # Main HTML entry point
├── css/
│   └── style.css       # All styles (theme, layout, components)
├── js/
│   └── app.js          # Application logic
├── .gitignore
└── README.md
```

## Getting Started

No build step required — just open `index.html` in a browser or deploy to any static host.

### Local Development

```bash
# Using Python
python3 -m http.server 3000

# Using Node
npx serve .
```

### Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Framework Preset: **Other**
5. Click **Deploy**

That's it — Vercel serves static files out of the box with no configuration needed.

## Data Storage

All data is stored in the browser's `localStorage` under the key `lkb1`. Use the **Settings → Backup** section to export/import your data.
