// Moving illustrations for the chapters, drawn as SVG so they stay sharp on any phone,
// load instantly, and carry Bengali or English words.
//
// To place one in a chapter, put a line on its own in the .txt file:
//     [figure: oxygen]
// The build replaces it with the drawing and its caption, in the language of that page.
// A name that is not in this file stops the build, so a typing slip is noticed at once.
//
// House style: the site's colours (teal ink, red cells, mint and rose panels), soft round shapes,
// at most a few words inside the drawing, slow gentle movement that stops for readers who ask
// their phone for less motion. Every drawing must say only what the chapter says.

const C = {
  ink: '#15211F', teal: '#0B3F3D', teal2: '#126158', mint: '#E6F3EE', mintLine: '#BFE0D6',
  red: '#D8323F', rose: '#F08A93', roseBg: '#FDEDEE', vessel: '#F9DDE0', muted: '#5B6B68',
  amber: '#E39A2D', amberBg: '#FFF1DC', o2: '#4C74D9', lung: '#9ED2C6',
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.size || 14.5}" font-weight="${o.w || 500}" fill="${o.fill || C.ink}">${esc(s)}</text>`;

// One red cell, drawn the way the site draws them, optionally carrying an oxygen bubble.
const cell = (r = 11, o2 = true) =>
  `<circle r="${r}" fill="${C.red}"/><circle r="${r * 0.45}" fill="${C.rose}"/>` +
  (o2 ? `<circle cx="${r * 0.7}" cy="${-r * 0.85}" r="${r * 0.42}" fill="${C.o2}"/>` : '');

// A person, and the two copies ("নকশা") of the hemoglobin instructions they carry.
const person = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><circle cy="-14" r="11" fill="${C.teal}"/>` +
  `<path d="M-19 16c0-15 8-21 19-21s19 6 19 21z" fill="${C.teal}"/></g>`;
// kind: 'ok' (works), 'beta' (beta thalassemia mistake), 'e' (hemoglobin E)
function copy(x, y, kind, s = 1, cls = '') {
  const fill = kind === 'ok' ? C.mint : kind === 'e' ? C.amberBg : C.roseBg;
  const line = kind === 'ok' ? C.teal2 : kind === 'e' ? C.amber : C.red;
  const mark = kind === 'ok'
    ? `<path d="M-4 1l3 3 6-7" fill="none" stroke="${line}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
    : kind === 'e'
      ? `<text y="5" text-anchor="middle" font-size="12" font-weight="700" fill="${line}">E</text>`
      : `<path d="M-4-4l8 8M4-4l-8 8" stroke="${line}" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<g${cls ? ` class="${cls}"` : ''} transform="translate(${x},${y}) scale(${s})"><rect x="-9" y="-14" width="18" height="28" rx="5" fill="${fill}" stroke="${line}" stroke-width="2"/>${mark}</g>`;
}
const pair = (x, y, a, b, s = 1, cls = '') => copy(x - 11 * s, y, a, s, cls) + copy(x + 11 * s, y, b, s, cls);

function svg(id, w, h, label, css, body) {
  return `<svg class="figsvg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" font-family="inherit">` +
    `<style>${css}@media (prefers-reduced-motion:reduce){.${id} *{animation:none!important}}</style><g class="${id}">${body}</g></svg>`;
}

