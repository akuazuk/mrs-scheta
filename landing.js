const FORM_EMAIL = "akuazuk.ads@gmail.com";
/* Токен FormSubmit (вместо email в URL) - после активации формы в письме на FORM_EMAIL */
const FORM_TOKEN = "c5f09cf48b4ad132ef285567b601a2d3";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${FORM_TOKEN}`;
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

function chartGradient(ctx, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, 280);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

function initAiCharts() {
  if (typeof Chart === "undefined") return;
  Chart.defaults.color = "#9ca3af";
  Chart.defaults.borderColor = "rgba(99,102,241,0.06)";
  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.animation.duration = 1200;

  const growthEl = document.getElementById("chart-ai-growth");
  if (growthEl) {
    const ctx = growthEl.getContext("2d");
    new Chart(growthEl, {
      type: "line",
      data: {
        labels: ["Старт", "1 мес", "2 мес", "3 мес", "4 мес", "5 мес", "6 мес"],
        datasets: [{
          data: [100, 112, 125, 138, 149, 158, 168],
          borderColor: "#6366f1",
          backgroundColor: chartGradient(ctx, "rgba(99,102,241,0.25)", "rgba(99,102,241,0)"),
          fill: true,
          tension: 0.42,
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#6366f1",
          pointBorderWidth: 2,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, min: 90, grid: { color: "rgba(99,102,241,0.06)" }, ticks: { callback: (v) => v + "%" } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  const hoursEl = document.getElementById("chart-ai-hours");
  if (hoursEl) {
    new Chart(hoursEl, {
      type: "bar",
      data: {
        labels: ["До AI", "После AI"],
        datasets: [{
          data: [38, 12],
          backgroundColor: ["rgba(253,230,138,0.85)", "rgba(147,197,253,0.9)"],
          borderRadius: 12,
          borderSkipped: false,
          barThickness: 48,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 45, grid: { color: "rgba(99,102,241,0.06)" } },
          x: { grid: { display: false } },
        },
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
          borderWidth: 3,
          borderColor: "#fff",
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 14, boxWidth: 8 } } },
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
          data: [47, 3],
          backgroundColor: ["rgba(249,168,212,0.85)", "rgba(134,239,172,0.9)"],
          borderRadius: 10,
          borderSkipped: false,
          barThickness: 36,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: "rgba(99,102,241,0.06)" }, ticks: { callback: (v) => v + " мин" } },
          y: { grid: { display: false } },
        },
      },
    });
  }
}

function initArtMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const scenes = document.querySelectorAll("[data-art-scene]");
  if (!scenes.length) return;

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mouse = new Map();
  let ticking = false;

  const inViewObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle("art-inview", e.isIntersecting)),
    { threshold: 0.2 }
  );
  scenes.forEach((s) => inViewObs.observe(s));

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    scenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      const py = ((rect.top + rect.height * 0.42 - vh * 0.5) / vh) * 48;
      const m = mouse.get(scene) || { x: 0, y: 0 };
      scene.style.setProperty("--py", py.toFixed(1));
      scene.style.setProperty("--mx", m.x.toFixed(1));
      scene.style.setProperty("--my", m.y.toFixed(1));
    });
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  if (canHover) {
    scenes.forEach((scene) => {
      const frame = scene.closest(".art-frame");
      if (!frame) return;
      frame.addEventListener("mousemove", (e) => {
        const r = frame.getBoundingClientRect();
        mouse.set(scene, {
          x: ((e.clientX - r.left) / r.width - 0.5) * 14,
          y: ((e.clientY - r.top) / r.height - 0.5) * 10,
        });
        requestUpdate();
      });
      frame.addEventListener("mouseleave", () => {
        mouse.set(scene, { x: 0, y: 0 });
        requestUpdate();
      });
    });
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
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
  initArtMotion();
  initIcons();
}

init();
