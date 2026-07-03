const PROMO_END = new Date("2026-07-15T23:59:59");
const FORM_EMAIL = "akuazuk@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(FORM_EMAIL)}`;
const SITE_URL = "https://akuazuk.github.io/mrs-scheta/";

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
  initIcons();
}

init();
