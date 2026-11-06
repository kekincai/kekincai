// Generates every SVG used by the profile README.
// Run: node scripts/build.mjs   → writes assets/*.svg (dark) and assets/*-light.svg
//
// Design: a black typographic poster for the hero, then themed cards that follow
// GitHub's light/dark mode. System fonts only (SF / Helvetica / Segoe / Hiragino),
// one accent colour, no gradients, no glows, one restrained animation.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

// ---------- themes ----------
const THEMES = {
  dark: {
    bg: "#0A0A0B",
    card: "#141416",
    line: "rgba(255,255,255,0.10)",
    lineStrong: "rgba(255,255,255,0.18)",
    ink: "#F5F5F7",
    muted: "#8E8E93",
    faint: "#48484A",
    accent: "#FF5A1F",
    ramp: ["#E5E5EA", "#C7C7CC", "#AEAEB2", "#8E8E93", "#6E6E73", "#5A5A5E", "#48484A", "#3A3A3C", "#2C2C2E"],
  },
  light: {
    bg: "#FFFFFF",
    card: "#F5F5F7",
    line: "rgba(0,0,0,0.08)",
    lineStrong: "rgba(0,0,0,0.16)",
    ink: "#1D1D1F",
    muted: "#6E6E73",
    faint: "#C7C7CC",
    accent: "#E84A17",
    ramp: ["#1D1D1F", "#3A3A3C", "#515154", "#6E6E73", "#8E8E93", "#AEAEB2", "#C7C7CC", "#D1D1D6", "#E5E5EA"],
  },
};

// ---------- helpers ----------
const SANS = `-apple-system, system-ui, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans CJK JP", "PingFang SC", sans-serif`;
const CJK = `"Hiragino Sans", "PingFang SC", "Noto Sans CJK JP", "Noto Sans CJK SC", "Yu Gothic", "Microsoft YaHei", -apple-system, system-ui, sans-serif`;
const MONO = `ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function text(x, y, str, o = {}) {
  const {
    size = 16,
    weight = 400,
    fill = "#000",
    family = SANS,
    anchor = "start",
    ls = 0,
    opacity = 1,
    extra = "",
  } = o;
  const lsAttr = ls ? ` letter-spacing="${ls}"` : "";
  const opAttr = opacity !== 1 ? ` opacity="${opacity}"` : "";
  return `<text x="${x}" y="${y}" font-family='${family}' font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${lsAttr}${opAttr}${extra}>${esc(str)}</text>`;
}

const mono = (x, y, str, t, o = {}) =>
  text(x, y, str, { family: MONO, size: 12, fill: t.muted, ls: 1.4, ...o });

function svgDoc(w, h, label, body, { bg = "none", css = "" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<style>
text{font-kerning:normal;-webkit-font-smoothing:antialiased}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
${bg !== "none" ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}
${body}
</svg>
`;
}

// Themed card shell: rounded panel with 1px border.
function panel(w, h, t, r = 20) {
  return `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${t.card}" stroke="${t.line}"/>`;
}

function write(name, svg) {
  writeFileSync(join(OUT, name), svg);
  console.log("wrote", name);
}

// Writes dark + light variants from one render function.
function themed(name, w, h, label, render) {
  write(`${name}.svg`, svgDoc(w, h, label, render(THEMES.dark)));
  write(`${name}-light.svg`, svgDoc(w, h, label, render(THEMES.light)));
}

// ---------- 1. hero (always black) ----------
{
  const t = THEMES.dark;
  const W = 1200, H = 440;
  const dots = `<defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#FFFFFF" opacity="0.10"/></pattern></defs>
<rect width="${W}" height="${H}" fill="url(#dots)"/>`;

  const body = `${dots}
<rect x="64" y="56" width="36" height="4" fill="${t.accent}"/>
${mono(116, 62, "PAUL CAI  ·  東京  ·  35.68° N  139.69° E", t, { size: 12, fill: t.muted, family: MONO, ls: 2 })}
<text x="60" y="262" font-family='${SANS}' font-size="168" font-weight="800" fill="${t.ink}" letter-spacing="-8">Paul Cai<tspan class="blink" fill="${t.accent}">.</tspan></text>
${text(64, 328, "行动派，干起来！", { size: 32, weight: 600, fill: t.ink, family: CJK, opacity: 0.92 })}
${text(64, 366, "I build focused tools for Apple platforms, AI workflows and local data — from Tokyo.", { size: 19, weight: 400, fill: t.muted })}
<text x="1136" y="56" font-family='${CJK}' font-size="15" font-weight="500" fill="${t.muted}" letter-spacing="6" style="writing-mode: vertical-rl; text-orientation: upright">東京発・道具をつくる</text>
<line x1="64" y1="398" x2="${W - 64}" y2="398" stroke="${t.lineStrong}"/>
${mono(64, 420, "AI  ×  NATIVE  ×  LOCAL-FIRST", t, { fill: t.ink, opacity: 0.8 })}
${mono(W - 64, 420, "SINCE 2016  ·  88 PUBLIC REPOS", t, { anchor: "end" })}`;

  write(
    "hero.svg",
    svgDoc(W, H, "Paul Cai — 行动派，干起来！ I build focused tools for Apple platforms, AI workflows and local data, from Tokyo.", body, {
      bg: t.bg,
      css: `.blink{animation:blink 1.1s steps(1,end) infinite}@keyframes blink{50%{opacity:0}}`,
    }),
  );
}

