// ===== Categories =====
const OUT = [
  ["Rent", "ជួលផ្ទះ"],
  ["Food", "ម្ហូប"],
  ["Travel", "ធ្វើដំណើរ"],
  ["Phone", "ទូរស័ព្ទ"],
  ["Laundry", "បោកគក់"],
  ["Water", "ទឹកផឹក"],
  ["Parking", "ចតម៉ូតូ"],
  ["Fun", "កម្សាន្ត"],
  ["Family fund", "មូលនិធិគ្រួសារ"],
  ["Other", "ផ្សេងៗ"],
];
const INC = [
  ["Salary", "ប្រាក់ខែ"],
  ["Freelance", "Freelance"],
  ["Other", "ផ្សេងៗ"],
];
const SV = [
  ["Savings account", "គណនីសន្សំ"],
  ["Cash savings", "សន្សំជាសាច់ប្រាក់"],
];

// ===== State =====
let S = { s: { target: 20, start: "2026-11-02", n: 14 }, tx: [] },
  tab = "add",
  per = null;

try {
  const r = localStorage.getItem("lkb1");
  if (r) S = Object.assign(S, JSON.parse(r));
} catch (e) {}

const save = () => {
  try {
    localStorage.setItem("lkb1", JSON.stringify(S));
  } catch (e) {}
};

// ===== Helpers =====
const $ = (v) =>
  (v < 0 ? "-" : "") +
  "$" +
  Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );

const today = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

function pd(i) {
  const [y, m, d] = S.s.start.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + i, d)).toISOString().slice(0, 10);
}

const dd = (i) => (Date.parse(pd(i + 1)) - Date.parse(pd(i))) / 864e5;

function po(d) {
  for (let i = 0; i < S.s.n; i++) if (pd(i) <= d && d < pd(i + 1)) return i;
  return -1;
}

const fd = (s) => {
  const [y, m, d] = s.split("-");
  return (
    d +
    "-" +
    [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ][m - 1] +
    "-" +
    y
  );
};

