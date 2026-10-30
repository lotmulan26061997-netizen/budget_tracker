// =========================================================
// Waypoint Budget — Core Application Logic
// =========================================================

// Category Metadata: Colors, Icons & Bilingual Names (Matches Image 2 & 3)
const CAT_META = {
  // Expense Categories
  "Rent": {
    kh: "ជួលផ្ទះ",
    type: "out",
    icon: "home",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)"
  },
  "Food": {
    kh: "ម្ហូប",
    type: "out",
    icon: "utensils",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.15)"
  },
  "Travel": {
    kh: "ធ្វើដំណើរ",
    type: "out",
    icon: "car",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)"
  },
  "Phone": {
    kh: "ទូរស័ព្ទ",
    type: "out",
    icon: "phone",
    color: "#0ea5e9",
    bg: "rgba(14, 165, 233, 0.15)"
  },
  "Laundry": {
    kh: "បោកគក់",
    type: "out",
    icon: "shirt",
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.15)"
  },
  "Water": {
    kh: "ទឹកផឹក",
    type: "out",
    icon: "droplet",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.15)"
  },
  "Parking": {
    kh: "ចតម៉ូតូ",
    type: "out",
    icon: "parking",
    color: "#14b8a6",
    bg: "rgba(20, 184, 166, 0.15)"
  },
  "Fun": {
    kh: "កម្សាន្ត",
    type: "out",
    icon: "gamepad",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.15)"
  },
  "Family fund": {
    kh: "មូលនិធិគ្រួសារ",
    type: "out",
    icon: "heart",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.15)"
  },
  "Other": {
    kh: "ផ្សេងៗ",
    type: "out",
    icon: "shopping-bag",
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.15)"
  },

  // Income Categories
  "Salary": {
    kh: "ប្រាក់ខែ",
    type: "in",
    icon: "banknotes",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)"
  },
  "Freelance": {
    kh: "Freelance",
    type: "in",
    icon: "laptop",
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.15)"
  },
  "Other Income": {
    kh: "ចំណូលផ្សេងៗ",
    type: "in",
    icon: "plus-circle",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.15)"
  },

  // Savings Categories
  "Savings account": {
    kh: "គណនីសន្សំ",
    type: "sv",
    icon: "bank",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)"
  },
  "Cash savings": {
    kh: "សន្សំជាសាច់ប្រាក់",
    type: "sv",
    icon: "wallet",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)"
  }
};

const OUT_KEYS = ["Rent", "Food", "Travel", "Phone", "Laundry", "Water", "Parking", "Fun", "Family fund", "Other"];
const IN_KEYS = ["Salary", "Freelance", "Other Income"];
const SV_KEYS = ["Savings account", "Cash savings"];

// Application State
let S = { s: { target: 20, start: "2026-11-02", n: 14 }, tx: [] };
let currentTab = "dash";
let per = null;
let currentUser = null;
let isOnline = false;
let authMode = "login";
let activeModalType = "out";
let activeModalCat = "Rent";
let spendingChartInstance = null;
let txSearchQuery = "";

// Load Local Storage
try {
  const r = localStorage.getItem("lkb1");
  if (r) S = Object.assign(S, JSON.parse(r));
} catch (e) {}

const saveLocal = () => {
  try {
    localStorage.setItem("lkb1", JSON.stringify(S));
  } catch (e) {}
};

// =========================================================
// SVG Icon Generator (Matches icons in Images 1, 2, and 3)
// =========================================================
function getSvg(name) {
  switch (name) {
    case "home": // Housing / Rent (Image 2 & 3)
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case "utensils": // Food & Dining (Image 2 & 3)
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v20"/><path d="M5 2v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2"/><path d="M7 12v10"/></svg>`;
    case "car": // Car & Transit (Image 2 & 3)
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
    case "phone":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`;
    case "shirt":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`;
    case "droplet":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-6l-4-5-4 5c-2 2.1-3 4-3 6a7 7 0 0 0 7 7z"/></svg>`;
    case "parking":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`;
    case "gamepad":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>`;
    case "heart":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    case "shopping-bag": // Shopping (Image 2 & 3)
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
    case "banknotes":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`;
    case "laptop":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>`;
    case "plus-circle":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>`;
    case "bank":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="21" y2="21"/><line x1="4" x2="20" y1="10" y2="10"/><path d="m12 3 9 7H3Z"/><line x1="6" x2="6" y1="14" y2="18"/><line x1="10" x2="10" y1="14" y2="18"/><line x1="14" x2="14" y1="14" y2="18"/><line x1="18" x2="18" y1="14" y2="18"/></svg>`;
    case "wallet":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}

function renderCatBadge(catName) {
  const meta = CAT_META[catName] || { icon: "shopping-bag", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" };
  return `<div class="cat-icon-badge" style="background:${meta.bg};color:${meta.color};">
    ${getSvg(meta.icon)}
  </div>`;
}

// Helpers
const $ = (v) => (v < 0 ? "-" : "") + "$" + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const today = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

function pd(i) {
  const [y, m, d] = S.s.start.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + i, d)).toISOString().slice(0, 10);
}

