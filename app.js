const COLORS = {
  Google: "#93C5FD",
  Meta: "#F9A8D4",
  Яндекс: "#FDE68A",
  TikTok: "#C4B5FD",
};

const PLATFORM_ACCENTS = {
  Google: "#93C5FD",
  Meta: "#F9A8D4",
  Яндекс: "#FDE68A",
  TikTok: "#C4B5FD",
  "Google Ads": "#93C5FD",
};

function fmtBYN(n) {
  return (
    n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
    " BYN"
  );
}

function fmtNum(n) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

async function loadData() {
  if (typeof SITE_DATA !== "undefined") return SITE_DATA;
  const sources = [
    "data.json",
    "https://cdn.jsdelivr.net/gh/sudnik2010/cursor_disk@main/docs/data.json",
  ];
  for (const url of sources) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch (_) {}
  }
  throw new Error("Не удалось загрузить данные");
}

function renderHero(d) {
  document.getElementById("hero-year").textContent = d.year;
  document.getElementById("hero-total").textContent = fmtBYN(d.total_2026);
  document.getElementById("hero-sub").textContent =
    `${d.company.name} — счета для ${d.client.name}. ` +
    `${d.invoice_count} счетов за период ${d.period_from} — ${d.period_to}.`;
  document.getElementById("hero-meta").textContent =
    `Договор от 01.02.2024 · Без НДС`;
}

function renderStats(d) {
  const grid = document.getElementById("stats-grid");
  const m2026 = d.monthly.filter((m) => m.year === d.year);
  const avg = d.total_2026 / Math.max(m2026.length, 1);
  const peak = m2026.reduce((a, b) => (a.total > b.total ? a : b), m2026[0] || {});
  const platforms = Object.keys(d.platform_totals).length;

  const items = [
    { value: d.invoice_count, label: "Счетов в выборке" },
    { value: platforms, label: "Рекламных площадок" },
    { value: fmtBYN(avg), label: `Средний счёт / мес (${d.year})` },
    { value: peak.label || "—", label: `Пиковый месяц (${fmtBYN(peak.total || 0)})` },
  ];

  grid.innerHTML = items
    .map(
      (it) => `
    <div class="stat-card">
      <div class="stat-card__value">${it.value}</div>
      <div class="stat-card__label">${it.label}</div>
    </div>`
    )
    .join("");
}

function renderPlatforms(d) {
  document.getElementById("platform-year").textContent = d.year;
  const grid = document.getElementById("platform-grid");
  const order = ["Google", "Meta", "Яндекс", "TikTok"];

  grid.innerHTML = order
    .map((name) => {
      const amount = d.platform_totals[name] || 0;
      const share = d.shares[name] || 0;
      const accent = PLATFORM_ACCENTS[name];
      return `
      <div class="platform-card" style="--accent: ${accent}">
        <div class="platform-card__name">${name}</div>
        <div class="platform-card__amount">${fmtBYN(amount)}</div>
        <div class="platform-card__share">${share}% от бюджета ${d.year}</div>
        <div class="platform-card__bar">
          <div class="platform-card__bar-fill" style="width: ${share}%"></div>
        </div>
      </div>`;
    })
    .join("");
}

function renderServices(d) {
  const grid = document.getElementById("services-grid");
  grid.innerHTML = d.services
    .map((s) => {
      const accent = PLATFORM_ACCENTS[s.platform] || "#a1a1aa";
      return `
      <div class="service-card">
        <div class="service-card__platform" style="color: ${accent}">${s.platform}</div>
        <div class="service-card__desc">${s.desc}</div>
      </div>`;
    })
    .join("");
}

