// Generates the hand-drawn "heron on a bicycle under sakura" SVG set for the profile README.
// Run: node scripts/build-art.mjs   → writes assets/art/*.svg
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "art");
mkdirSync(OUT, { recursive: true });

// ---------- palette ----------
const C = {
  paper: "#F5EFE4",
  paperEdge: "#E4D8C4",
  skyTop: "#EFE7DA",
  skyBottom: "#DDE4D5",
  mist: "#F3EEE4",
  hillFar: "#CBD5C3",
  hillMid: "#B1C2AD",
  hillNear: "#93AA91",
  grass: "#7F9A7E",
  path: "#E9DDC8",
  pathEdge: "#D6C6AB",
  pink1: "#F6D3D9",
  pink2: "#EFB7C3",
  pink3: "#E49AAB",
  pink4: "#D6879A",
  bloomLight: "#FCEBEE",
  trunk: "#5E4744",
  trunkDark: "#46332F",
  ink: "#2E3B37",
  inkSoft: "#5D6B64",
  inkFaint: "#8C978F",
  rose: "#C25B6E",
  heron: "#6484A3",
  heronLight: "#B4C6D6",
  heronPale: "#DCE5EC",
  heronDark: "#34506B",
  cap: "#223246",
  beak: "#D8A444",
  scarf: "#D96C4C",
  leg: "#C9A46A",
  legDark: "#A68552",
  bike: "#2F5E51",
  bikeDark: "#23473D",
  tire: "#2B2F2E",
  water: "#BFD1CF",
  waterDark: "#9DB8B6",
};

const SERIF_JP = `'Hiragino Mincho ProN','Yu Mincho','YuMincho','Noto Serif CJK JP','Noto Serif JP','Songti SC',serif`;
const SERIF = `'Iowan Old Style','Palatino Linotype',Palatino,Georgia,${SERIF_JP}`;
const MONO = `ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace`;

// ---------- helpers ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const f = (n) => +n.toFixed(2);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg(w, h, title, body, extraDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.09 0"/>
  </filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="blur6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
  <path id="petal" d="M0 0 C3 -5 10 -5 9 1 C8 6 2 7 0 0 Z"/>
  <style>
    .serif{font-family:${SERIF}}
    .jp{font-family:${SERIF_JP}}
    .mono{font-family:${MONO}}
    @media (prefers-reduced-motion: reduce){ *{animation:none!important} }
  </style>
  ${extraDefs}
</defs>
${body}
</svg>
`;
}

const grainRect = (w, h, rx = 0) =>
  `<rect width="${w}" height="${h}" rx="${rx}" filter="url(#grain)" opacity="1"/>`;

// ---------- sakura ----------
function flower(x, y, r, color = C.bloomLight) {
  // tiny five-petal blossom
  let p = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    p += `<circle cx="${f(x + Math.cos(a) * r * 0.62)}" cy="${f(y + Math.sin(a) * r * 0.62)}" r="${f(r * 0.5)}"/>`;
  }
  return `<g fill="${color}">${p}</g><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.28)}" fill="${C.pink4}"/>`;
}

function bloomCluster(cx, cy, size, rand, flowers = 10) {
  const cols = [C.pink1, C.pink2, C.pink3, C.pink1, C.pink2];
  let s = "";
  const blobs = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < blobs; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * size * 0.55;
    s += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d * 0.7)}" r="${f(size * (0.45 + rand() * 0.35))}" fill="${cols[i % cols.length]}" opacity="${f(0.75 + rand() * 0.2)}"/>`;
  }
  for (let i = 0; i < flowers; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * size * 0.9;
    s += flower(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.75, 2.4 + rand() * 2.2);
  }
  return s;
}

// A branch hanging in from an edge. pts: polyline of branch spine, clusters at given points.
function branch(spine, width, clusters, seed) {
  const rand = rng(seed);
  const d = "M" + spine.map((p) => p.join(" ")).join(" L");
  let s = `<path d="${d}" fill="none" stroke="${C.trunk}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (let i = 1; i < spine.length; i++) {
    const [x1, y1] = spine[i - 1];
    const [x2, y2] = spine[i];
    s += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.trunkDark}" stroke-width="${f(width * 0.3)}" stroke-linecap="round" opacity=".35" transform="translate(0 ${f(width * 0.25)})"/>`;
  }
  for (const [x, y, r] of clusters) s += bloomCluster(x, y, r, rand, Math.round(r / 2.5));
  return s;
}

function sakuraTree(x, y, scale, flip, seed) {
  const rand = rng(seed);
  const trunk = `<path d="M-14 0 C-10 -60 -22 -110 -4 -170 C4 -200 30 -230 60 -250 L66 -242 C40 -222 20 -196 16 -168 C28 -190 58 -206 92 -214 L94 -206 C62 -196 30 -176 20 -140 C12 -100 16 -50 18 0 Z" fill="${C.trunk}"/>
  <path d="M-6 0 C-2 -60 -10 -110 4 -160" stroke="${C.trunkDark}" stroke-width="4" fill="none" opacity=".4"/>`;
  const pts = [
    [60, -262, 42], [100, -226, 38], [20, -250, 40], [-20, -226, 36], [40, -210, 34],
    [130, -250, 34], [80, -290, 36], [-40, -270, 30], [10, -290, 32], [150, -210, 28],
  ];
  let bloom = "";
  for (const [bx, by, r] of pts) bloom += bloomCluster(bx + (rand() - 0.5) * 10, by, r, rand, 9);
  return `<g transform="translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})">${trunk}${bloom}</g>`;
}