// ---------- 2. "now" strip ----------
themed("now", 1200, 150, "Now building PhotoDiary · writing PAUL.LOG · based in Tokyo", (t) => {
  const cols = [
    ["NOW BUILDING", "PhotoDiary", "A SwiftUI journal written into Photos captions"],
    ["WRITING", "PAUL.LOG", "Notes from one person's AI learning floor"],
    ["BASED IN", "Tokyo", "JST · UTC+9 · available for collaboration"],
  ];
  const cw = 1200 / 3;
  return (
    panel(1200, 150, t) +
    cols
      .map(([k, v, d], i) => {
        const x = i * cw + 36;
        const sep = i ? `<line x1="${i * cw}" y1="28" x2="${i * cw}" y2="122" stroke="${t.line}"/>` : "";
        return `${sep}
${mono(x, 48, k, t)}
${text(x, 88, v, { size: 28, weight: 700, fill: t.ink, ls: -0.5 })}
${text(x, 114, d, { size: 14, fill: t.muted })}`;
      })
      .join("\n")
  );
});

// ---------- 3. section headers ----------
function header(name, num, title, jp) {
  themed(name, 1200, 64, `${num} / ${title} — ${jp}`, (t) => `
${mono(0, 40, num, t, { fill: t.accent, size: 13 })}
${text(44, 42, title, { size: 24, weight: 700, fill: t.ink, ls: -0.4 })}
${text(1200, 41, jp, { size: 14, weight: 500, fill: t.muted, family: CJK, anchor: "end", ls: 2 })}
<line x1="0" y1="62" x2="1200" y2="62" stroke="${t.lineStrong}"/>`);
}
header("h-work", "01", "Selected Work", "選んだ仕事");
header("h-tools", "02", "Small Tools", "小さな道具");
header("h-stack", "03", "Stack", "言語");

// ---------- 4. project cards (590 × 250) ----------
const glyphs = {
  // two drives with a transfer arrow and a live progress bar
  diskferry: (t) => `
<rect x="0" y="8" width="56" height="84" rx="10" fill="none" stroke="${t.ink}" stroke-width="2"/>
<rect x="104" y="8" width="56" height="84" rx="10" fill="none" stroke="${t.ink}" stroke-width="2"/>
<circle cx="28" cy="78" r="3" fill="${t.ink}"/><circle cx="132" cy="78" r="3" fill="${t.accent}"/>
<path d="M66 50 H94 M86 42 L94 50 L86 58" fill="none" stroke="${t.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="0" y="112" width="160" height="6" rx="3" fill="${t.faint}"/>
<rect x="0" y="112" width="104" height="6" rx="3" fill="${t.accent}"/>`,
  // an instant photo whose caption is the diary entry
  photodiary: (t) => `
<rect x="20" y="0" width="120" height="124" rx="8" fill="none" stroke="${t.ink}" stroke-width="2"/>
<rect x="32" y="12" width="96" height="72" rx="4" fill="${t.faint}"/>
<circle cx="104" cy="32" r="7" fill="${t.card}"/>
<path d="M32 84 L62 52 L84 72 L100 60 L128 84 Z" fill="${t.card}" opacity="0.9"/>
<line x1="34" y1="100" x2="110" y2="100" stroke="${t.accent}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="34" y1="112" x2="84" y2="112" stroke="${t.ink}" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>`,
  // radar: concentric arcs, a sweep, one hit
  fde: (t) => `
<g fill="none" stroke="${t.ink}" stroke-width="2">
<circle cx="80" cy="64" r="60"/><circle cx="80" cy="64" r="40" opacity="0.6"/><circle cx="80" cy="64" r="20" opacity="0.35"/>
</g>
<line x1="80" y1="64" x2="132" y2="34" stroke="${t.accent}" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="80" cy="64" r="3.5" fill="${t.ink}"/>
<circle cx="46" cy="92" r="5" fill="${t.accent}"/>
<circle cx="112" cy="104" r="3" fill="${t.ink}" opacity="0.5"/>`,
  // three covers in flow, the centre one in focus
  bookmark: (t) => `
<path d="M0 26 L44 36 V104 L0 114 Z" fill="none" stroke="${t.ink}" stroke-width="2" opacity="0.5"/>
<path d="M160 26 L116 36 V104 L160 114 Z" fill="none" stroke="${t.ink}" stroke-width="2" opacity="0.5"/>
<rect x="52" y="14" width="56" height="112" rx="6" fill="${t.card}" stroke="${t.accent}" stroke-width="2.5"/>
<rect x="62" y="26" width="36" height="22" rx="3" fill="${t.faint}"/>
<line x1="62" y1="62" x2="98" y2="62" stroke="${t.ink}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
<line x1="62" y1="74" x2="88" y2="74" stroke="${t.ink}" stroke-width="2" stroke-linecap="round" opacity="0.4"/>`,
};

