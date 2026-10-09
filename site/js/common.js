const THEME_KEY = "tov:theme";
const SIZE_KEY = "tov:size";
const LAST_KEY = "tov:last";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function currentTheme() {
  return document.documentElement.dataset.theme || "void";
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  $$("[data-theme-btn]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.themeBtn === theme);
  });
}

export function setSize(size) {
  document.documentElement.style.setProperty("--reader-size", size);
  try {
    localStorage.setItem(SIZE_KEY, size);
  } catch {}
  $$("[data-size-btn]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.sizeBtn === size);
  });
}

export function saveLast(id) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {}
}

export function getLast() {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) || "null");
  } catch {
    return null;
  }
}

function bootNav() {
  const toggle = $("[data-nav-toggle]");
  const nav = $(".site-header .nav");
  toggle?.addEventListener("click", () => nav?.classList.toggle("is-open"));

  const page = document.body.dataset.page;
  $$(`.nav a[data-nav]`).forEach((a) => {
    a.classList.toggle("is-on", a.dataset.nav === page);
  });

  $$("[data-theme-btn]").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.themeBtn));
    btn.classList.toggle("is-on", btn.dataset.themeBtn === currentTheme());
  });

  const last = getLast();
  const cont = $("[data-continue]");
  if (cont && last?.id) {
    const label = last.id === "prolog" ? "Lanjutkan Prolog" : `Lanjutkan Bab ${last.id}`;
    cont.textContent = label;
    cont.setAttribute("href", `baca.html?bab=${encodeURIComponent(last.id)}`);
  }
}

function bootTabs() {
  const tabs = $("[data-tabs]");
  if (!tabs) return;
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    $$("[data-tab]", tabs).forEach((b) => b.classList.toggle("is-on", b === btn));
    $$("[data-panel]").forEach((p) => p.classList.toggle("is-on", p.dataset.panel === btn.dataset.tab));
  });
}

function bootSpoilers() {
  $$(".spoiler").forEach((el) => {
    el.title = "Ketuk untuk menampilkan spoiler";
    el.addEventListener("click", () => el.classList.toggle("is-shown"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    const size = localStorage.getItem(SIZE_KEY);
    if (size) setSize(size);
  } catch {}
  bootNav();
  bootTabs();
  bootSpoilers();
});