const dd = (i) => Math.round((Date.parse(pd(i + 1)) - Date.parse(pd(i))) / 864e5);

function po(d) {
  for (let i = 0; i < S.s.n; i++) {
    if (pd(i) <= d && d < pd(i + 1)) return i;
  }
  return -1;
}

const fd = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return d + "-" + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] + "-" + y;
};

// Calculations
function calc() {
  const R = [];
  for (let i = 0; i < S.s.n; i++) {
    R.push({ i, a: pd(i), b: pd(i + 1), inc: 0, dep: 0, c: OUT_KEYS.map(() => 0) });
  }

  S.tx.forEach((t) => {
    const i = po(t.d);
    if (i < 0 || !R[i]) return;
    const r = R[i];
    if (t.t === "in") r.inc += t.a;
    else if (t.t === "sv") r.dep += t.a;
    else {
      const k = OUT_KEYS.indexOf(t.c);
      r.c[k < 0 ? 9 : k] += t.a;
    }
  });

  let cum = 0, cd = 0;
  R.forEach((r) => {
    r.out = r.c.reduce((x, y) => x + y, 0);
    r.sav = r.inc - r.out;
    r.pct = r.inc ? r.sav / r.inc : 0;
    r.tg = (r.inc * S.s.target) / 100;
    r.vs = r.sav - r.tg;
    cum += r.sav;
    r.cum = cum;
    cd += r.dep;
    r.cd = cd;
    r.gap = r.sav - r.dep;
  });
  return R;
}

// =========================================================
// Navigation & Views
// =========================================================
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".nav-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  document.querySelectorAll(".mobile-bottom-nav .bnav-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function draw() {
  if (per === null) {
    const p = po(today());
    per = p < 0 ? 0 : p;
  }
  const v = document.getElementById("v");
  if (!v) return;

  if (currentTab === "dash") {
    v.innerHTML = vDashboard();
    initSpendingChart();
  } else if (currentTab === "txs") {
    v.innerHTML = vTransactions();
  } else if (currentTab === "sum") {
    v.innerHTML = vSummary();
  } else if (currentTab === "set") {
    v.innerHTML = vSettings();
  }
}