function renderCompany(d) {
  const c = d.company;
  const cl = d.client;

  document.getElementById("company-info").innerHTML = `
    <div><dt>Наименование</dt><dd>${c.full_name}</dd></div>
    <div><dt>УНП</dt><dd>${c.unp}</dd></div>
    <div><dt>Адрес</dt><dd>${c.address}</dd></div>
    <div><dt>Банк</dt><dd>${c.bank}, ${c.bic}</dd></div>
    <div><dt>Р/сч</dt><dd>${c.account}</dd></div>
    <div><dt>Директор</dt><dd>${c.director}</dd></div>
  `;

  document.getElementById("client-info").innerHTML = `
    <div><dt>Наименование</dt><dd>${cl.name}</dd></div>
    <div><dt>УНП</dt><dd>${cl.unp}</dd></div>
    <div><dt>Адрес</dt><dd>${cl.address}</dd></div>
    <div><dt>Телефон</dt><dd>${cl.phone}</dd></div>
  `;
}

function chartDefaults() {
  Chart.defaults.color = "#a1a1aa";
  Chart.defaults.borderColor = "rgba(255,255,255,0.06)";
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
}

function renderCharts(d) {
  chartDefaults();
  const monthly = d.monthly;
  const labels = monthly.map((m) => m.label);
  const platforms = ["Google", "Meta", "Яндекс", "TikTok"];

  // Line chart
  new Chart(document.getElementById("chart-lines"), {
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
        pointHoverRadius: 6,
        borderWidth: 2,
      })),
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { position: "bottom", labels: { padding: 16, usePointStyle: true } } },
      scales: {
        y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { callback: (v) => fmtNum(v) } },
        x: { grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 12 } },
      },
    },
  });

  // Doughnut
  new Chart(document.getElementById("chart-doughnut"), {
    type: "doughnut",
    data: {
      labels: platforms,
      datasets: [
        {
          data: platforms.map((p) => d.platform_totals[p] || 0),
          backgroundColor: platforms.map((p) => COLORS[p]),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "68%",
      plugins: {
        legend: { position: "bottom", labels: { padding: 16, usePointStyle: true } },
        tooltip: { callbacks: { label: (ctx) => ` ${fmtBYN(ctx.raw)}` } },
      },
    },
  });

  // Stacked bars
  new Chart(document.getElementById("chart-bars"), {
    type: "bar",
    data: {
      labels,
      datasets: platforms.map((p) => ({
        label: p,
        data: monthly.map((m) => m[p] || 0),
        backgroundColor: COLORS[p],
        borderRadius: 4,
        borderSkipped: false,
      })),
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom", labels: { padding: 16, usePointStyle: true } } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 14 } },
        y: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { callback: (v) => fmtNum(v) } },
      },
    },
  });
}

function renderFooter() {
  const now = new Date();
  document.getElementById("footer-year").textContent = now.getFullYear();
  document.getElementById("footer-date").textContent = now.toLocaleDateString("ru-RU");
}

async function init() {
  try {
    const data = await loadData();
    renderHero(data);
    renderStats(data);
    renderPlatforms(data);
    renderServices(data);
    renderCompany(data);
    renderCharts(data);
    renderFooter();
  } catch (e) {
    document.getElementById("hero-sub").textContent = "Ошибка загрузки данных: " + e.message;
    console.error(e);
  }
}

init();

