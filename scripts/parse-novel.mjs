import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC_CANDIDATES = [
  path.join(ROOT, "manuscript", "THE ORIGIN VENERABLE.md"),
  path.join(ROOT, "THE ORIGIN VENERABLE.md"),
];
const SRC = SRC_CANDIDATES.find((p) => fs.existsSync(p));
if (!SRC) {
  console.error("Naskah tidak ditemukan.");
  process.exit(1);
}
const OUT_DIR = path.join(ROOT, "site/data");
const CH_DIR = path.join(OUT_DIR, "chapters");

fs.mkdirSync(CH_DIR, { recursive: true });

const raw = fs.readFileSync(SRC, "utf8").replace(/\r\n/g, "\n");

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function titleCase(s) {
  const small = new Set(["dan", "di", "ke", "dari", "yang", "untuk", "pada", "yang", "di", "ke"]);
  return s
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((part, i, arr) => {
      if (/^\s+$/.test(part) || part === "-") return part;
      const prev = arr.slice(0, i).join("");
      const isFirst = prev.trim().length === 0;
      if (!isFirst && small.has(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toHtml(body) {
  const blocks = body.trim().split(/\n{2,}/);
  const html = [];
  for (const block of blocks) {
    const t = block.trim();
    if (!t) continue;
    if (/^\*{3,}$/.test(t) || /^—{3,}$/.test(t) || /^-{3,}$/.test(t)) {
      html.push('<hr class="scene-break" />');
      continue;
    }
    const joined = t.replace(/\n+/g, " ").replace(/[ \t]+/g, " ").trim();
    html.push(`<p>${escapeHtml(joined)}</p>`);
  }
  return html.join("\n");
}

function wordCount(text) {
  const cleaned = text.replace(/[^\p{L}\p{N}'’-]+/gu, " ").trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

const headerRe = /^(PROLOG|CHAPTER\s+\d+)\s*:\s*(.+)$/gm;
const matches = [...raw.matchAll(headerRe)];

if (matches.length === 0) {
  console.error("No chapters found");
  process.exit(1);
}

const chapters = [];

for (let i = 0; i < matches.length; i++) {
  const m = matches[i];
  const kind = m[1].trim();
  const rawTitle = m[2].trim();
  const start = m.index + m[0].length;
  const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
  const body = raw.slice(start, end).trim();
  const isProlog = kind.startsWith("PROLOG");
  const number = isProlog ? 0 : Number(kind.replace(/[^\d]/g, ""));
  const title = titleCase(rawTitle);
  const id = isProlog ? "prolog" : String(number);
  const file = isProlog ? "prolog.json" : `${String(number).padStart(2, "0")}.json`;
  const words = wordCount(body);
  const html = toHtml(body);

  const chapter = {
    id,
    file,
    number,
    kind: isProlog ? "prolog" : "chapter",
    label: isProlog ? "Prolog" : `Bab ${number}`,
    title,
    slug: slugify(title),
    words,
    minutes: Math.max(1, Math.round(words / 200)),
    html,
  };

  fs.writeFileSync(path.join(CH_DIR, file), JSON.stringify(chapter));
  const { html: _omit, ...meta } = chapter;
  chapters.push(meta);
}

const toc = {
  title: "The Origin Venerable",
  author: "Akbar Nawasunda",
  volume: 1,
  setting: "Bandung, 2054–2057",
  quote:
    "Kuingin menukar keabadian dengan satu detik waktu di pelukmu, karena pengorbanan terberat bukanlah mati, melainkan terus hidup dengan penyesalan yang tak pernah menua.",
  chapters,
  totals: {
    chapters: chapters.filter((c) => c.kind === "chapter").length,
    words: chapters.reduce((s, c) => s + c.words, 0),
    minutes: chapters.reduce((s, c) => s + c.minutes, 0),
  },
};

fs.writeFileSync(path.join(OUT_DIR, "toc.json"), JSON.stringify(toc, null, 2));
console.log(
  `Parsed ${chapters.length} sections, ${toc.totals.words} words, ${toc.totals.chapters} chapters`
);
for (const c of chapters) {
  console.log(`${c.label.padEnd(10)} ${String(c.words).padStart(5)}w  ${c.title}`);
}
