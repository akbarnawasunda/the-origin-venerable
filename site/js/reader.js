import { saveLast, setTheme, setSize, currentTheme } from "./common.js";

const $ = (sel, root = document) => root.querySelector(sel);

const params = new URLSearchParams(location.search);
const requested = params.get("bab") || "prolog";

const progressEl = $(".read-progress");
const article = $("#chapter");
const tocEl = $("#toc");
const drawer = $("#drawer");
const settings = $("#settings");
const backdrop = $("#backdrop");

let toc = null;
let current = null;

function openPanel(el) {
  closePanels();
  el.classList.add("is-open");
  backdrop.classList.add("is-on");
}

function closePanels() {
  drawer.classList.remove("is-open");
  settings.classList.remove("is-open");
  backdrop.classList.remove("is-on");
}

function chapterHref(id) {
  return `baca.html?bab=${encodeURIComponent(id)}`;
}

function renderToc(activeId) {
  tocEl.innerHTML = toc.chapters
    .map(
      (c) => `
      <a href="${chapterHref(c.id)}" class="${c.id === activeId ? "is-on" : ""}">
        <small>${c.label}</small>
        <span>${c.title}</span>
        <span class="mins">${c.minutes} mnt</span>
      </a>`
    )
    .join("");
}

function neighbor(id, dir) {
  const i = toc.chapters.findIndex((c) => c.id === id);
  return toc.chapters[i + dir] || null;
}

function renderChapter(ch) {
  current = ch;
  document.title = `${ch.label}: ${ch.title} — The Origin Venerable`;
  const prev = neighbor(ch.id, -1);
  const next = neighbor(ch.id, 1);

  article.innerHTML = `
    <div class="chapter-kicker">
      <span>${ch.label}</span>
      <span>Volume I · Bumi Fana</span>
    </div>
    <h1>${ch.title}</h1>
    <p class="chapter-meta">${ch.words.toLocaleString("id-ID")} kata · sekitar ${ch.minutes} menit baca</p>
    <div class="chapter-body">${ch.html}</div>
    <nav class="chapter-nav">
      ${
        prev
          ? `<a href="${chapterHref(prev.id)}"><small>Sebelumnya</small>${prev.label}: ${prev.title}</a>`
          : "<span></span>"
      }
      ${
        next
          ? `<a class="next" href="${chapterHref(next.id)}"><small>Berikutnya</small>${next.label}: ${next.title}</a>`
          : `<a class="next" href="dunia.html"><small>Selesai Volume I sementara</small>Jelajahi dunianya</a>`
      }
    </nav>
  `;

  saveLast(ch.id);
  renderToc(ch.id);
  window.scrollTo(0, 0);

  const saved = Number(localStorage.getItem(`tov:scroll:${ch.id}`) || 0);
  if (saved > 80) {
    requestAnimationFrame(() => window.scrollTo(0, saved));
  }
}

async function load() {
  article.innerHTML = `<div class="loading">Membuka halaman…</div>`;
  try {
    toc = await fetch("data/toc.json").then((r) => r.json());
    const meta = toc.chapters.find((c) => c.id === requested) || toc.chapters[0];
    const ch = await fetch(`data/chapters/${meta.file}`).then((r) => r.json());
    renderChapter(ch);
  } catch (err) {
    article.innerHTML = `<div class="status">Bab tidak ditemukan. <a href="baca.html?bab=prolog">Kembali ke prolog</a>.</div>`;
    console.error(err);
  }
}

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  progressEl.style.width = `${Math.min(100, p * 100)}%`;
  if (current) {
    try {
      localStorage.setItem(`tov:scroll:${current.id}`, String(window.scrollY));
    } catch {}
  }
}

$("#btn-toc")?.addEventListener("click", () => openPanel(drawer));
$("#btn-settings")?.addEventListener("click", () => openPanel(settings));
backdrop.addEventListener("click", closePanels);

settings.addEventListener("click", (e) => {
  const theme = e.target.closest("[data-theme-btn]");
  if (theme) setTheme(theme.dataset.themeBtn);
  const size = e.target.closest("[data-size-btn]");
  if (size) setSize(size.dataset.sizeBtn);
});

document.addEventListener("keydown", (e) => {
  if (!toc || !current) return;
  if (e.target.matches("input, textarea")) return;
  if (e.key === "Escape") closePanels();
  if (e.key === "ArrowRight") {
    const n = neighbor(current.id, 1);
    if (n) location.href = chapterHref(n.id);
  }
  if (e.key === "ArrowLeft") {
    const n = neighbor(current.id, -1);
    if (n) location.href = chapterHref(n.id);
  }
});

window.addEventListener("scroll", onScroll, { passive: true });

document.addEventListener("DOMContentLoaded", () => {
  $$("[data-theme-btn]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.themeBtn === currentTheme());
  });
  load();
});

function $$(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}
