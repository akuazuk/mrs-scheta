const COLORS = { Google: "#93C5FD", Meta: "#F9A8D4", Яндекс: "#FDE68A", TikTok: "#C4B5FD" };
const PROMO_END = new Date("2026-07-15T23:59:59");

function fmtBYN(n) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " BYN";
}

function fmtNum(n) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

async function loadData() {
  if (typeof SITE_DATA !== "undefined") return SITE_DATA;
  for (const url of ["data.json", "https://cdn.jsdelivr.net/gh/akuazuk/mrs-scheta@main/data.json"]) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch (_) {}
  }
  return null;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function startTimer() {
  const tick = () => {
    const diff = PROMO_END - Date.now();
    if (diff <= 0) {
      ["t-days", "t-hours", "t-mins", "t-secs"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "00";
      });
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const map = { "t-days": d, "t-hours": h, "t-mins": m, "t-secs": s };
    Object.entries(map).forEach(([id, v]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = pad(v);
    });
  };
  tick();
  setInterval(tick, 1000);
}

function initReveal() {
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
}

function initBurger() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (!burger || !nav) return;
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
}

function initForm() {
  const form = document.getElementById("contact-form");
  const msg = document.getElementById("form-msg");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.querySelectorAll("input, select, textarea, button").forEach((el) => (el.disabled = true));
    if (msg) {
      msg.hidden = false;
      msg.textContent = "Спасибо! Мы свяжемся с вами в ближайшее время.";
    }
  });
}

function renderAnalytics(d) {
  const heroTotal = document.getElementById("hero-total");
  const caseTotal = document.getElementById("case-total");
  if (heroTotal) heroTotal.textContent = fmtBYN(d.total_2026);
  if (caseTotal) caseTotal.textContent = fmtNum(d.total_2026);

  const statsEl = document.getElementById("analytics-stats");
  if (statsEl) {
    const items = [
      { v: fmtBYN(d.total_2026), l: `Итого ${d.year}` },
      { v: d.invoice_count, l: "Счетов" },
      { v: "4", l: "Площадки" },
      { v: d.shares.Google + "%", l: "Доля Google" },
    ];
    statsEl.innerHTML = items.map((i) => `<div class="stat"><strong>${i.v}</strong><span>${i.l}</span></div>`).join("");
  }

  if (typeof Chart === "undefined") return;
  Chart.defaults.color = "#6b7280";
  Chart.defaults.borderColor = "rgba(55,65,81,0.08)";
  Chart.defaults.font.family = "Inter, sans-serif";

  const monthly = d.monthly;
  const labels = monthly.map((m) => m.label);
  const platforms = ["Google", "Meta", "Яндекс", "TikTok"];

  const lineEl = document.getElementById("chart-lines");
  if (lineEl) {
    new Chart(lineEl, {
      type: "line",
      data: {
        labels,
        datasets: platforms.map((p) => ({
          label: p,
          data: monthly.map((m) => m[p] || 0),
          borderColor: COLORS[p],
          backgroundColor: COLORS[p] + "33",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 14 } } },
        scales: {
          y: { ticks: { callback: (v) => fmtNum(v) } },
          x: { ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 10 } },
        },
      },
    });
  }

  const doughEl = document.getElementById("chart-doughnut");
  if (doughEl) {
    new Chart(doughEl, {
      type: "doughnut",
      data: {
        labels: platforms,
        datasets: [{
          data: platforms.map((p) => d.platform_totals[p] || 0),
          backgroundColor: platforms.map((p) => COLORS[p]),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        cutout: "65%",
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true } } },
      },
    });
  }

  const barEl = document.getElementById("chart-bars");
  if (barEl) {
    new Chart(barEl, {
      type: "bar",
      data: {
        labels,
        datasets: platforms.map((p) => ({
          label: p,
          data: monthly.map((m) => m[p] || 0),
          backgroundColor: COLORS[p],
          borderRadius: 6,
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true } } },
        scales: {
          x: { stacked: true, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 12 } },
          y: { stacked: true, ticks: { callback: (v) => fmtNum(v) } },
        },
      },
    });
  }
}

async function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  startTimer();
  initReveal();
  initBurger();
  initForm();

  const data = await loadData();
  if (data) renderAnalytics(data);
}

init();