// =========================================================
// View 1: Dashboard (Matches Image 1, 2, and 3)
// =========================================================
function vDashboard() {
  const R = calc()[per] || { inc: 0, out: 0, sav: 0, dep: 0, c: OUT_KEYS.map(() => 0) };
  const tx = S.tx.filter((t) => po(t.d) === per).sort((a, b) => b.d.localeCompare(a.d));
  const isOverBudget = R.sav < 0;

  // Compute category totals for breakdown
  const categoryBreakdown = OUT_KEYS.map((name, idx) => ({
    name,
    meta: CAT_META[name],
    amount: R.c[idx] || 0,
    pct: R.out > 0 ? ((R.c[idx] || 0) / R.out) * 100 : 0
  })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

  return `
    <div class="page-header">
      <div class="page-title">
        <h1>Dashboard · ផ្ទាំងគ្រប់គ្រង</h1>
        <div class="subtitle">Pay period: ${fd(pd(per))} → ${fd(pd(per + 1))} (${dd(per)} days)</div>
      </div>
      <div class="period-control-bar">
        <button class="period-nav-btn" onclick="changePeriod(-1)" ${per <= 0 ? "disabled" : ""}>&larr; Prev</button>
        <select class="period-select" onchange="per=+this.value;draw()">
          ${Array.from({ length: S.s.n }, (_, i) => `<option value="${i}" ${i === per ? "selected" : ""}>${fd(pd(i))} → ${fd(pd(i + 1))}</option>`).join("")}
        </select>
        <button class="period-nav-btn" onclick="changePeriod(1)" ${per >= S.s.n - 1 ? "disabled" : ""}>Next &rarr;</button>
      </div>
    </div>

    <!-- 4 Top KPI Metric Cards (Image 2) -->
    <div class="metrics-grid">
      
      <!-- Income Card -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-badge income">$</div>
          <span class="metric-label">Income · ចំណូល</span>
        </div>
        <div class="metric-value income">${$(R.inc)}</div>
        <div class="metric-sub">
          <span>Target Savings: ${S.s.target}% (${$(R.tg)})</span>
        </div>
      </div>

      <!-- Spent Card -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-badge spent">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <span class="metric-label">Spent · ចំណាយ</span>
        </div>
        <div class="metric-value spent">${$(R.out)}</div>
        <div class="metric-sub">
          <span>${tx.filter((t) => t.t === "out").length} Transactions</span>
        </div>
      </div>

      <!-- Remaining / Savings Card -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-badge remaining ${isOverBudget ? "negative" : ""}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
          </div>
          <span class="metric-label">Remaining · នៅសល់</span>
        </div>
        <div class="metric-value ${isOverBudget ? "negative" : ""}">${$(R.sav)}</div>
        <div class="metric-sub">
          <span class="status-pill ${isOverBudget ? "danger" : "success"}">
            ${isOverBudget ? "Over budget" : "On track"} (${(R.pct * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      <!-- Deposited Card -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-badge deposited">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" x2="21" y1="21" y2="21"/><line x1="4" x2="20" y1="10" y2="10"/><path d="m12 3 9 7H3Z"/><line x1="6" x2="6" y1="14" y2="18"/><line x1="10" x2="10" y1="14" y2="18"/><line x1="14" x2="14" y1="14" y2="18"/><line x1="18" x2="18" y1="14" y2="18"/></svg>
          </div>
          <span class="metric-label">Deposited · បានសន្សំ</span>
        </div>
        <div class="metric-value">${$(R.dep)}</div>
        <div class="metric-sub">
          <span>Gap to deposit: ${$(R.gap)}</span>
        </div>
      </div>

    </div>

    <!-- Spending Breakdown & Categories (Matches Images 2 & 3) -->
    <div class="dashboard-grid">
      
      <!-- Actual Spending Card with Donut Chart -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Actual Spending · ចំណាយជាក់ស្តែង</div>
            <div class="card-subtitle">Where your money went this period</div>
          </div>
          <button class="btn btn-ghost" onclick="openAddModal()">+ Add</button>
        </div>

        <div class="spending-breakdown-wrapper">
          <div class="chart-center-wrapper">
            <canvas id="spendingDonutChart"></canvas>
            <div class="chart-center-label">
              <span class="lbl">SPENT</span>
              <span class="amount">${$(R.out)}</span>
              <span class="period">this period</span>
            </div>
          </div>

          <!-- Category List with custom rounded-square icons (Image 3) -->
          <div class="category-list">
            ${
              categoryBreakdown.length > 0
                ? categoryBreakdown
                    .map(
                      (c) => `
                <div class="category-row">
                  <div class="cat-left">
                    <div class="cat-icon-badge" style="background:${c.meta.bg};color:${c.meta.color};">
                      ${getSvg(c.meta.icon)}
                    </div>
                    <div class="cat-info">
                      <span class="cat-name">${c.name}</span>
                      <span class="cat-khmer">${c.meta.kh}</span>
                    </div>
                  </div>
                  <div class="cat-right">
                    <div>
                      <span class="cat-amount">${$(c.amount)}</span>
                      <span class="cat-pct">${c.pct.toFixed(1)}%</span>
                    </div>
                    <span class="cat-chevron">&rsaquo;</span>
                  </div>
                </div>
              `
                    )
                    .join("")
                : '<p style="color:var(--tx-muted);padding:20px 0;text-align:center;">No expenses recorded in this period yet.</p>'
            }
          </div>
        </div>
      </div>

      <!-- Quick Action / Period Analytics -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Cash Flow · លំហូរសាច់ប្រាក់</div>
            <div class="card-subtitle">Income vs Spent vs Net Savings</div>
          </div>
        </div>
        <div style="height:230px;">
          <canvas id="cashflowBarChart"></canvas>
        </div>
        <div style="margin-top:16px;display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);">
          <div>
            <span style="font-size:11px;color:var(--tx-muted);display:block;">SAVINGS TARGET</span>
            <span style="font-weight:700;font-size:15px;color:var(--tx-primary);">${S.s.target}%</span>
          </div>
          <div>
            <span style="font-size:11px;color:var(--tx-muted);display:block;">SAVINGS RATE</span>
            <span style="font-weight:700;font-size:15px;color:${R.pct * 100 >= S.s.target ? "var(--col-income)" : "var(--col-expense)"};">
              ${(R.pct * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span style="font-size:11px;color:var(--tx-muted);display:block;">VS TARGET</span>
            <span style="font-weight:700;font-size:15px;color:${R.vs >= 0 ? "var(--col-income)" : "var(--col-expense)"};">
              ${$(R.vs)}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- Recent Transactions Section (Image 1) -->
    <div class="card transactions-card">
      <div class="card-header">
        <div>
          <div class="card-title">Transactions · ប្រតិបត្តិការថ្មីៗ</div>
          <div class="card-subtitle">${tx.length} transactions in this pay period</div>
        </div>
        <div class="tx-header-actions">
          <input type="text" class="tx-search-input" placeholder="Search entries..." oninput="filterTransactions(this.value)">
          <button class="btn btn-primary btn-sm" onclick="openAddModal()">+ Add New</button>
        </div>
      </div>

      <div class="tx-list" id="tx-list-container">
        ${renderTxList(tx)}
      </div>
    </div>
  `;
}

function renderTxList(list) {
  if (!list || list.length === 0) {
    return `<p style="color:var(--tx-muted);padding:30px 0;text-align:center;">No transactions found in this period.</p>`;
  }
  return list
    .map((t) => {
      const meta = CAT_META[t.c] || { icon: "shopping-bag", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", kh: "" };
      const isOut = t.t === "out";
      const isIn = t.t === "in";
      const sign = isIn ? "+" : isOut ? "-" : "🏦 ";
      return `
      <div class="tx-item">
        <div class="tx-item-left">
          <div class="cat-icon-badge" style="background:${meta.bg};color:${meta.color};">
            ${getSvg(meta.icon)}
          </div>
          <div class="tx-item-meta">
            <span class="tx-title">${t.c} · ${meta.kh || ""}</span>
            <div class="tx-details">
              <span>${fd(t.d)}</span>
              ${t.n ? `<span class="tx-tag">#${esc(t.n)}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="tx-item-right">
          <span class="tx-item-amount ${t.t}">${sign}${$(t.a)}</span>
          <button class="tx-del-btn" onclick="delTx(${t.id})" title="Delete entry">&times;</button>
        </div>
      </div>
    `;
    })
    .join("");
}

function filterTransactions(q) {
  txSearchQuery = q.toLowerCase();
  const tx = S.tx.filter((t) => po(t.d) === per && (t.c.toLowerCase().includes(txSearchQuery) || (t.n && t.n.toLowerCase().includes(txSearchQuery))));
  document.getElementById("tx-list-container").innerHTML = renderTxList(tx);
}

function changePeriod(delta) {
  const next = per + delta;
  if (next >= 0 && next < S.s.n) {
    per = next;
    draw();
  }
}

// =========================================================
// Chart.js Visualizations
// =========================================================
function initSpendingChart() {
  const R = calc()[per] || { out: 0, c: OUT_KEYS.map(() => 0), inc: 0, sav: 0 };
  const categories = OUT_KEYS.map((name, idx) => ({
    name,
    amount: R.c[idx] || 0,
    color: CAT_META[name]?.color || "#94a3b8"
  })).filter((c) => c.amount > 0);

  // 1. Donut Chart
  const donutCtx = document.getElementById("spendingDonutChart");
  if (donutCtx) {
    if (spendingChartInstance) spendingChartInstance.destroy();
    spendingChartInstance = new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: categories.length ? categories.map((c) => c.name) : ["No Expenses"],
        datasets: [
          {
            data: categories.length ? categories.map((c) => c.amount) : [1],
            backgroundColor: categories.length ? categories.map((c) => c.color) : ["#1e293b"],
            borderWidth: 0,
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "76%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: $${Number(ctx.raw).toFixed(2)}`
            }
          }
        }
      }
    });
  }

  // 2. Cashflow Bar Chart
  const barCtx = document.getElementById("cashflowBarChart");
  if (barCtx) {
    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Income", "Spent", "Net Savings"],
        datasets: [
          {
            data: [R.inc, R.out, Math.max(0, R.sav)],
            backgroundColor: ["#10b981", "#ef4444", "#3b82f6"],
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: {
              color: "#94a3b8",
              callback: (v) => "$" + v
            }
          }
        }
      }
    });
  }
}