function card(name, num, title, lines, tags, glyph) {
  const W = 590, H = 250;
  themed(name, W, H, `${num} ${title} — ${lines.join(" ")} · ${tags}`, (t) => `
${panel(W, H, t)}
${mono(32, 48, num, t, { fill: t.accent, size: 13 })}
${text(32, 118, title, { size: 32, weight: 700, fill: t.ink, ls: -0.8 })}
${lines.map((l, i) => text(32, 158 + i * 23, l, { size: 15.5, fill: t.muted })).join("\n")}
<line x1="32" y1="203" x2="${W - 32}" y2="203" stroke="${t.line}"/>
${mono(32, 229, tags, t)}
<g transform="translate(426 34) scale(0.78)">${glyphs[glyph](t)}</g>`);
}

card("p-diskferry", "01", "DiskFerry", [
  "Native macOS transfers for external drives, NAS and",
  "Windows shares — honest live progress, reusable routes.",
], "SWIFT  ·  MACOS  ·  RCLONE", "diskferry");

card("p-photodiary", "02", "PhotoDiary", [
  "A journal that writes each entry into the caption of the",
  "photo itself. Your memories stay inside Photos, not a silo.",
], "SWIFTUI  ·  IOS 27  ·  WATCHOS", "photodiary");

card("p-fde", "03", "FDE Radar", [
  "日本を中心に、Web とデジタルの変化を会社と個人の",
  "判断材料として整理する。",
], "ASTRO  ·  WORKERS  ·  D1", "fde");

card("p-bookmark", "04", "Bookmark Cover Flow", [
  "An editorial, spatial way to browse Chrome bookmarks",
  "through real webpage previews.",
], "TYPESCRIPT  ·  CHROME  ·  INDEXEDDB", "bookmark");