function petals(n, w, h, seed, { drift = -160, minDur = 9, maxDur = 16, scale = 1, cols = [C.pink2, C.pink1, C.pink3] } = {}) {
  const rand = rng(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const x0 = rand() * (w + Math.abs(drift)) + (drift < 0 ? 0 : -drift);
    const dur = minDur + rand() * (maxDur - minDur);
    const begin = -rand() * dur;
    const sc = (0.7 + rand() * 0.7) * scale;
    const spin = 3 + rand() * 4;
    const sway = 12 + rand() * 18;
    s += `<g><animateTransform attributeName="transform" type="translate" from="${f(x0)} -20" to="${f(x0 + drift)} ${h + 20}" dur="${f(dur)}s" begin="${f(begin)}s" repeatCount="indefinite"/>
  <g><animateTransform attributeName="transform" type="translate" values="0 0;${f(sway)} 0;0 0" dur="${f(dur / 3)}s" begin="${f(begin)}s" repeatCount="indefinite"/>
  <use href="#petal" fill="${cols[i % cols.length]}" transform="scale(${f(sc)})" opacity=".9"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${f(spin)}s" repeatCount="indefinite" additive="sum"/></use></g></g>`;
  }
  return s;
}

// ---------- rolling hills ----------
function hillPath(w, baseY, amp, waves, seed, bottom) {
  const rand = rng(seed);
  const n = waves * 2;
  const step = w / n;
  let d = `M0 ${baseY}`;
  // repeatable: start/end at baseY
  for (let i = 0; i < n; i++) {
    const x1 = (i + 0.5) * step;
    const x2 = (i + 1) * step;
    const y = baseY - (i % 2 === 0 ? amp * (0.6 + rand() * 0.4) : -amp * 0.15);
    d += ` Q${f(x1)} ${f(y)} ${f(x2)} ${baseY}`;
  }
  return d + ` L${w} ${bottom} L0 ${bottom} Z`;
}

// seamless horizontally scrolling layer: content drawn in [0,w], tiled twice
function scroller(w, content, dur, id) {
  return `<g><g id="${id}">${content}</g><use href="#${id}" x="${w}"/>
  <animateTransform attributeName="transform" type="translate" from="0 0" to="${-w} 0" dur="${dur}s" repeatCount="indefinite"/></g>`;
}