const FIG = {
  // Anaemia: hemoglobin as lorries carrying oxygen; fewer lorries in anaemia.
  oxygen(l) {
    const t = l === 'bn'
      ? { a: 'স্বাভাবিক', b: 'অ্যানিমিয়া', lung: 'ফুসফুস', body: 'শরীর',
          cap: 'রক্তের হিমোগ্লোবিন লরির মতো ফুসফুস থেকে অক্সিজেন (নীল) শরীরে পৌঁছে দেয়। অ্যানিমিয়ায় লরি কম, তাই অক্সিজেনও কম পৌঁছায়।' }
      : { a: 'Normal', b: 'Anaemia', lung: 'lungs', body: 'body',
          cap: 'Hemoglobin carries oxygen (blue) from the lungs to the body, like a fleet of lorries. In anaemia there are fewer lorries, so less oxygen arrives.' };
    const lane = (y, n, dur) => {
      let g = `<rect x="58" y="${y - 20}" width="244" height="40" rx="20" fill="${C.vessel}"/>`;
      for (let i = 0; i < n; i++) g += `<g transform="translate(70,${y})"><g class="fx-mv" style="animation-duration:${dur}s;animation-delay:-${(dur / n) * i}s">${cell(11)}</g></g>`;
      return g;
    };
    const lungs = (y) => `<g transform="translate(30,${y})"><path d="M-3-17c-13-2-19 13-17 24 1 7 8 9 17 5z" fill="${C.lung}"/><path d="M3-17c13-2 19 13 17 24-1 7-8 9-17 5z" fill="${C.lung}"/><path d="M0-22v16" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/></g>`;
    const heart = (y) => `<g transform="translate(330,${y}) scale(1.35)"><path d="M0 9C-14-1-12-15-3-13c2 .5 3 2 3 3 0-1 1-2.5 3-3 9-2 11 12-3 22z" fill="${C.red}"/></g>`;
    const body =
      T(18, 24, t.a, { a: 'start', w: 700, fill: C.teal }) +
      lungs(66) + heart(66) + lane(66, 6, 7) +
      T(18, 136, t.b, { a: 'start', w: 700, fill: C.red }) +
      lungs(178) + heart(178) + lane(178, 2, 7) +
      T(30, 214, t.lung, { size: 12.5, fill: C.muted }) + T(330, 214, t.body, { size: 12.5, fill: C.muted });
    return {
      cap: t.cap,
      svg: svg('fx', 360, 222, t.cap,
        '.fx-mv{animation:fxdrive linear infinite}@keyframes fxdrive{0%{transform:translateX(0);opacity:0}8%{opacity:1}90%{opacity:1}100%{transform:translateX(220px);opacity:0}}',
        body),
    };
  },

  // Thalassemia: two copies; one faulty copy makes a healthy carrier, two cause thalassemia major.
  copies(l) {
    const t = l === 'bn'
      ? { c: ['দুটো নকশাই ঠিক', 'একটায় ভুল', 'দুটোতেই ভুল'], s: ['সুস্থ', 'বাহক, সুস্থ', 'থ্যালাসেমিয়া মেজর'],
          cap: 'হিমোগ্লোবিন তৈরির নকশা প্রত্যেকের থাকে দুটো করে। একটায় ভুল থাকলে মানুষটা বাহক, কিন্তু সুস্থ। দুটোতেই ভুল থাকলে থ্যালাসেমিয়া মেজর, তখন নিয়মিত রক্ত লাগে।' }
      : { c: ['Both copies work', 'One mistake', 'Two mistakes'], s: ['healthy', 'carrier, healthy', 'thalassemia major'],
          cap: 'Everyone carries two copies of the instructions for hemoglobin. One faulty copy makes a carrier, who is healthy. Two faulty copies cause thalassemia major, which needs regular blood.' };
    const col = (x, a, b, i) =>
      person(x, 52) + copy(x - 11, 104, a, 1, a === 'beta' ? 'cpbad' : '') + copy(x + 11, 104, b, 1, b === 'beta' ? 'cpbad' : '') +
      T(x, 150, t.c[i], { size: 14, w: 700, fill: i === 2 ? C.red : C.teal }) +
      T(x, 168, t.s[i], { size: 13.5, fill: C.muted });
    return {
      cap: t.cap,
      svg: svg('cp', 360, 182, t.cap,
        '.cpbad{animation:cppulse 2.6s ease-in-out infinite}@keyframes cppulse{0%,100%{opacity:1}50%{opacity:.4}}',
        col(60, 'ok', 'ok', 0) + col(180, 'ok', 'beta', 1) + col(300, 'beta', 'beta', 2)),
    };
  },

  // Thalassemia inheritance: two carrier parents and the chances for each pregnancy.
  inheritance(l) {
    const t = l === 'bn'
      ? { m: 'মা: বাহক', f: 'বাবা: বাহক', k: ['সুস্থ, বাহক নয়', 'বাহক', 'বাহক', 'মেজর'], o: ['৪ ভাগের ১', '৪ ভাগের ২', '৪ ভাগের ১'],
          cap: 'বাবা-মা দুজনেই বাহক হলে প্রতিবার গর্ভধারণে: ৪ ভাগের ১ ভাগ সম্ভাবনা বাচ্চা সুস্থ ও বাহকও নয়, ৪ ভাগের ২ ভাগ বাহক, আর ৪ ভাগের ১ ভাগ থ্যালাসেমিয়া মেজর।' }
      : { m: 'Mother: carrier', f: 'Father: carrier', k: ['Not affected', 'Carrier', 'Carrier', 'Major'], o: ['1 in 4', '2 in 4', '1 in 4'],
          cap: 'When both parents are carriers, in each pregnancy there is a 1 in 4 chance the baby is not affected, 2 in 4 that the baby is a carrier, and 1 in 4 that the baby has thalassemia major.' };
    const xs = [45, 135, 225, 315];
    const kids = [['ok', 'ok'], ['ok', 'beta'], ['beta', 'ok'], ['beta', 'beta']];
    let body =
      T(110, 16, t.m, { size: 14, w: 700, fill: C.teal }) + T(250, 16, t.f, { size: 14, w: 700, fill: C.teal }) +
      person(110, 50, 0.9) + pair(110, 96, 'ok', 'beta', 0.9) +
      person(250, 50, 0.9) + pair(250, 96, 'ok', 'beta', 0.9) +
      `<path d="M110 118v14M250 118v14M110 132h140M180 132v12M45 144h270" fill="none" stroke="${C.mintLine}" stroke-width="2.5" stroke-linecap="round"/>` +
      xs.map((x) => `<path d="M${x} 144v8" stroke="${C.mintLine}" stroke-width="2.5" stroke-linecap="round"/>`).join('');
    xs.forEach((x, i) => {
      body += `<g class="ih-kid" style="animation-delay:${0.6 + i * 0.5}s">` +
        person(x, 178, 0.72) + pair(x, 214, kids[i][0], kids[i][1], 0.72) +
        T(x, 246, t.k[i], { size: 13.5, w: 700, fill: i === 3 ? C.red : i === 0 ? C.teal : C.ink }) + '</g>';
    });
    body += T(45, 266, t.o[0], { size: 13.5, fill: C.muted }) + T(180, 266, t.o[1], { size: 13.5, fill: C.muted }) +
      T(315, 266, t.o[2], { size: 13.5, fill: C.muted });
    return {
      cap: t.cap,
      svg: svg('ih', 360, 276, t.cap,
        '.ih-kid{animation:ihin 9s ease-out infinite both}@keyframes ihin{0%{opacity:0;transform:translateY(-14px)}8%,88%{opacity:1;transform:none}100%{opacity:0}}',
        body),
    };
  },

  // HbE from one parent and beta thalassemia from the other.
  'hbe-beta'(l) {
    const t = l === 'bn'
      ? { a: 'একজনের HbE ট্রেট', b: 'অন্যজনের বিটা ট্রেট', k: 'এইচবিই বিটা থ্যালাসেমিয়া', s: 'হালকা থেকে নিয়মিত রক্ত লাগা পর্যন্ত',
          cap: 'একজনের রিপোর্টে HbE ট্রেট আর অন্যজনের বিটা থ্যালাসেমিয়া ট্রেট থাকলে বাচ্চা দুটোই পেতে পারে। তখন হয় এইচবিই বিটা থ্যালাসেমিয়া, যা হালকাও হতে পারে, আবার নিয়মিত রক্তও লাগতে পারে।' }
      : { a: 'HbE trait', b: 'Beta thalassemia trait', k: 'HbE beta thalassemia', s: 'from mild to needing regular blood',
          cap: 'If one partner has HbE trait and the other has beta thalassemia trait, a child can inherit both. That is HbE beta thalassemia, which can be mild or can need regular blood.' };
    const body =
      T(95, 16, t.a, { size: 14, w: 700, fill: C.amber }) + T(265, 16, t.b, { size: 14, w: 700, fill: C.red }) +
      person(95, 50, 0.9) + pair(95, 96, 'ok', 'e', 0.9) +
      person(265, 50, 0.9) + pair(265, 96, 'ok', 'beta', 0.9) +
      `<path class="hb-flow" d="M105 112C130 140 160 146 172 160M255 112C230 140 200 146 188 160" fill="none" stroke="${C.mintLine}" stroke-width="2.5" stroke-dasharray="5 6" stroke-linecap="round"/>` +
      `<g class="hb-kid">${person(180, 186, 0.8)}${pair(180, 224, 'e', 'beta', 0.8)}</g>` +
      T(180, 258, t.k, { size: 14.5, w: 700, fill: C.red }) + T(180, 276, t.s, { size: 13.5, fill: C.muted });
    return {
      cap: t.cap,
      svg: svg('hb', 360, 286, t.cap,
        '.hb-flow{animation:hbdash 1.4s linear infinite}@keyframes hbdash{to{stroke-dashoffset:-22}}.hb-kid{animation:hbin 6s ease-out infinite both}@keyframes hbin{0%{opacity:0;transform:translateY(-10px)}12%,88%{opacity:1;transform:none}100%{opacity:0}}',
        body),
    };
  },
};

export const FIGURE_NAMES = Object.keys(FIG);
export function figure(name, l) {
  const f = FIG[name];
  if (!f) throw new Error(`[figure: ${name}] is not a known figure. Known: ${FIGURE_NAMES.join(', ')}`);
  const { svg: s, cap } = f(l);
  return `<figure class="fig">${s}<figcaption>${esc(cap)}</figcaption></figure>`;
}
