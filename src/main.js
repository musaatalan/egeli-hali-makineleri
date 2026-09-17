import { translations, langLabels } from "./i18n.js";

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const header = document.querySelector(".site-header");
const menuBtn = document.querySelector(".menu-btn");
const mobileNav = document.querySelector(".mobile-nav");

const onScroll = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuBtn.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    });
  });
}

const products = document.querySelectorAll(".product");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  products.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    io.observe(el);
  });
} else {
  products.forEach((el) => el.classList.add("is-visible"));
}

/* i18n */
const supported = Object.keys(translations);
const stored = localStorage.getItem("eh-lang");
const browser = (navigator.language || "tr").slice(0, 2).toLowerCase();
let currentLang = supported.includes(stored)
  ? stored
  : supported.includes(browser)
    ? browser
    : "tr";

const langToggle = document.querySelector("[data-lang-toggle]");
const langMenu = document.querySelector("[data-lang-menu]");
const langCurrent = document.querySelector("[data-lang-current]");
const langSwitch = document.querySelector("[data-lang-switch]");

function t(key) {
  return translations[currentLang]?.[key] ?? translations.tr[key] ?? key;
}

function applyLanguage(lang) {
  if (!supported.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem("eh-lang", lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt");
    if (key) el.setAttribute("alt", t(key));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) el.setAttribute("aria-label", t(key));
  });

  const title = t("meta.title");
  const desc = t("meta.desc");
  document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", desc);

  if (langCurrent) langCurrent.textContent = langLabels[lang];

  langMenu?.querySelectorAll("[data-lang]").forEach((btn) => {
    const active = btn.getAttribute("data-lang") === lang;
    btn.setAttribute("aria-selected", String(active));
    btn.classList.toggle("is-active", active);
  });
}

function closeLangMenu() {
  if (!langMenu || !langToggle) return;
  langMenu.hidden = true;
  langToggle.setAttribute("aria-expanded", "false");
}

if (langToggle && langMenu) {
  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = langToggle.getAttribute("aria-expanded") === "true";
    langToggle.setAttribute("aria-expanded", String(!open));
    langMenu.hidden = open;
  });

  langMenu.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.getAttribute("data-lang"));
      closeLangMenu();
    });
  });

  document.addEventListener("click", (e) => {
    if (!langSwitch?.contains(e.target)) closeLangMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLangMenu();
  });
}

applyLanguage(currentLang);