// ===== Calculations =====
function calc() {
  const R = [];
  for (let i = 0; i < S.s.n; i++)
    R.push({ i, a: pd(i), b: pd(i + 1), inc: 0, dep: 0, c: OUT.map(() => 0) });

  S.tx.forEach((t) => {
    const i = po(t.d);
    if (i < 0) return;
    const r = R[i];
    if (t.t == "in") r.inc += t.a;
    else if (t.t == "sv") r.dep += t.a;
    else {
      const k = OUT.findIndex((c) => c[0] == t.c);
      r.c[k < 0 ? 9 : k] += t.a;
    }
  });

  let cum = 0,
    cd = 0;
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

const cl = (v) => (v > 0.005 ? "p" : v < -0.005 ? "n" : "");

// ===== Navigation =====
function nav() {
  document.getElementById("nav").innerHTML = [
    ["add", "Add · បញ្ចូល"],
    ["sum", "Summary · សង្ខេប"],
    ["set", "Settings · ការកំណត់"],
  ]
    .map(
      ([k, l]) =>
        `<button class="${tab == k ? "on" : ""}" onclick="tab='${k}';draw()">${l}</button>`
    )
    .join("");
}

function draw() {
  nav();
  document.getElementById("v").innerHTML =
    tab == "add" ? vAdd() : tab == "sum" ? vSum() : vSet();
  if (tab == "add") cats();
}

// ===== Add View =====
function vAdd() {
  if (per === null) {
    const p = po(today());
    per = p < 0 ? 0 : p;
  }
  const tx = S.tx
    .filter((t) => po(t.d) == per)
    .sort((a, b) => b.d.localeCompare(a.d));
  const R = calc()[per] || { inc: 0, out: 0, sav: 0, dep: 0 };

  return `<div class="k"><div class="mu">Income<b>${$(R.inc)}</b></div><div class="mu">Spending<b>${$(R.out)}</b></div><div class="mu">Savings<b class="${cl(R.sav)}">${$(R.sav)}</b></div><div class="mu">Deposited<b>${$(R.dep)}</b></div></div>
<div class="card"><b>New entry · ការបញ្ចូលថ្មី</b><div class="g"><div><label>Date</label><input type="date" id="d" value="${today()}"></div>
<div><label>Type</label><select id="t" onchange="cats()"><option value="out">Expense · ចំណាយ</option><option value="in">Income · ចំណូល</option><option value="sv">Savings deposit · ដាក់ប្រាក់សន្សំ</option></select></div>
<div><label>Category</label><select id="c"></select></div><div><label>Amount ($)</label><input id="a" type="number" step="0.01" min="0" placeholder="0.00"></div></div>
<label>Note (optional)</label><input id="n" maxlength="80"><button class="btn" onclick="add()">Add entry</button> <span class="mu" id="m"></span></div>
<div class="card"><label>Pay period · រយៈពេល</label><select onchange="per=+this.value;draw()">${Array.from(
    { length: S.s.n },
    (_, i) =>
      `<option value="${i}" ${i == per ? "selected" : ""}>${fd(pd(i))} → ${fd(pd(i + 1))}</option>`
  ).join("")}</select>
${
  tx.length
    ? tx
        .map(
          (t) =>
            `<div class="tx"><span>${fd(t.d)} · ${t.t == "in" ? "＋" : t.t == "sv" ? "🏦" : "−"} ${esc(t.c)}${t.n ? " · " + esc(t.n) : ""}</span><span><b class="${t.t == "out" ? "n" : "p"}">${$(t.a)}</b> <button onclick="del(${t.id})" title="Delete">✕</button></span></div>`
        )
        .join("")
    : '<p class="mu">No entries in this period yet.</p>'
}</div>`;
}

function cats() {
  const t = document.getElementById("t");
  if (!t) return;
  document.getElementById("c").innerHTML = (
    t.value == "in" ? INC : t.value == "sv" ? SV : OUT
  )
    .map((c) => `<option value="${c[0]}">${c[0]} · ${c[1]}</option>`)
    .join("");
}

function add() {
  const d = document.getElementById("d").value,
    a = parseFloat(document.getElementById("a").value);
  if (!d || !(a > 0)) {
    document.getElementById("m").textContent =
      "Enter a date and an amount above 0.";
    return;
  }
  if (po(d) < 0) {
    document.getElementById("m").textContent =
      "That date is outside the pay periods in Settings.";
    return;
  }
  S.tx.push({
    id: Date.now(),
    d,
    t: document.getElementById("t").value,
    c: document.getElementById("c").value,
    a: Math.round(a * 100) / 100,
    n: document.getElementById("n").value,
  });
  per = po(d);
  save();
  draw();
}

function del(id) {
  S.tx = S.tx.filter((t) => t.id != id);
  save();
  draw();
}

// ===== Summary View =====
function vSum() {
  const R = calc(),
    T = { inc: 0, out: 0, dep: 0, c: OUT.map(() => 0) };
  R.forEach((r) => {
    T.inc += r.inc;
    T.out += r.out;
    T.dep += r.dep;
    r.c.forEach((v, k) => (T.c[k] += v));
  });
  const sv = T.inc - T.out,
    pc = T.inc ? sv / T.inc : 0;

  return `<div class="k"><div class="mu">Total income<b>${$(T.inc)}</b></div><div class="mu">Total spending<b>${$(T.out)}</b></div><div class="mu">Total savings<b class="${cl(sv)}">${$(sv)}</b></div><div class="mu">Deposited<b>${$(T.dep)}</b></div><div class="mu">Still to deposit<b>${$(sv - T.dep)}</b></div><div class="mu">Savings rate<b class="${pc * 100 >= S.s.target ? "p" : "n"}">${(pc * 100).toFixed(1)}%</b></div></div>
<div class="card sc"><table><tr><th>#</th><th>Payday</th><th>Days</th><th>Income</th>${OUT.map((c) => `<th>${c[0]}<br>${c[1]}</th>`).join("")}<th>Total spending</th><th>Savings</th><th>%</th><th>Target</th><th>vs target</th><th>Cumulative</th><th>Deposited</th><th>To deposit</th></tr>
${R.map(
  (r) =>
    `<tr class="${r.inc || r.out ? "" : "z"}"><td>${r.i + 1}</td><td>${fd(r.a)}</td><td>${dd(r.i)}</td><td>${$(r.inc)}</td>${r.c.map((v) => `<td>${v ? $(v) : "-"}</td>`).join("")}<td>${$(r.out)}</td><td class="${cl(r.sav)}">${$(r.sav)}</td><td>${(r.pct * 100).toFixed(1)}%</td><td>${$(r.tg)}</td><td class="${cl(r.vs)}">${Math.abs(r.vs) < 0.005 ? "-" : $(r.vs)}</td><td>${$(r.cum)}</td><td>${r.dep ? $(r.dep) : "-"}</td><td class="${cl(r.gap)}">${$(r.gap)}</td></tr>`
).join("")}
<tr class="t"><td colspan="3">Total</td><td>${$(T.inc)}</td>${T.c.map((v) => `<td>${$(v)}</td>`).join("")}<td>${$(T.out)}</td><td class="${cl(sv)}">${$(sv)}</td><td>${(pc * 100).toFixed(1)}%</td><td>${$((T.inc * S.s.target) / 100)}</td><td></td><td>${$(sv)}</td><td>${$(T.dep)}</td><td>${$(sv - T.dep)}</td></tr></table></div>
<button class="btn s" onclick="tsv()">Copy summary for Excel</button> <span class="mu" id="m"></span>`;
}

function tsv() {
  const R = calc();
  const L = [
    [
      "#", "Payday", "Days", "Income",
      ...OUT.map((c) => c[0]),
      "Total spending", "Savings", "Savings %", "Target",
      "Cumulative", "Deposited", "To deposit",
    ].join("\t"),
  ];
  R.forEach((r) =>
    L.push(
      [
        r.i + 1, r.a, dd(r.i), r.inc,
        ...r.c, r.out, r.sav,
        (r.pct * 100).toFixed(1), r.tg,
        r.cum, r.dep, r.gap,
      ].join("\t")
    )
  );
  const x = L.join("\n");
  (navigator.clipboard ? navigator.clipboard.writeText(x) : Promise.reject())
    .then(
      () =>
        (document.getElementById("m").textContent =
          "Copied. Paste into Excel.")
    )
    .catch(() => {
      document
        .getElementById("v")
        .insertAdjacentHTML(
          "beforeend",
          `<textarea rows="8" readonly onfocus="this.select()">${esc(x)}</textarea>`
        );
    });
}

// ===== Settings View =====
function vSet() {
  return `<div class="card"><b>Settings · ការកំណត់</b><div class="g"><div><label>Savings target (%)</label><input id="sg" type="number" value="${S.s.target}"></div>
<div><label>First payday</label><input id="ss" type="date" value="${S.s.start}"></div><div><label>Number of pay periods</label><input id="sn" type="number" min="1" max="60" value="${S.s.n}"></div></div><button class="btn" onclick="sets()">Save settings</button> <span class="mu" id="m"></span></div>
<div class="card"><b>Backup · ការបម្រុងទុក</b><p class="mu">Data is saved in this browser only. Copy the backup text somewhere safe, and paste it back to restore.</p><textarea id="bk" rows="4">${esc(JSON.stringify(S))}</textarea><button class="btn s" onclick="rest()">Restore from text</button></div>`;
}

function sets() {
  S.s.target = +document.getElementById("sg").value || 20;
  S.s.start = document.getElementById("ss").value || S.s.start;
  S.s.n = Math.min(
    60,
    Math.max(1, +document.getElementById("sn").value || 14)
  );
  save();
  per = null;
  document.getElementById("m").textContent = "Saved.";
}

function rest() {
  try {
    const o = JSON.parse(document.getElementById("bk").value);
    if (o.s && Array.isArray(o.tx)) {
      S = { s: o.s, tx: o.tx };
      save();
      per = null;
      draw();
    }
  } catch (e) {
    alert("Backup text is not valid.");
  }
}

// ===== Init =====
draw();
