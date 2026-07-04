const FORM_EMAIL = "akuazuk.ads@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(FORM_EMAIL)}`;
const SITE_URL = "https://akuazuk.github.io/mrs-scheta/";
const CHART_COLORS = ["#93C5FD", "#C4B5FD", "#F9A8D4", "#FDE68A", "#86EFAC"];

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function getPromoEnd() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatPromoDeadline(end) {
  return `${end.getDate()} ${MONTHS_RU[end.getMonth()]} ${end.getFullYear()}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function startTimer() {
  const deadlineEl = document.getElementById("promo-deadline");
  const tick = () => {
    const end = getPromoEnd();
    if (deadlineEl) deadlineEl.textContent = formatPromoDeadline(end);
    const diff = end - Date.now();
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

function setFormState(form, msg, type, text) {
  const loader = form.querySelector(".btn__loader");
  if (msg) {
    msg.hidden = false;
    msg.textContent = text;
    msg.className = "form-msg form-msg--" + type;
  }
  form.classList.toggle("contact-form--loading", type === "loading");
  if (loader) loader.hidden = type !== "loading";
  form.querySelectorAll("input, select, textarea, button").forEach((el) => {
    if (el.name === "website") return;
    el.disabled = type === "loading" || type === "success";
  });
}

function showSentBanner() {
  if (new URLSearchParams(location.search).get("sent") !== "1") return;
  const form = document.getElementById("contact-form");
  const msg = document.getElementById("form-msg");
  if (form && msg) setFormState(form, msg, "success", "Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
  history.replaceState({}, "", location.pathname + location.hash);
}

function initForm() {
  const form = document.getElementById("contact-form");
  const msg = document.getElementById("form-msg");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const honey = form.querySelector('[name="website"]');
    if (honey && honey.value) return;

    const data = Object.fromEntries(new FormData(form));
    delete data.website;

    if (!data.name?.trim() || !data.phone?.trim()) {
      setFormState(form, msg, "error", "Укажите имя и телефон.");
      return;
    }

    setFormState(form, msg, "loading", "Отправляем заявку...");

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: "Заявка с сайта Мастерская рекламного слова",
          _captcha: "false",
          _template: "table",
          _next: SITE_URL + "?sent=1#contact",
        }),
      });

      if (!res.ok) throw new Error("send failed");

      form.reset();
      setFormState(form, msg, "success", "Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
    } catch {
      setFormState(form, msg, "error", "Не удалось отправить. Напишите на " + FORM_EMAIL + " или попробуйте позже.");
    }
  });
}

function initAiCharts() {
  if (typeof Chart === "undefined") return;
  Chart.defaults.color = "#6b7280";
  Chart.defaults.borderColor = "rgba(55,65,81,0.08)";
  Chart.defaults.font.family = "Inter, sans-serif";

  const hoursEl = document.getElementById("chart-ai-hours");
  if (hoursEl) {
    new Chart(hoursEl, {
      type: "bar",
      data: {
        labels: ["До AI", "После AI"],
        datasets: [{
          label: "Часов в неделю",
          data: [38, 12],
          backgroundColor: ["#FDE68A", "#93C5FD"],
          borderRadius: 10,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 45 } },
      },
    });
  }

  const tasksEl = document.getElementById("chart-ai-tasks");
  if (tasksEl) {
    new Chart(tasksEl, {
      type: "doughnut",
      data: {
        labels: ["Заявки", "Отчёты", "Документы", "Поддержка", "Прочее"],
        datasets: [{
          data: [35, 22, 18, 17, 8],
          backgroundColor: CHART_COLORS,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        cutout: "62%",
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 12 } } },
      },
    });
  }

  const growthEl = document.getElementById("chart-ai-growth");
  if (growthEl) {
    new Chart(growthEl, {
      type: "line",
      data: {
        labels: ["Старт", "1 мес", "2 мес", "3 мес", "4 мес", "5 мес", "6 мес"],
        datasets: [{
          label: "Эффективность, %",
          data: [100, 112, 125, 138, 149, 158, 168],
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#6366f1",
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false, min: 90 } },
      },
    });
  }

  const speedEl = document.getElementById("chart-ai-speed");
  if (speedEl) {
    new Chart(speedEl, {
      type: "bar",
      data: {
        labels: ["Вручную", "С AI"],
        datasets: [{
          label: "Минуты",
          data: [47, 3],
          backgroundColor: ["#F9A8D4", "#86EFAC"],
          borderRadius: 10,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } },
      },
    });
  }
}

function initIcons() {
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  startTimer();
  initReveal();
  initBurger();
  initForm();
  showSentBanner();
  initAiCharts();
  initIcons();
}

init();