// ---------- 5. small tiles (290 × 180) ----------
const tileGlyphs = {
  cobra: (t) => `<g fill="${t.ink}"><rect x="0" y="18" width="6" height="14" rx="1.5" opacity="0.4"/><rect x="10" y="10" width="6" height="22" rx="1.5" opacity="0.6"/><rect x="20" y="0" width="6" height="32" rx="1.5" fill="${t.accent}"/><rect x="30" y="14" width="6" height="18" rx="1.5" opacity="0.8"/></g>`,
  newtab: (t) => `<g fill="none" stroke="${t.ink}" stroke-width="2"><rect x="0" y="0" width="14" height="14" rx="3"/><rect x="20" y="0" width="14" height="14" rx="3"/><rect x="0" y="20" width="14" height="14" rx="3"/></g><rect x="20" y="20" width="14" height="14" rx="3" fill="${t.accent}"/>`,
  tidyfs: (t) => `<g fill="none" stroke="${t.ink}" stroke-width="2" stroke-linecap="round"><path d="M2 4 H14 L18 8 H34 V30 H2 Z"/></g><path d="M12 19 H26 M20 13 L26 19 L20 25" fill="none" stroke="${t.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  racket: (t) => `<text x="0" y="28" font-family='${MONO}' font-size="30" font-weight="600" fill="${t.ink}">(<tspan fill="${t.accent}">λ</tspan>)</text>`,
};

function tile(name, title, desc, tag, glyph) {
  const W = 290, H = 180;
  themed(name, W, H, `${title} — ${desc} · ${tag}`, (t) => `
${panel(W, H, t, 18)}
<g transform="translate(232 28)">${tileGlyphs[glyph](t)}</g>
${text(26, 96, title, { size: 21, weight: 700, fill: t.ink, ls: -0.4 })}
${text(26, 122, desc, { size: 13.5, fill: t.muted })}
${mono(26, 154, tag, t, { size: 11 })}`);
}

tile("t-cobra", "CoBRA", "Reproducible software estimation", "JAVASCRIPT · LOCAL-FIRST", "cobra");
tile("t-newtab", "Infinity New Tab", "Chrome launchpad, live wallpapers", "WEB COMPONENTS · WEBGPU", "newtab");
tile("t-tidyfs", "tidyfs", "Flatten nested dirs, drop empty ones", "RUST · INK", "tidyfs");
tile("t-racket", "LLM in Racket", "Minimal GPT training, CPU only", "RACKET · FROM SCRATCH", "racket");

// ---------- 6. stack bar ----------
// Primary language of public, non-fork repositories (gh repo list, 2026-11).
const LANGS = [
  ["R", 12], ["Swift", 9], ["TypeScript", 7], ["HTML", 5], ["Racket", 5], ["JavaScript", 4],
  ["Python", 3], ["Rust", 3], ["COBOL", 2], ["CSS", 2], ["PHP", 2], ["TeX", 2], ["Other", 6],
];
themed("stack", 1200, 150, "Primary language across 62 public repositories: R, Swift, TypeScript, HTML, Racket, JavaScript, Python, Rust, COBOL, CSS, PHP, TeX, other.", (t) => {
  const total = LANGS.reduce((s, [, n]) => s + n, 0);
  const x0 = 36, w = 1200 - 72, gap = 3;
  let x = x0;
  let rampIdx = 0;
  const segs = LANGS.map(([l, n]) => {
    const sw = (n / total) * (w - gap * (LANGS.length - 1));
    const fill = l === "Swift" ? t.accent : t.ramp[Math.min(rampIdx++, t.ramp.length - 1)];
    const s = `<rect x="${x.toFixed(1)}" y="52" width="${sw.toFixed(1)}" height="22" rx="4" fill="${fill}"/>`;
    x += sw + gap;
    return s;
  });
  // legend
  let lx = x0;
  rampIdx = 0;
  const legend = LANGS.map(([l, n]) => {
    const fill = l === "Swift" ? t.accent : t.ramp[Math.min(rampIdx++, t.ramp.length - 1)];
    const label = `${l.toUpperCase()} ${n}`;
    const item = `<rect x="${lx}" y="102" width="9" height="9" rx="2" fill="${fill}"/>${mono(lx + 14, 111, label, t, { size: 11, ls: 0.6, fill: l === "Swift" ? t.ink : t.muted })}`;
    lx += 14 + label.length * 7.3 + 18;
    return item;
  });
  return `${panel(1200, 150, t)}
${mono(36, 36, "PRIMARY LANGUAGE  ·  62 PUBLIC REPOS, NO FORKS", t)}
${mono(1200 - 36, 36, "SWIFT IS WHERE NEW WORK GOES", t, { anchor: "end", fill: t.accent })}
${segs.join("")}
${legend.join("")}`;
});

// ---------- 7. footer ----------
themed("footer", 1200, 110, "Make it concrete. Keep private data close to the user. Build the smallest complete thing. Test it in the real world. — Tokyo", (t) => {
  const rules = ["MAKE IT CONCRETE", "KEEP DATA CLOSE TO THE USER", "BUILD THE SMALLEST COMPLETE THING", "TEST IT IN THE REAL WORLD"];
  return `
<line x1="0" y1="0.5" x2="1200" y2="0.5" stroke="${t.lineStrong}"/>
${(() => { let x = 0; return rules.map((r, i) => { const s = `${mono(x, 40, String(i + 1).padStart(2, "0"), t, { fill: t.accent })}${mono(x + 26, 40, r, t, { fill: t.ink, opacity: 0.85 })}`; x += 26 + r.length * 8.6 + 44; return s; }).join(""); })()}
${text(0, 90, "風を読み、静かに前へ。", { size: 15, weight: 500, fill: t.muted, family: CJK, ls: 1.5 })}
${mono(1200, 90, "TOKYO  ·  2026  ·  ME@KEJINCAI.DEV", t, { anchor: "end" })}`;
});