// =========================================================
// View 2: Transactions
// =========================================================
function vTransactions() {
  const allTx = S.tx.slice().sort((a, b) => b.d.localeCompare(a.d));
  return `
    <div class="page-header">
      <div class="page-title">
        <h1>All Transactions · ប្រតិបត្តិការទាំងអស់</h1>
        <div class="subtitle">Complete log of all income, expenses, and savings deposits</div>
      </div>
      <button class="btn btn-primary" onclick="openAddModal()">+ Add Transaction</button>
    </div>
    <div class="card">
      <div class="card-header">
        <input type="text" class="tx-search-input" style="width:260px;" placeholder="Search category, note, date..." oninput="filterAllTx(this.value)">
        <span style="font-size:12px;color:var(--tx-muted);">${allTx.length} Total Entries</span>
      </div>
      <div class="tx-list" id="all-tx-container">
        ${renderTxList(allTx)}
      </div>
    </div>
  `;
}

function filterAllTx(q) {
  const query = q.toLowerCase();
  const filtered = S.tx
    .filter((t) => t.c.toLowerCase().includes(query) || (t.n && t.n.toLowerCase().includes(query)) || t.d.includes(query))
    .sort((a, b) => b.d.localeCompare(a.d));
  document.getElementById("all-tx-container").innerHTML = renderTxList(filtered);
}

