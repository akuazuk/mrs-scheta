const PROMO_END = new Date("2026-07-15T23:59:59");

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

function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  startTimer();
  initReveal();
  initBurger();
  initForm();
}

init();