// ---------- the heron on a bicycle ----------
// Local coordinates: rear axle at (0,0), front axle at (160,0), ground at y=50.
function heronOnBike({ crankDur = 2.4, wheelDur = 2.2, withScarf = true } = {}) {
  const R = [0, 0], F = [160, 0], BB = [70, 4], WR = 50;
  const hip = [52, -86];
  const L = 60;
  const frames = 24;
  const crankR = 20;

  const leg = (phase) => {
    const vals = [];
    for (let i = 0; i <= frames; i++) {
      const t = (i / frames) * Math.PI * 2 + phase;
      const P = [BB[0] + Math.cos(t) * crankR, BB[1] + Math.sin(t) * crankR];
      const dx = P[0] - hip[0], dy = P[1] - hip[1];
      let d = Math.hypot(dx, dy);
      d = Math.min(d, 2 * L - 0.5);
      const a = d / 2, h = Math.sqrt(L * L - a * a);
      const mx = hip[0] + (dx / Math.hypot(dx, dy)) * a, my = hip[1] + (dy / Math.hypot(dx, dy)) * a;
      const nx = -dy / Math.hypot(dx, dy), ny = dx / Math.hypot(dx, dy);
      let k1 = [mx + nx * h, my + ny * h], k2 = [mx - nx * h, my - ny * h];
      const K = k1[0] > k2[0] ? k1 : k2;
      vals.push(`M${f(hip[0])} ${f(hip[1])} L${f(K[0])} ${f(K[1])} L${f(P[0])} ${f(P[1])} l12 1`);
    }
    return vals.join(";");
  };

  const wheel = (cx, cy) => {
    let spokes = "";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      spokes += `M0 0 L${f(Math.cos(a) * (WR - 4))} ${f(Math.sin(a) * (WR - 4))} `;
    }
    return `<g transform="translate(${cx} ${cy})">
      <circle r="${WR}" fill="none" stroke="${C.tire}" stroke-width="6"/>
      <circle r="${WR - 5}" fill="none" stroke="#6B7572" stroke-width="1.5"/>
      <g><path d="${spokes}" stroke="#7E8784" stroke-width="1"/>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${wheelDur}s" repeatCount="indefinite"/></g>
      <circle r="5" fill="${C.bikeDark}"/></g>`;
  };

  const crank = (phaseDeg, color) => `<g transform="translate(${BB[0]} ${BB[1]})"><g>
      <path d="M0 0 L${crankR} 0" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <rect x="${crankR - 5}" y="-2" width="12" height="4" rx="1.5" fill="${color}"/>
      <animateTransform attributeName="transform" type="rotate" from="${phaseDeg}" to="${phaseDeg + 360}" dur="${crankDur}s" repeatCount="indefinite"/></g></g>`;

  const bob = `<animateTransform attributeName="transform" type="translate" values="0 0;0 1.6;0 0;0 1.6;0 0" dur="${crankDur}s" repeatCount="indefinite"/>`;

  const scarfTail = withScarf
    ? `<path fill="${C.scarf}" d="M92 -142 C70 -150 50 -140 30 -152 C44 -136 64 -134 86 -132 Z">
        <animate attributeName="d" dur="0.9s" repeatCount="indefinite" values="M92 -142 C70 -150 50 -140 30 -152 C44 -136 64 -134 86 -132 Z;M92 -142 C72 -144 52 -150 32 -140 C46 -130 66 -132 86 -132 Z;M92 -142 C70 -150 50 -140 30 -152 C44 -136 64 -134 86 -132 Z"/></path>
       <path fill="#C4583B" d="M90 -136 C74 -134 60 -126 46 -130 C56 -120 72 -122 88 -128 Z">
        <animate attributeName="d" dur="0.7s" repeatCount="indefinite" values="M90 -136 C74 -134 60 -126 46 -130 C56 -120 72 -122 88 -128 Z;M90 -136 C74 -128 60 -132 46 -122 C58 -116 74 -120 88 -128 Z;M90 -136 C74 -134 60 -126 46 -130 C56 -120 72 -122 88 -128 Z"/></path>`
    : "";

  return `<g>
  <ellipse cx="80" cy="52" rx="120" ry="7" fill="#3C4A42" opacity=".13"/>
  <!-- far leg + crank (behind frame) -->
  <path fill="none" stroke="${C.legDark}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="d" dur="${crankDur}s" repeatCount="indefinite" values="${leg(Math.PI)}"/></path>
  ${crank(180, C.bikeDark)}
  ${wheel(...R)}
  ${wheel(...F)}
  <!-- frame -->
  <g fill="none" stroke="${C.bike}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 0 L${BB[0]} ${BB[1]} L50 -64 Z"/>
    <path d="M50 -64 L140 -62 L${BB[0]} ${BB[1]}"/>
    <path d="M140 -62 L146 -48 L160 0"/>
    <path d="M140 -62 L136 -84 C142 -90 150 -88 156 -84"/>
    <path d="M48 -64 L46 -76"/>
  </g>
  <path d="M-8 -34 L40 -40" stroke="${C.bikeDark}" stroke-width="3" stroke-linecap="round"/>
  <path d="M-4 -30 C-20 -30 -40 -10 -50 8" fill="none" stroke="${C.bike}" stroke-width="3" opacity=".7"/>
  <circle cx="${BB[0]}" cy="${BB[1]}" r="11" fill="none" stroke="${C.bikeDark}" stroke-width="3"/>
  <path d="M0 -4 L${BB[0]} -7 M0 4 L${BB[0]} 15" stroke="#4B5552" stroke-width="1.5"/>
  <!-- heron -->
  <g>${bob}
    ${scarfTail}
    <!-- tail feathers -->
    <path d="M-10 -104 L-58 -118 L-40 -104 L-62 -94 L-12 -92 Z" fill="${C.heronDark}"/>
    <!-- body -->
    <path d="M-36 -98 C-8 -136 60 -146 100 -132 C120 -124 120 -100 98 -92 C62 -80 8 -78 -36 -98 Z" fill="${C.heron}"/>
    <path d="M20 -86 C50 -80 80 -84 98 -92 C108 -98 112 -108 110 -116 C90 -96 50 -90 20 -86 Z" fill="${C.heronLight}" opacity=".8"/>
    <!-- saddle -->
    <path d="M30 -78 C40 -84 58 -84 62 -78 C54 -74 38 -74 30 -78 Z" fill="#3A2E2B"/>
    <!-- wing -->
    <path d="M-28 -104 C0 -134 60 -136 90 -118 C64 -100 20 -94 -28 -104 Z" fill="${C.heronDark}" opacity=".85"/>
    <path d="M-10 -108 C20 -124 50 -124 76 -116 M0 -102 C26 -114 52 -114 70 -110" stroke="${C.heronLight}" stroke-width="2" fill="none" opacity=".6"/>
    <!-- arm to handlebar -->
    <path d="M84 -120 C104 -114 124 -100 142 -88" stroke="${C.heron}" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M138 -92 L150 -86 L140 -82 Z" fill="${C.heronDark}"/>
    <!-- neck -->
    <path d="M96 -128 C116 -150 92 -176 106 -202 C110 -210 116 -214 122 -216" stroke="${C.heronPale}" stroke-width="13" stroke-linecap="round" fill="none"/>
    <path d="M104 -136 C112 -154 98 -172 106 -194" stroke="${C.heronDark}" stroke-width="2" stroke-dasharray="4 6" fill="none" opacity=".6"/>
    <!-- scarf knot -->
    <path d="M88 -140 C96 -148 108 -146 110 -136 C104 -130 94 -130 88 -140 Z" fill="${C.scarf}"/>
    <!-- head -->
    <ellipse cx="126" cy="-218" rx="15" ry="10.5" fill="${C.heronPale}"/>
    <path d="M112 -224 C118 -232 132 -232 140 -224 C130 -226 120 -224 112 -224 Z" fill="${C.cap}"/>
    <path d="M114 -226 C100 -230 90 -226 82 -218" stroke="${C.cap}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M116 -224 C104 -222 96 -216 92 -208" stroke="${C.cap}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M139 -221 L190 -214 L139 -212 Z" fill="${C.beak}"/>
    <path d="M139 -216.5 L176 -214.5" stroke="#B0802C" stroke-width="1"/>
    <circle cx="131" cy="-220" r="2.2" fill="${C.cap}"/>
    <circle cx="131.7" cy="-220.7" r=".7" fill="#fff"/>
  </g>
  <!-- near leg + crank (in front) -->
  <path fill="none" stroke="${C.leg}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="d" dur="${crankDur}s" repeatCount="indefinite" values="${leg(0)}"/></path>
  ${crank(0, C.bikeDark)}
</g>`;
}