// EMBEDDED_DATA
const SITE_DATA = {"company": {"name": "ООО «Мастерская рекламного слова»", "full_name": "Общество с ограниченной ответственностью «Мастерская рекламного слова»", "unp": "191762550", "address": "220004, Минск, ул. Короля, 51, оф. 37", "bank": "ОАО «Сбер Банк»", "bic": "BPSBBY2X", "account": "BY81BPSB30123394840109330000", "director": "Т.Н. Судник"}, "client": {"name": "ОДО «Медицинский центр Кравира»", "address": "220035, г. Минск, пр. Победителей, 45, оф. 25", "phone": "(017) 2242543", "unp": "101477932"}, "services": [{"platform": "Google Ads", "desc": "Разработка маркетинговой стратегии, настройка и оптимизация рекламных кампаний"}, {"platform": "Meta", "desc": "Ведение и оптимизация рекламы в Facebook и Instagram"}, {"platform": "Яндекс", "desc": "Настройка и сопровождение рекламных кампаний"}, {"platform": "TikTok", "desc": "Настройка и сопровождение рекламных кампаний"}], "year": 2026, "total_2026": 60946.13, "platform_totals": {"Google": 29762.76, "Meta": 24033.37, "Яндекс": 3850.0, "TikTok": 3300.0}, "shares": {"Google": 48.8, "Meta": 39.4, "Яндекс": 6.3, "TikTok": 5.4}, "monthly": [{"label": "фев 2025", "year": 2025, "month": 2, "Google": 3373.77, "Meta": 2471.46, "Яндекс": 0, "TikTok": 0, "total": 5845.23}, {"label": "мар 2025", "year": 2025, "month": 3, "Google": 3130.84, "Meta": 2257.87, "Яндекс": 0, "TikTok": 0, "total": 5388.71}, {"label": "апр 2025", "year": 2025, "month": 4, "Google": 3311.47, "Meta": 2271.19, "Яндекс": 0, "TikTok": 0, "total": 5582.66}, {"label": "май 2025", "year": 2025, "month": 5, "Google": 3579.33, "Meta": 2250.93, "Яндекс": 0, "TikTok": 0, "total": 5830.26}, {"label": "июн 2025", "year": 2025, "month": 6, "Google": 3617.49, "Meta": 2374.2, "Яндекс": 0, "TikTok": 0, "total": 5991.69}, {"label": "июл 2025", "year": 2025, "month": 7, "Google": 3572.48, "Meta": 2403.76, "Яндекс": 0, "TikTok": 0, "total": 5976.24}, {"label": "авг 2025", "year": 2025, "month": 8, "Google": 3776.15, "Meta": 2703.0, "Яндекс": 0, "TikTok": 0, "total": 6479.15}, {"label": "сен 2025", "year": 2025, "month": 9, "Google": 3653.79, "Meta": 2586.27, "Яндекс": 0, "TikTok": 0, "total": 6240.06}, {"label": "окт 2025", "year": 2025, "month": 10, "Google": 3788.04, "Meta": 3265.49, "Яндекс": 0, "TikTok": 0, "total": 7053.53}, {"label": "ноя 2025", "year": 2025, "month": 11, "Google": 4207.01, "Meta": 3535.89, "Яндекс": 0, "TikTok": 0, "total": 7742.9}, {"label": "дек 2025", "year": 2025, "month": 12, "Google": 4013.28, "Meta": 3747.59, "Яндекс": 0, "TikTok": 0, "total": 7760.87}, {"label": "янв 2026", "year": 2026, "month": 1, "Google": 4622.22, "Meta": 2903.43, "Яндекс": 550.0, "TikTok": 0, "total": 8075.65}, {"label": "фев 2026", "year": 2026, "month": 2, "Google": 4843.15, "Meta": 2889.89, "Яндекс": 550.0, "TikTok": 550.0, "total": 8833.04}, {"label": "мар 2026", "year": 2026, "month": 3, "Google": 4227.51, "Meta": 3045.44, "Яндекс": 550.0, "TikTok": 550.0, "total": 8372.95}, {"label": "апр 2026", "year": 2026, "month": 4, "Google": 4377.83, "Meta": 3672.26, "Яндекс": 550.0, "TikTok": 550.0, "total": 9150.09}, {"label": "май 2026", "year": 2026, "month": 5, "Google": 3960.91, "Meta": 3509.53, "Яндекс": 550.0, "TikTok": 550.0, "total": 8570.44}, {"label": "июн 2026", "year": 2026, "month": 6, "Google": 3781.48, "Meta": 4054.2, "Яндекс": 550.0, "TikTok": 550.0, "total": 8935.68}, {"label": "июл 2026", "year": 2026, "month": 7, "Google": 3949.66, "Meta": 3958.62, "Яндекс": 550.0, "TikTok": 550.0, "total": 9008.28}], "invoice_count": 49, "period_from": "2025-02", "period_to": "2026-07"};