// =========================================================
// View 3: Summary Table Matrix
// =========================================================
function vSummary() {
  const R = calc();
  const T = { inc: 0, out: 0, dep: 0, c: OUT_KEYS.map(() => 0) };
  R.forEach((r) => {
    T.inc += r.inc;
    T.out += r.out;
    T.dep += r.dep;
    r.c.forEach((v, k) => (T.c[k] += v));
  });
  const totalSav = T.inc - T.out;
  const totalPct = T.inc ? totalSav / T.inc : 0;

  return `
    <div class="page-header">
      <div class="page-title">
        <h1>Financial Summary · សង្ខេបហិរញ្ញវត្ថុ</h1>
        <div class="subtitle">Multi-period breakdown across all categories and savings rates</div>
      </div>
      <button class="btn btn-ghost" onclick="tsv()">Copy for Excel (TSV)</button>
    </div>

    <!-- Overall Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">TOTAL INCOME</span>
        <div class="metric-value income">${$(T.inc)}</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">TOTAL SPENT</span>
        <div class="metric-value spent">${$(T.out)}</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">TOTAL SAVINGS</span>
        <div class="metric-value ${totalSav < 0 ? "negative" : "income"}">${$(totalSav)}</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">OVERALL SAVINGS RATE</span>
        <div class="metric-value ${totalPct * 100 >= S.s.target ? "income" : "negative"}">${(totalPct * 100).toFixed(1)}%</div>
      </div>
    </div>

    <!-- Matrix Table -->
    <div class="card matrix-table-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Payday</th>
            <th>Days</th>
            <th>Income</th>
            ${OUT_KEYS.map((k) => `<th>${k}<br><span style="font-size:10px;opacity:0.7;">${CAT_META[k].kh}</span></th>`).join("")}
            <th>Total Spent</th>
            <th>Savings</th>
            <th>%</th>
            <th>Target</th>
            <th>vs Target</th>
            <th>Cumulative</th>
            <th>Deposited</th>
            <th>To Deposit</th>
          </tr>
        </thead>
        <tbody>
          ${R.map(
            (r) => `
            <tr>
              <td>${r.i + 1}</td>
              <td>${fd(r.a)}</td>
              <td>${dd(r.i)}</td>
              <td>${$(r.inc)}</td>
              ${r.c.map((v) => `<td>${v ? $(v) : "-"}</td>`).join("")}
              <td>${$(r.out)}</td>
              <td class="${r.sav >= 0 ? "p-text" : "n-text"}">${$(r.sav)}</td>
              <td>${(r.pct * 100).toFixed(1)}%</td>
              <td>${$(r.tg)}</td>
              <td class="${r.vs >= 0 ? "p-text" : "n-text"}">${Math.abs(r.vs) < 0.005 ? "-" : $(r.vs)}</td>
              <td>${$(r.cum)}</td>
              <td>${r.dep ? $(r.dep) : "-"}</td>
              <td class="${r.gap >= 0 ? "p-text" : "n-text"}">${$(r.gap)}</td>
            </tr>
          `
          ).join("")}
          <tr class="total-row">
            <td colspan="3">Grand Total</td>
            <td>${$(T.inc)}</td>
            ${T.c.map((v) => `<td>${$(v)}</td>`).join("")}
            <td>${$(T.out)}</td>
            <td class="${totalSav >= 0 ? "p-text" : "n-text"}">${$(totalSav)}</td>
            <td>${(totalPct * 100).toFixed(1)}%</td>
            <td>${$((T.inc * S.s.target) / 100)}</td>
            <td></td>
            <td>${$(totalSav)}</td>
            <td>${$(T.dep)}</td>
            <td>${$(totalSav - T.dep)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function tsv() {
  const R = calc();
  const L = [
    ["#", "Payday", "Days", "Income", ...OUT_KEYS, "Total spending", "Savings", "Savings %", "Target", "Cumulative", "Deposited", "To deposit"].join("\t")
  ];
  R.forEach((r) =>
    L.push([r.i + 1, r.a, dd(r.i), r.inc, ...r.c, r.out, r.sav, (r.pct * 100).toFixed(1), r.tg, r.cum, r.dep, r.gap].join("\t"))
  );
  const x = L.join("\n");
  (navigator.clipboard ? navigator.clipboard.writeText(x) : Promise.reject())
    .then(() => alert("Summary copied to clipboard! Paste directly into Excel."))
    .catch(() => alert("Could not access clipboard. Please copy manually."));
}

// =========================================================
// View 4: Settings
// =========================================================
function vSettings() {
  return `
    <div class="page-header">
      <div class="page-title">
        <h1>Settings · ការកំណត់</h1>
        <div class="subtitle">Customize pay periods, savings goal, and backup preferences</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Budget Parameters</div>
        </div>
        <div class="form-group">
          <label>Savings Target (%) · គោលដៅសន្សំ</label>
          <input type="number" id="sg" value="${S.s.target}" min="1" max="100">
        </div>
        <div class="form-group">
          <label>First Payday Date · ថ្ងៃបើកប្រាក់ខែដំបូង</label>
          <input type="date" id="ss" value="${S.s.start}">
        </div>
        <div class="form-group">
          <label>Number of Pay Periods (Months) · ចំនួនខែ</label>
          <input type="number" id="sn" value="${S.s.n}" min="1" max="60">
        </div>
        <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
        <div id="settings-msg" class="form-msg"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Cloud Sync & Data Backup</div>
        </div>
        <p style="font-size:12.5px;color:var(--tx-muted);margin-bottom:14px;">
          ${isOnline ? "Your data is automatically synced with Supabase Cloud." : "Running offline in localStorage. Export a backup below."}
        </p>
        <div class="form-group">
          <label>Data Backup Payload (JSON)</label>
          <textarea id="bk" rows="4" readonly style="font-family:monospace;font-size:11px;">${esc(JSON.stringify(S))}</textarea>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-ghost" onclick="navigator.clipboard.writeText(document.getElementById('bk').value);alert('Backup copied!');">Copy Backup</button>
          <button class="btn btn-ghost" onclick="restoreFromPrompt()">Restore Data</button>
        </div>
      </div>
    </div>
  `;
}

async function saveSettings() {
  S.s.target = +document.getElementById("sg").value || 20;
  S.s.start = document.getElementById("ss").value || S.s.start;
  S.s.n = Math.min(60, Math.max(1, +document.getElementById("sn").value || 14));
  const msg = document.getElementById("settings-msg");

  if (isOnline) {
    try {
      msg.textContent = "Saving to cloud...";
      msg.className = "form-msg";
      await sbSaveProfile(S.s);
      msg.textContent = "Settings saved successfully!";
      msg.className = "form-msg ok";
    } catch (err) {
      msg.textContent = "Error saving: " + err.message;
      msg.className = "form-msg err";
    }
  } else {
    saveLocal();
    msg.textContent = "Settings saved locally!";
    msg.className = "form-msg ok";
  }
}

async function restoreFromPrompt() {
  const text = prompt("Paste your JSON backup text here:");
  if (!text) return;
  try {
    const o = JSON.parse(text);
    if (o.s && Array.isArray(o.tx)) {
      if (isOnline) {
        await sbImportData(o);
        await loadFromSupabase();
      } else {
        S = { s: o.s, tx: o.tx };
        saveLocal();
      }
      per = null;
      draw();
      alert("Data restored successfully!");
    }
  } catch (e) {
    alert("Invalid backup JSON.");
  }
}

// =========================================================
// Add Entry Modal Logic
// =========================================================
function openAddModal() {
  const modal = document.getElementById("add-modal");
  document.getElementById("modal-date").value = today();
  document.getElementById("modal-amount").value = "";
  document.getElementById("modal-note").value = "";
  document.getElementById("modal-msg").textContent = "";
  setType(activeModalType);
  modal.style.display = "flex";
}

function closeAddModal() {
  document.getElementById("add-modal").style.display = "none";
}

function setType(type) {
  activeModalType = type;
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });

  const keys = type === "in" ? IN_KEYS : type === "sv" ? SV_KEYS : OUT_KEYS;
  activeModalCat = keys[0];

  const pillsContainer = document.getElementById("category-pills");
  pillsContainer.innerHTML = keys
    .map((k) => {
      const meta = CAT_META[k] || { icon: "shopping-bag", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", kh: "" };
      const isActive = k === activeModalCat;
      return `
      <button type="button" class="cat-pill ${isActive ? "active" : ""}" onclick="selectModalCategory('${k}')">
        <div class="mini-icon" style="background:${meta.bg};color:${meta.color};">
          ${getSvg(meta.icon)}
        </div>
        <div>
          <span style="display:block;font-weight:600;">${k}</span>
          <span style="display:block;font-size:10px;opacity:0.7;">${meta.kh}</span>
        </div>
      </button>
    `;
    })
    .join("");
}

function selectModalCategory(cat) {
  activeModalCat = cat;
  document.querySelectorAll(".cat-pill").forEach((btn) => {
    const text = btn.querySelector("span").textContent;
    btn.classList.toggle("active", text === cat);
  });
}

async function submitModalEntry() {
  const d = document.getElementById("modal-date").value;
  const a = parseFloat(document.getElementById("modal-amount").value);
  const n = document.getElementById("modal-note").value.trim();
  const msg = document.getElementById("modal-msg");
  const btn = document.getElementById("modal-submit-btn");

  if (!d || !(a > 0)) {
    msg.textContent = "Please enter a valid date and an amount above 0.";
    msg.className = "form-msg err";
    return;
  }

  if (po(d) < 0) {
    msg.textContent = "That date is outside your configured pay periods in Settings.";
    msg.className = "form-msg err";
    return;
  }

  const entry = {
    d,
    t: activeModalType,
    c: activeModalCat,
    a: Math.round(a * 100) / 100,
    n
  };

  btn.disabled = true;
  msg.textContent = "Saving...";
  msg.className = "form-msg";

  try {
    if (isOnline) {
      const saved = await sbAddTransaction(entry);
      S.tx.push(saved);
    } else {
      entry.id = Date.now();
      S.tx.push(entry);
      saveLocal();
    }
    per = po(d);
    closeAddModal();
    draw();
  } catch (err) {
    msg.textContent = "Error: " + (err.message || "Failed to save");
    msg.className = "form-msg err";
  } finally {
    btn.disabled = false;
  }
}

async function delTx(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;
  if (isOnline) {
    try {
      await sbDeleteTransaction(id);
      S.tx = S.tx.filter((t) => t.id !== id);
      draw();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  } else {
    S.tx = S.tx.filter((t) => t.id !== id);
    saveLocal();
    draw();
  }
}

// =========================================================
// Authentication Handling
// =========================================================
function authTab(mode) {
  authMode = mode;
  const btns = document.querySelectorAll(".auth-tabs button");
  btns.forEach((b) => b.classList.remove("active"));
  btns[mode === "login" ? 0 : 1].classList.add("active");
  document.getElementById("auth-btn").textContent = mode === "login" ? "Log In" : "Sign Up";
  document.getElementById("auth-msg").textContent = "";
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById("auth-email").value.trim();
  const pass = document.getElementById("auth-pass").value;
  const msg = document.getElementById("auth-msg");
  const btn = document.getElementById("auth-btn");

  btn.disabled = true;
  msg.textContent = authMode === "login" ? "Logging in..." : "Signing up...";
  msg.className = "form-msg";

  try {
    if (authMode === "login") {
      await sbSignIn(email, pass);
    } else {
      await sbSignUp(email, pass);
      msg.textContent = "Sign up successful! Please check your email to confirm, then log in.";
      msg.className = "form-msg ok";
      btn.disabled = false;
    }
  } catch (err) {
    msg.textContent = err.message || "Authentication failed.";
    msg.className = "form-msg err";
    btn.disabled = false;
  }
}

function useOffline() {
  isOnline = false;
  currentUser = null;
  updateUserDisplay();
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("app").style.display = "flex";
  draw();
}

function updateUserDisplay() {
  const profileName = document.getElementById("profile-name");
  const fallback = document.getElementById("profile-avatar-fallback");
  const syncDot = document.getElementById("top-sync-dot");
  const syncText = document.getElementById("top-sync-text");

  let displayName = "Guest User";
  let initial = "G";

  if (currentUser && isOnline) {
    displayName = currentUser.email ? currentUser.email.split("@")[0] : "User";
    initial = (displayName || "U")[0].toUpperCase();
    if (syncDot) syncDot.classList.remove("offline");
    if (syncText) syncText.textContent = "Cloud Synced";
  } else {
    displayName = "Offline Account";
    initial = "O";
    if (syncDot) syncDot.classList.add("offline");
    if (syncText) syncText.textContent = "LocalStorage";
  }

  if (profileName) profileName.textContent = displayName;
  if (fallback) fallback.textContent = initial;

  // Mobile elements
  const mobFallback = document.getElementById("mobile-avatar-fallback");
  const mobSyncDot = document.getElementById("mobile-sync-dot");
  const mobSyncText = document.getElementById("mobile-sync-text");
  if (mobFallback) mobFallback.textContent = initial;
  if (mobSyncDot) {
    mobSyncDot.className = "sync-dot" + (isOnline && currentUser ? "" : " offline");
  }
  if (mobSyncText) {
    mobSyncText.textContent = isOnline && currentUser ? "Connected" : "Offline";
  }

  // Load avatar
  const avatarKey = "wb_avatar_" + (currentUser?.id || "guest");
  const savedAvatar = S.s?.avatar || localStorage.getItem(avatarKey);
  renderAvatar(savedAvatar);
}

function renderAvatar(avatarDataUrl) {
  const img = document.getElementById("profile-avatar-img");
  const fallback = document.getElementById("profile-avatar-fallback");
  const mobImg = document.getElementById("mobile-avatar-img");
  const mobFallback = document.getElementById("mobile-avatar-fallback");

  if (avatarDataUrl) {
    if (img) { img.src = avatarDataUrl; img.style.display = "block"; }
    if (fallback) fallback.style.display = "none";
    if (mobImg) { mobImg.src = avatarDataUrl; mobImg.style.display = "block"; }
    if (mobFallback) mobFallback.style.display = "none";
  } else {
    if (img) img.style.display = "none";
    if (fallback) fallback.style.display = "block";
    if (mobImg) mobImg.style.display = "none";
    if (mobFallback) mobFallback.style.display = "flex";
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Center crop square and compress to 180x180
      const canvas = document.createElement("canvas");
      const size = 180;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;

      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
      saveUserAvatar(compressedDataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function saveUserAvatar(dataUrl) {
  const avatarKey = "wb_avatar_" + (currentUser?.id || "guest");
  try {
    localStorage.setItem(avatarKey, dataUrl);
  } catch (e) {}

  if (!S.s) S.s = { target: 20, start: "2026-11-02", n: 14 };
  S.s.avatar = dataUrl;
  saveLocal();
  renderAvatar(dataUrl);

  if (isOnline && currentUser) {
    try {
      await sbSaveProfile(S.s);
    } catch (e) {
      console.warn("Could not sync avatar to cloud:", e);
    }
  }
}

async function handleLogout() {
  try {
    await sbSignOut();
  } catch (e) {}
  currentUser = null;
  isOnline = false;
  document.getElementById("app").style.display = "none";
  document.getElementById("auth-screen").style.display = "flex";
}

// =========================================================
// Initialization
// =========================================================
(async function init() {
  try {
    const user = await sbGetUser();
    if (user) {
      currentUser = user;
      isOnline = true;
      document.getElementById("app").style.display = "flex";
      document.getElementById("auth-screen").style.display = "none";
      updateUserDisplay();
      document.getElementById("v").innerHTML = `<p style="padding:40px;text-align:center;color:var(--tx-muted);">Loading your cloud data...</p>`;
      try {
        const [profile, transactions] = await Promise.all([sbLoadProfile(), sbLoadTransactions()]);
        S.s = profile;
        S.tx = transactions;
      } catch (e) {
        console.warn("Could not load cloud data:", e);
      }
      draw();
      return;
    }
  } catch (e) {}

  // If no user session, show auth screen
  document.getElementById("auth-screen").style.display = "flex";

  sbOnAuthChange(async (user, event) => {
    if (user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
      currentUser = user;
      isOnline = true;
      document.getElementById("app").style.display = "flex";
      document.getElementById("auth-screen").style.display = "none";
      updateUserDisplay();
      try {
        const [profile, transactions] = await Promise.all([sbLoadProfile(), sbLoadTransactions()]);
        S.s = profile;
        S.tx = transactions;
      } catch (e) {}
      draw();
    }
  });
})();

// =========================================================
// PWA Installation & Service Worker
// =========================================================
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById("pwa-install-btn");
  if (btn) btn.style.display = "inline-flex";
});

function triggerPwaInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        const btn = document.getElementById("pwa-install-btn");
        if (btn) btn.style.display = "none";
      }
      deferredInstallPrompt = null;
    });
  } else {
    // If iOS Safari or browser without prompt, show instructions
    alert("To install this app on your phone:\n\n• On iPhone (Safari): Tap the Share button (bottom center) and choose 'Add to Home Screen'.\n\n• On Android (Chrome): Tap the 3 dots menu and choose 'Install app' or 'Add to Home screen'.");
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("ServiceWorker registration skipped:", err);
    });
  });
}