// ---------- 1. HERO ----------
function hero() {
  const W = 900, H = 400;
  const far = `<path d="${hillPath(W, 250, 42, 3, 3, H)}" fill="${C.hillFar}"/>
    <g opacity=".55">${[80, 330, 610, 820].map((x, i) => `<g transform="translate(${x} 232) scale(.35)">${bloomCluster(0, 0, 60, rng(40 + i), 6)}</g>`).join("")}</g>`;
  const mid = `<path d="${hillPath(W, 292, 34, 2, 11, H)}" fill="${C.hillMid}"/>
    ${[330, 560, 800].map((x, i) => `<g transform="translate(${x} 280)"><path d="M0 0 L0 -26" stroke="${C.trunk}" stroke-width="3"/>${bloomCluster(0, -34, 20, rng(70 + i), 5)}</g>`).join("")}`;
  const nearBand = `<path d="${hillPath(W, 330, 16, 3, 21, H)}" fill="${C.hillNear}"/>`;
  const groundDetail = (() => {
    const r = rng(5);
    let s = "";
    for (let i = 0; i < 16; i++) {
      const x = f(r() * W), y = f(392 + r() * 6);
      s += `<path d="M${x} ${y} l-3 -9 M${x} ${y} l2 -11 M${x} ${y} l6 -8" stroke="${C.grass}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const x = f(r() * W);
      s += `<ellipse cx="${x}" cy="${f(360 + r() * 8)}" rx="${f(10 + r() * 16)}" ry="1.6" fill="${C.pathEdge}" opacity=".8"/>`;
    }
    for (let i = 0; i < 10; i++) s += `<use href="#petal" fill="${C.pink2}" transform="translate(${f(r() * W)} ${f(356 + r() * 18)}) rotate(${f(r() * 360)}) scale(.8)"/>`;
    return s;
  })();

  const body = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.skyTop}"/><stop offset="1" stop-color="${C.skyBottom}"/></linearGradient>
  <linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.mist}" stop-opacity=".96"/><stop offset=".6" stop-color="${C.mist}" stop-opacity=".78"/><stop offset="1" stop-color="${C.mist}" stop-opacity="0"/></linearGradient>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="700" cy="96" r="54" fill="#F7E3D5" opacity=".8"/>
    <circle cx="700" cy="96" r="80" fill="#F7E3D5" opacity=".3"/>
    ${scroller(W, far, 90, "far")}
    ${scroller(W, mid, 48, "mid")}
    ${scroller(W, nearBand, 26, "near")}
    <rect y="346" width="${W}" height="${H - 346}" fill="${C.path}"/>
    <path d="M0 346 H${W}" stroke="${C.pathEdge}" stroke-width="2"/>
    <rect y="386" width="${W}" height="${H - 386}" fill="#A9BC9F"/>
    ${scroller(W, groundDetail, 9, "ground")}
    <rect width="420" height="${H}" fill="url(#fadeL)"/>
    ${sakuraTree(870, 360, 1.05, true, 9)}
    ${branch([[-10, -6], [40, 30], [90, 46], [150, 50], [200, 70]], 9, [[40, 26, 30], [96, 50, 34], [150, 60, 30], [202, 78, 26], [10, 10, 26]], 31)}
    <g transform="translate(470 318)">${heronOnBike()}</g>
    ${petals(26, W, H, 12)}
    <!-- title -->
    <g transform="translate(56 150)">
      <text class="mono" font-size="12" letter-spacing="3.5" fill="${C.rose}">KEKINCAI · TOKYO 35.68°N</text>
      <text class="serif" y="58" font-size="54" fill="${C.ink}" letter-spacing="1">Paul Cai</text>
      <text class="jp" y="102" font-size="26" fill="${C.ink}" letter-spacing="10">春日慢行</text>
      <path d="M0 124 C40 120 90 126 150 121" stroke="${C.rose}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <text class="jp" y="154" font-size="16" fill="${C.inkSoft}" letter-spacing="1.5">役に立つ道具を、丁寧につくる。</text>
      <text class="mono" y="180" font-size="11" letter-spacing="2" fill="${C.inkFaint}">AI × NATIVE × LOCAL-FIRST</text>
    </g>
    ${grainRect(W, H)}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="${C.paperEdge}" stroke-width="1.5"/>`;
  return svg(W, H, "Paul Cai — a heron pedals a bicycle beneath drifting cherry blossoms, Tokyo", body);
}

// ---------- paper card shell ----------
function card(W, H, inner, { title, corner = true, seed = 1 } = {}) {
  const body = `
  <clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    ${inner}
    ${corner ? `<g opacity=".95">${branch([[W + 10, -8], [W - 40, 16], [W - 80, 20]], 5, [[W - 30, 14, 18], [W - 78, 24, 16], [W - 4, 30, 14]], seed + 100)}</g>` : ""}
    ${grainRect(W, H)}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="19.5" fill="none" stroke="${C.paperEdge}" stroke-width="1.5"/>`;
  return svg(W, H, title, body);
}

function textLines(lines, x, y, lh, attrs) {
  return lines.map((l, i) => `<text x="${x}" y="${y + i * lh}" ${attrs}>${esc(l)}</text>`).join("");
}

// ---------- 2. SIGNAL / ABOUT ----------
function about() {
  const W = 900, H = 290;
  const ticket = `<g transform="translate(590 58)">
    <rect width="250" height="176" rx="10" fill="#FBF7EF" stroke="${C.paperEdge}" stroke-width="1.5"/>
    <path d="M0 44 H250" stroke="${C.paperEdge}" stroke-dasharray="4 4"/>
    <circle cx="0" cy="44" r="8" fill="${C.paper}" stroke="${C.paperEdge}"/><circle cx="250" cy="44" r="8" fill="${C.paper}" stroke="${C.paperEdge}"/>
    <text x="20" y="29" class="jp" font-size="16" fill="${C.ink}" letter-spacing="4">乗車券</text>
    <text x="230" y="28" class="mono" font-size="10" letter-spacing="2" fill="${C.rose}" text-anchor="end">RIDE PASS</text>
    ${[["FROM", "TOKYO  35.6762° N"], ["FOCUS", "AI × NATIVE × LOCAL"], ["MODE", "BUILD TO UNDERSTAND"], ["", "SHIP TO LEARN"]]
      .map(([k, v], i) => `<text x="20" y="${76 + i * 26}" class="mono" font-size="10" letter-spacing="1.5" fill="${C.inkFaint}">${k}</text><text x="78" y="${76 + i * 26}" class="mono" font-size="11.5" letter-spacing=".6" fill="${C.ink}">${esc(v)}</text>`).join("")}
    <g transform="translate(222 150) rotate(-12)" opacity=".85"><circle r="18" fill="none" stroke="${C.rose}" stroke-width="1.8"/><circle r="14" fill="none" stroke="${C.rose}" stroke-width=".8"/><text y="5" class="jp" font-size="13" fill="${C.rose}" text-anchor="middle">済</text></g>
  </g>`;
  const inner = `
    <text x="54" y="66" class="mono" font-size="12" letter-spacing="3.5" fill="${C.rose}">00 / SIGNAL</text>
    <text x="178" y="66" class="jp" font-size="12" letter-spacing="3" fill="${C.inkFaint}">信号</text>
    ${textLines(["東京で、日々の小さな摩擦を", "ほどくソフトウェアをつくっています。"], 54, 110, 36, `class="jp" font-size="23" fill="${C.ink}" letter-spacing="1.5"`)}
    ${textLines(["I build focused tools across native Apple platforms, AI workflows,", "and local data. The stack changes; the standard does not — clear", "purpose, observable behavior, and software that earns its place."], 54, 192, 23, `class="serif" font-size="15" fill="${C.inkSoft}"`)}
    ${ticket}
    ${petals(8, W, H, 88, { drift: -80, minDur: 14, maxDur: 22, scale: 0.9 })}`;
  return card(W, H, inner, { title: "00 / Signal — I build focused tools across native Apple platforms, AI workflows, and local data. Based in Tokyo.", corner: false });
}

// ---------- section header ----------
function header(num, en, jp, file, seed) {
  const W = 900, H = 90;
  const body = `
    <path d="M110 68 C300 62 520 72 800 64" stroke="${C.paperEdge}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g transform="translate(78 46)">${flower(0, 0, 16, C.pink2)}</g>
    <text x="118" y="52" class="mono" font-size="13" letter-spacing="4" fill="${C.rose}">${num}</text>
    <text x="160" y="54" class="serif" font-size="26" fill="${C.ink}" letter-spacing="2">${esc(en)}</text>
    <text x="840" y="54" class="jp" font-size="15" fill="${C.inkFaint}" letter-spacing="6" text-anchor="end">${esc(jp)}</text>
    
    ${[0, 1, 2].map((i) => `<use href="#petal" fill="${C.pink2}" transform="translate(${600 + i * 70 + seed * 7} ${72 + (i % 2) * 6}) rotate(${i * 70 + seed * 20})"/>`).join("")}`;
  writeFileSync(join(OUT, file), card(W, H, body, { title: `${num} ${en} — ${jp}`, corner: false }));
}

// ---------- 3. project cards ----------
function projectCard(file, { num, name, tags, lines, jp, vignette, seed }) {
  const W = 440, H = 300;
  const inner = `
    <g>${vignette}</g>
    <text x="30" y="192" class="mono" font-size="11" letter-spacing="3" fill="${C.rose}">${num}</text>
    <text x="410" y="192" class="mono" font-size="10" letter-spacing="1.6" fill="${C.inkFaint}" text-anchor="end">${esc(tags)}</text>
    <text x="30" y="224" class="serif" font-size="25" fill="${C.ink}">${esc(name)}</text>
    ${textLines(lines, 30, 252, 20, `class="${jp ? "jp" : "serif"}" font-size="${jp ? 13.5 : 14.5}" fill="${C.inkSoft}"`)}
    <text x="410" y="224" class="mono" font-size="16" fill="${C.inkFaint}" text-anchor="end">↗</text>`;
  writeFileSync(join(OUT, file), card(W, H, inner, { title: `${num} ${name} — ${lines.join(" ")}`, corner: false, seed }));
}

function vignetteFrame(content, seed, sky = [C.skyTop, C.skyBottom]) {
  return `<linearGradient id="vs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
  <rect width="440" height="160" fill="url(#vs)"/>
  ${content}
  <path d="M0 160 H440" stroke="${C.paperEdge}" stroke-width="1.5"/>`;
}

const vDiskFerry = vignetteFrame(`
  <path d="${hillPath(440, 96, 26, 2, 4, 160)}" fill="${C.hillFar}"/>
  <path d="M0 104 C80 98 160 110 240 104 C320 98 380 108 440 102 L440 160 L0 160 Z" fill="${C.water}"/>
  <g stroke="#fff" stroke-width="1.5" opacity=".7" stroke-linecap="round">
    <path d="M40 124 h26 M120 138 h18 M300 128 h30 M360 146 h16 M210 150 h22"><animateTransform attributeName="transform" type="translate" values="0 0;-10 0;0 0" dur="5s" repeatCount="indefinite"/></path>
  </g>
  <g transform="translate(160 118)"><animateTransform attributeName="transform" type="translate" values="160 118;166 115;172 118;166 120;160 118" dur="5s" repeatCount="indefinite"/>
    <path d="M-50 0 L50 0 L38 18 L-40 18 Z" fill="${C.trunk}"/>
    <path d="M-50 0 L50 0" stroke="${C.trunkDark}" stroke-width="2"/>
    <rect x="-34" y="-30" width="36" height="30" rx="4" fill="#3E4B55"/><circle cx="-8" cy="-8" r="2.5" fill="#8FD19E"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle>
    <rect x="6" y="-22" width="28" height="22" rx="3" fill="#6B7C88"/><circle cx="26" cy="-6" r="2" fill="#F2C46B"/>
    <path d="M-4 -30 L-4 -64 L28 -40 Z" fill="${C.bloomLight}" stroke="${C.pathEdge}"/><path d="M-4 -64 L-4 0" stroke="${C.trunkDark}" stroke-width="2"/>
  </g>
  <path d="M340 104 L440 90 L440 104 Z" fill="${C.hillNear}"/><g transform="translate(396 70)">${bloomCluster(0, 0, 18, rng(3), 5)}</g><path d="M396 80 L396 98" stroke="${C.trunk}" stroke-width="3"/>
  ${petals(8, 440, 150, 101, { drift: -60, minDur: 8, maxDur: 12, scale: 0.8 })}`, 1);

const vFde = vignetteFrame(`
  <path d="M60 130 L160 42 C166 38 172 38 178 42 L286 130 Z" fill="#BFC9C7"/>
  <path d="M146 55 L160 42 C166 38 172 38 178 42 L192 55 C180 60 172 52 168 58 C162 50 154 60 146 55 Z" fill="#FBF7EF"/>
  <path d="${hillPath(440, 128, 24, 2, 8, 160)}" fill="${C.hillMid}"/>
  <path d="M0 140 C120 132 300 146 440 136 L440 160 L0 160 Z" fill="${C.hillNear}"/>
  <g transform="translate(348 132)">
    <path d="M-16 0 L-8 -64 L8 -64 L16 0 Z" fill="#F4EDE1" stroke="${C.pathEdge}"/>
    <path d="M-12 -30 H12 M-10 -48 H10" stroke="${C.rose}" stroke-width="5" opacity=".75"/>
    <rect x="-10" y="-80" width="20" height="16" rx="2" fill="#F7DA93"/>
    <path d="M-13 -80 L0 -92 L13 -80 Z" fill="${C.rose}"/>
    <g transform="translate(0 -72)"><path d="M0 0 L-160 -30 L-160 22 Z" fill="#FFF3C9" opacity=".45"><animateTransform attributeName="transform" type="rotate" values="-18;28;-18" dur="7s" repeatCount="indefinite"/></path></g>
  </g>
  <g transform="translate(70 118)"><path d="M0 0 L0 -18" stroke="${C.trunk}" stroke-width="2.5"/>${bloomCluster(0, -24, 14, rng(9), 4)}</g>
  <g opacity=".7" fill="none" stroke="${C.rose}" stroke-width="1.2">${[0, 1, 2].map((i) => `<circle cx="348" cy="60" r="10"><animate attributeName="r" values="6;40" dur="3s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="3s" begin="${i}s" repeatCount="indefinite"/></circle>`).join("")}</g>
  ${petals(6, 440, 150, 202, { drift: -60, minDur: 9, maxDur: 13, scale: 0.8 })}`, 2);

const vCobra = vignetteFrame(`
  <g stroke="${C.paperEdge}" stroke-width="1">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 40} 0 V160"/>`).join("")}${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${i * 40} H440"/>`).join("")}</g>
  <path d="${hillPath(440, 150, 12, 3, 13, 160)}" fill="${C.hillNear}" opacity=".7"/>
  ${[[70, 58], [130, 84], [190, 70], [250, 104], [310, 92], [370, 120]].map(([x, h], i) => `<g><rect x="${x - 14}" y="${150 - h}" width="28" height="${h}" rx="5" fill="${[C.pink2, C.hillMid, C.pink3][i % 3]}" opacity=".9"><animate attributeName="height" values="${h};${h - 10};${h}" dur="${4 + i * 0.4}s" repeatCount="indefinite"/><animate attributeName="y" values="${150 - h};${160 - h};${150 - h}" dur="${4 + i * 0.4}s" repeatCount="indefinite"/></rect></g>`).join("")}
  <path d="M70 84 L130 58 L190 72 L250 38 L310 50 L370 22" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="5 5"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite"/></path>
  ${[[70, 84], [130, 58], [190, 72], [250, 38], [310, 50], [370, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/>`).join("")}
  ${petals(6, 440, 150, 303, { drift: -60, minDur: 9, maxDur: 13, scale: 0.8 })}`, 3, ["#F4EFE6", "#EEE7DA"]);

const vBookmark = vignetteFrame(`
  <path d="${hillPath(440, 132, 18, 2, 17, 160)}" fill="${C.hillFar}"/>
  <ellipse cx="220" cy="146" rx="170" ry="8" fill="#3C4A42" opacity=".1"/>
  ${[[-150, 0.62, -30, C.heronPale], [-80, 0.8, -18, C.pink1], [80, 0.8, 18, "#E4EBDD"], [150, 0.62, 30, C.bloomLight]].map(([dx, s, sk, col]) => `<g transform="translate(${220 + dx} 80) scale(${s}) skewY(${sk > 0 ? -8 : 8})"><rect x="-42" y="-56" width="84" height="112" rx="6" fill="${col}" stroke="${C.pathEdge}"/><rect x="-32" y="-44" width="64" height="36" rx="3" fill="#fff" opacity=".7"/><path d="M-32 6 H26 M-32 18 H14 M-32 30 H22" stroke="${C.inkFaint}" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>`).join("")}
  <g transform="translate(220 78)"><animateTransform attributeName="transform" type="translate" values="220 78;220 72;220 78" dur="3.2s" repeatCount="indefinite"/>
    <rect x="-46" y="-60" width="92" height="120" rx="7" fill="#FBF7EF" stroke="${C.pathEdge}" stroke-width="1.5"/>
    <rect x="-36" y="-48" width="72" height="44" rx="4" fill="${C.skyBottom}"/>
    <path d="M-36 -12 Q-18 -26 0 -14 T36 -18 V-4 H-36 Z" fill="${C.hillMid}"/>
    <circle cx="18" cy="-36" r="6" fill="#F7E3D5"/>
    <path d="M-36 12 H30 M-36 24 H16 M-36 36 H26" stroke="${C.inkSoft}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    <path d="M26 -60 V-36 L32 -42 L38 -36 V-60 Z" fill="${C.rose}"/>
  </g>
  ${petals(6, 440, 150, 404, { drift: -60, minDur: 9, maxDur: 13, scale: 0.8 })}`, 4);

// ---------- 4. tool stamps (駅スタンプ) ----------
function stamp(file, { num, name, lines, icon, rot, seed }) {
  const W = 210, H = 262;
  const r = 70;
  const cx = 105, cy = 100;
  const inner = `
    <g transform="rotate(${rot} ${cx} ${cy})" opacity=".92">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.rose}" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 7}" fill="none" stroke="${C.rose}" stroke-width="1"/>
      <path id="arc" d="M${cx - r + 17} ${cy} A${r - 17} ${r - 17} 0 0 1 ${cx + r - 17} ${cy}" fill="none"/>
      <text class="mono" font-size="10" letter-spacing="2.2" fill="${C.rose}"><textPath href="#arc" startOffset="50%" text-anchor="middle">${esc(name.toUpperCase())}</textPath></text>
      <g transform="translate(${cx} ${cy + 8})" fill="none" stroke="${C.rose}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
      <text x="${cx}" y="${cy + 54}" class="mono" font-size="10" fill="${C.rose}" text-anchor="middle" letter-spacing="2">${num}</text>
    </g>
    ${textLines([name], cx, 204, 0, `class="serif" font-size="16.5" fill="${C.ink}" text-anchor="middle"`)}
    ${textLines(lines, cx, 226, 17, `class="serif" font-size="12.5" fill="${C.inkSoft}" text-anchor="middle"`)}
    ${bloomCluster(W - 10, 12, 12, rng(seed), 4)}`;
  writeFileSync(join(OUT, file), card(W, H, inner, { title: `${num} ${name} — ${lines.join(" ")}`, corner: false, seed }));
}

// ---------- 5. principles: a ride past four milestones ----------
function principles() {
  const W = 900, H = 300;
  const items = [
    ["01", "Make the problem", "concrete."],
    ["02", "Keep private data", "close to the user."],
    ["03", "Build the smallest", "complete thing."],
    ["04", "Test it in the", "real world."],
  ];
  const roadY = (x) => 214 - 8 * Math.sin((x / 300) * Math.PI);
  const road = "M-40 214 C150 196 300 232 450 214 C600 196 750 232 940 212";
  const inner = `
    <linearGradient id="ps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.skyTop}"/><stop offset="1" stop-color="${C.skyBottom}"/></linearGradient>
    <rect width="${W}" height="${H}" fill="url(#ps)"/>
    <path d="${hillPath(W, 180, 30, 3, 51, H)}" fill="${C.hillFar}"/>
    <path d="${hillPath(W, 206, 16, 4, 52, H)}" fill="${C.hillMid}"/>
    <path d="M0 214 C150 196 300 232 450 214 C600 196 750 232 900 212 L900 ${H} L0 ${H} Z" fill="${C.hillNear}"/>
    <path d="${road}" stroke="${C.path}" stroke-width="18" fill="none" stroke-linecap="round"/>
    <path d="${road}" stroke="${C.pathEdge}" stroke-width="1.5" stroke-dasharray="10 12" fill="none"/>
    <text x="54" y="54" class="mono" font-size="12" letter-spacing="3.5" fill="${C.rose}">03 / OPERATING PRINCIPLES</text>
    <text x="846" y="54" class="jp" font-size="14" letter-spacing="6" fill="${C.inkFaint}" text-anchor="end">道しるべ</text>
    <g><animateTransform attributeName="transform" type="translate" values="${[-100, 0, 150, 300, 450, 600, 750, 900, 1000].map((x) => `${x} ${f(roadY(x))}`).join(";")}" dur="26s" begin="-9s" repeatCount="indefinite"/>
      <g transform="translate(-24 -20) scale(.36)">${heronOnBike()}</g>
    </g>
    ${items.map(([n, a, b], i) => {
      const x = 120 + i * 220;
      return `<g transform="translate(${x} 0)">
        <path d="M0 ${208 + (i % 2 ? 4 : -4)} V140" stroke="${C.trunk}" stroke-width="4" stroke-linecap="round"/>
        <path d="M-86 84 H72 L88 112 L72 140 H-86 Z" fill="#FBF7EF" stroke="${C.pathEdge}" stroke-width="1.5"/>
        <text x="-72" y="106" class="mono" font-size="11" fill="${C.rose}" letter-spacing="1.5">${n}</text>
        <text x="-46" y="106" class="serif" font-size="14" fill="${C.ink}">${esc(a)}</text>
        <text x="-46" y="127" class="serif" font-size="14" font-style="italic" fill="${C.inkSoft}">${esc(b)}</text>
        ${bloomCluster(-80, 86, 10, rng(60 + i), 3)}
      </g>`;
    }).join("")}
    ${petals(12, W, H, 707, { drift: -120, minDur: 12, maxDur: 20, scale: 0.9 })}`;
  return card(W, H, inner, { title: "03 / Operating principles — 01 Make the problem concrete. 02 Keep private data close to the user. 03 Build the smallest complete thing. 04 Test it in the real world.", corner: false });
}

// ---------- 6. footer: riding off at dusk ----------
function footer() {
  const W = 900, H = 190;
  const inner = `
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBD9CF"/><stop offset=".6" stop-color="#F3DCCB"/><stop offset="1" stop-color="#E9C9C0"/></linearGradient>
    <rect width="${W}" height="${H}" fill="url(#dusk)"/>
    <circle cx="780" cy="128" r="46" fill="#F6C9A8" opacity=".85"/>
    <path d="${hillPath(W, 140, 26, 3, 91, H)}" fill="#C9B7B3"/>
    <path d="${hillPath(W, 158, 14, 4, 92, H)}" fill="#AD9C9E"/>
    <rect y="160" width="${W}" height="30" fill="#8F8288"/>
    <g opacity=".85"><g><animateTransform attributeName="transform" type="translate" values="520 0;980 0" dur="30s" repeatCount="indefinite"/>
      <g transform="translate(0 148) scale(.28)" >${heronOnBike()}</g></g></g>
    ${sakuraTree(40, 168, 0.55, false, 17)}
    <text x="450" y="64" class="jp" font-size="22" fill="${C.ink}" text-anchor="middle" letter-spacing="6">風を読み、静かに前へ。</text>
    <text x="450" y="92" class="mono" font-size="11" fill="${C.inkSoft}" text-anchor="middle" letter-spacing="4">SOFTWARE FOR A KINDER TOMORROW</text>
    ${petals(10, W, H, 909, { drift: -100, minDur: 10, maxDur: 16, scale: 0.9 })}`;
  return card(W, H, inner, { title: "風を読み、静かに前へ。 Software for a kinder tomorrow.", corner: false });
}

// ---------- write ----------
writeFileSync(join(OUT, "hero.svg"), hero());
writeFileSync(join(OUT, "signal.svg"), about());
header("01", "Selected Work", "選んだ仕事", "h-work.svg", 1);
header("02", "Small Tools, Sharp Edges", "小さな道具", "h-tools.svg", 2);

projectCard("p-diskferry.svg", { num: "01", name: "DiskFerry", tags: "SWIFT · MACOS · RCLONE", lines: ["Native macOS transfers for drives, NAS and", "Windows shares — with honest live progress."], vignette: vDiskFerry, seed: 1 });
projectCard("p-fde.svg", { num: "02", name: "FDE Radar", tags: "ASTRO · WORKERS · D1", jp: true, lines: ["日本を中心に、Webとデジタルの変化を", "会社と個人の判断材料として整理する。"], vignette: vFde, seed: 2 });
projectCard("p-cobra.svg", { num: "03", name: "CoBRA", tags: "JAVASCRIPT · LOCAL-FIRST", lines: ["A source-backed workspace for reproducible", "software estimation and AI-impact analysis."], vignette: vCobra, seed: 3 });
projectCard("p-bookmark.svg", { num: "04", name: "Bookmark Cover Flow", tags: "TS · CHROME · IDB", lines: ["An editorial, spatial way to browse Chrome", "bookmarks through real webpage previews."], vignette: vBookmark, seed: 4 });

stamp("t-taskpaper.svg", { num: "No.01", name: "TaskPaper MCP", lines: ["Structured TaskPaper", "access for AI on macOS"], rot: -6, seed: 11,
  icon: `<rect x="-20" y="-26" width="40" height="46" rx="4"/><path d="M-12 -14 l4 4 l7 -8 M4 -12 h10 M-12 0 l4 4 l7 -8 M4 2 h10"/><path d="M-12 12 h26"/>` });
stamp("t-telegram.svg", { num: "No.02", name: "Telegram Drive", lines: ["Read-only Telegram media", "in Finder via File Provider"], rot: 5, seed: 12,
  icon: `<path d="M-24 -4 L22 -22 L12 22 L-2 8 Z M-2 8 L22 -22"/><path d="M-22 16 h14 v10 h-14 z"/>` });
stamp("t-safeclip.svg", { num: "No.03", name: "Safe Clip", lines: ["Local-first redaction", "for text in PopClip"], rot: -3, seed: 13,
  icon: `<path d="M0 -26 L20 -18 V0 C20 14 10 22 0 26 C-10 22 -20 14 -20 0 V-18 Z"/><path d="M-10 -2 h20 M-10 8 h12"/><rect x="-10" y="-14" width="20" height="6" rx="1" fill="${C.rose}"/>` });
stamp("t-racket.svg", { num: "No.04", name: "LLM in Racket", lines: ["Minimal CPU-only GPT,", "rebuilt from first principles"], rot: 7, seed: 14,
  icon: `<path d="M-16 -26 C-28 -12 -28 12 -16 26 M16 -26 C28 -12 28 12 16 26"/><path d="M-8 -18 L10 18 M1 0 L-10 18"/>` });

writeFileSync(join(OUT, "principles.svg"), principles());
writeFileSync(join(OUT, "footer.svg"), footer());
console.log("wrote", OUT);
