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

  // Thalassemia transfusion: hemoglobin over time, with transfusions on time and with late ones.
  // No numbers: the safe band is where the doctor wants the hemoglobin, the low zone is where the marrow overworks.
  'transfusion-timing'(l) {
    const t = l === 'bn'
      ? { a: 'সময়মতো রক্ত', b: 'দেরি করে রক্ত', drop: 'রক্ত নেওয়া', low: 'ম্যারো বেশি খাটে, প্লীহা বাড়ে', time: 'সপ্তাহ ধরে →', ok: 'যেখানে থাকা উচিত',
          cap: 'সময়মতো রক্ত নিলে হিমোগ্লোবিন সেখানেই থাকে, যেখানে ডাক্তার রাখতে চান। বারবার দেরি হলে দুই বারের মাঝে হিমোগ্লোবিন অনেক নেমে যায়, ম্যারো বেশি খাটে আর প্লীহা বড় হতে থাকে।' }
      : { a: 'Blood on time', b: 'Blood late', drop: 'transfusion', low: 'marrow overworks, spleen grows', time: 'weeks →', ok: 'where it should be',
          cap: 'With transfusions on time, hemoglobin stays where the doctor wants it. When they keep getting late, it falls too low between transfusions: the marrow overworks and the spleen grows.' };
    const drop = (x, y) => `<path d="M${x} ${y - 8}c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z" fill="${C.red}"/>`;
    const panel = (oy, title, color, pts, jumps, low) => {
      let g = T(14, oy - 2, title, { a: 'start', w: 700, fill: color, size: 14 }) +
        `<rect x="34" y="${oy + 18}" width="312" height="30" rx="8" fill="${C.mint}"/>`;
      if (low) g += `<rect x="34" y="${oy + 48}" width="312" height="34" rx="8" fill="${C.roseBg}"/>` + T(340, oy + 74, t.low, { a: 'end', size: 12.5, fill: C.red, w: 600 });
      else g += T(340, oy + 66, t.ok, { a: 'end', size: 12.5, fill: C.teal2, w: 600 });
      g += `<path class="tt-line" pathLength="1" d="${pts}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      g += jumps.map((x) => drop(x, oy + 14)).join('');
      return g;
    };
    const top = 'M40 45L100 68V45L160 68V45L220 68V45L280 68V45L340 68';
    const shift = (d, dy) => d.replace(/([MLV])(\d+)(?: (\d+))?/g, (m, c, a, b) => c === 'V' ? `V${+a + dy}` : `${c}${a} ${+b + dy}`);
    const late = 'M40 45L100 68V45L200 83V45L260 68V45L340 75';
    const body =
      `<g transform="translate(0,10)">${drop(262, 0)}${T(272, 4, t.drop, { a: 'start', size: 12.5, fill: C.muted })}</g>` +
      panel(30, t.a, C.teal, shift(top, 6), [100, 160, 220, 280], false) +
      panel(146, t.b, C.red, shift(late, 122), [100, 200, 260], true) +
      `<path d="M40 246h300" stroke="${C.mintLine}" stroke-width="2"/>` + T(340, 262, t.time, { a: 'end', size: 12.5, fill: C.muted });
    return {
      cap: t.cap,
      svg: svg('tt', 360, 270, t.cap,
        '.tt-line{stroke-dasharray:1;stroke-dashoffset:1;animation:ttdraw 8s ease-in-out infinite}@keyframes ttdraw{0%{stroke-dashoffset:1}65%,92%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:.2}}@media (prefers-reduced-motion:reduce){.tt-line{stroke-dashoffset:0}}',
        body),
    };
  },
};

// Short videos made by Dr. Roy, kept in assets/video/<name>.mp4 with a still picture <name>.jpg.
// Placed in a chapter with a line of its own:  [video: thalassemia-carrier]
// Dr. Roy, 2026-11-19: no download option, and the video starts by itself when the reader scrolls to it.
// Phones only let a video start by itself without sound, so it starts muted, with a speaker button for sound.
// The phone's own video controls (which hold the Download menu) are not used; the page draws its own
// play/pause and sound buttons. It starts only when most of it is on screen and pauses when scrolled away.
// It does not start by itself for readers whose phone asks for less motion or is set to save data.
const VIDEO = {
  'thalassemia-carrier': {
    w: 720, h: 1280,
    bn: { label: 'থ্যালাসেমিয়া বাহক: ৩০ সেকেন্ডের ভিডিও', cap: 'আপনি কি থ্যালাসেমিয়ার বাহক? ৩০ সেকেন্ডে পুরো কথাটা। শব্দ শুনতে স্পিকারের বোতামটা চাপুন।' },
    en: { label: 'Thalassemia carrier: a 30 second video', cap: 'Are you a thalassemia carrier? The whole story in 30 seconds. Tap the speaker button for sound.' },
  },
};
export const VIDEO_NAMES = Object.keys(VIDEO);
export function video(name, l) {
  const v = VIDEO[name];
  if (!v) throw new Error(`[video: ${name}] is not a known video. Known: ${VIDEO_NAMES.join(', ')}`);
  const t = v[l] || v.en;
  const L = l === 'bn'
    ? { play: 'চালান', pause: 'থামান', on: 'শব্দ চালু করুন', off: 'শব্দ বন্ধ করুন' }
    : { play: 'Play', pause: 'Pause', on: 'Turn sound on', off: 'Turn sound off' };
  const I = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M4.5 4.5v5h5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  };
  return `<figure class="vid" data-l-play="${esc(L.play)}" data-l-pause="${esc(L.pause)}" data-l-on="${esc(L.on)}" data-l-off="${esc(L.off)}"><div class="vbox">` +
    `<video muted playsinline preload="none" disablepictureinpicture disableremoteplayback controlslist="nodownload noplaybackrate noremoteplayback nofullscreen" width="${v.w}" height="${v.h}" poster="/assets/video/${name}.jpg" aria-label="${esc(t.label)}">` +
    `<source src="/assets/video/${name}.mp4" type="video/mp4"></video>` +
    `<button type="button" class="vplay" aria-label="${esc(L.play)}"><span class="i-play">${I.play}</span><span class="i-replay">${I.replay}</span></button>` +
    `<button type="button" class="vsnd" aria-label="${esc(L.on)}"><span class="i-muted">${I.muted}</span><span class="i-sound">${I.sound}</span></button>` +
    `<span class="vbar" aria-hidden="true"><i></i></span></div><figcaption>${esc(t.cap)}</figcaption></figure>`;
}

// Pictures the reader can touch. Placed the same way, [figure: name], and drawn here in both languages.
// The page script in tools/build.mjs makes them work; the styles are in index.html ("figures the reader can touch").
// They never show a number and never say what the reader has: each one ends by sending the reader to a doctor.
const bnDigits = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const btn = (cls, text, extra = '') => `<button type="button" class="${cls}"${extra}>${esc(text)}</button>`;

// Points along a cubic curve, so a shaded area can follow two curves exactly.
function bez(p0, p1, p2, p3, n = 60) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
  return out;
}
const yAt = (pts, x) => {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) { const [a, b] = [pts[i - 1], pts[i]]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] || 1); }
  }
  return pts[pts.length - 1][1];
};

const TRY = {
  // Anaemia, heart and nerves: a slider lowers the hemoglobin; red cells thin out and the heart speeds up.
  'heart-pace'(l) {
    const t = l === 'bn'
      ? { lbl: 'স্লাইডার সরিয়ে দেখুন: হিমোগ্লোবিন', lo: 'স্বাভাবিক', hi: 'খুব কম', blood: 'রক্ত', heart: 'হৃৎপিণ্ড',
          s: ['হিমোগ্লোবিন স্বাভাবিক। অনেক লোহিত কণিকা অক্সিজেন বয়ে নিয়ে যায়, হৃৎপিণ্ড চলে নিজের সহজ তালে।',
            'একটু কম। প্রতিটা ধুকপুকে অক্সিজেন কম যায়, তাই হৃৎপিণ্ড একটু তাড়াতাড়ি চলে।',
            'কম। সিঁড়ি ভাঙলেই বুক ধড়ফড় করে, অল্প পরিশ্রমেই হাঁফ ধরে।',
            'খুব কম। বসে থাকলেও বুক ধড়ফড়, বসে থাকলেও শ্বাসকষ্ট। সেদিনই হাসপাতালে যান।'],
          v: ['স্বাভাবিক', 'একটু কম', 'কম', 'খুব কম'],
          cap: 'স্লাইডার সরিয়ে হিমোগ্লোবিন কমান, আর হৃৎপিণ্ডটা দেখুন। লোহিত কণিকা কম থাকলে শরীরের দরকারি অক্সিজেন পৌঁছাতে হৃৎপিণ্ডকে তাড়াতাড়ি চলতে হয়। ছবিতে কোনো আসল মাপ নেই।' }
      : { lbl: 'Move the slider: hemoglobin', lo: 'Normal', hi: 'Very low', blood: 'blood', heart: 'heart',
          s: ['Normal hemoglobin. Plenty of red cells carry the oxygen, and the heart keeps an easy pace.',
            'A little low. Each beat carries less oxygen, so the heart beats a little faster.',
            'Low. The heart pounds on the stairs, and you get breathless on small effort.',
            'Very low. The heart races and you are breathless even sitting still. Go to a hospital the same day.'],
          v: ['Normal', 'A little low', 'Low', 'Very low'],
          cap: 'Slide to lower the hemoglobin and watch the heart. With fewer red cells, the heart has to beat faster to deliver the oxygen the body needs. The drawing has no real numbers.' };
    const S = [[8, 1.15, 6], [6, 0.82, 4.6], [4, 0.6, 3.6], [2, 0.42, 2.8]].map(([n, b, f], i) => ({ n, b, f, t: t.s[i], v: t.v[i] }));
    let cells = '';
    const rank = [0, 4, 2, 6, 1, 5, 3, 7]; // cells disappear evenly along the vessel, not from one end
    for (let i = 0; i < 8; i++) cells += `<g class="hp-c" data-r="${rank.indexOf(i)}" transform="translate(34,74)"><g class="hp-mv" style="animation-delay:calc(var(--flow,6s) * -${(i / 8).toFixed(3)})">${cell(10.5)}</g></g>`;
    const heart = 'M300 98c-30-18-40-34-34-46 5-10 21-12 34 2 13-14 29-12 34-2 6 12-4 28-34 46z';
    const body =
      `<rect x="18" y="52" width="232" height="44" rx="22" fill="${C.vessel}"/>${cells}` +
      T(134, 40, t.blood, { size: 13, fill: C.muted, w: 600 }) +
      `<path d="M250 74h14" stroke="${C.vessel}" stroke-width="10" stroke-linecap="round"/>` +
      `<g class="hp-heart"><path d="${heart}" fill="${C.red}"/><path d="M285 62c4-5 10-6 14-3" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></g>` +
      T(300, 128, t.heart, { size: 13, fill: C.muted, w: 600 });
    const svgx = `<svg class="figsvg" viewBox="0 0 360 140" role="img" aria-label="${attr(t.cap)}" font-family="inherit">` +
      `<style>.hp-heart{transform-box:fill-box;transform-origin:center;animation:hpbeat var(--beat,1.15s) ease-in-out infinite}@keyframes hpbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.15)}28%{transform:scale(1)}42%{transform:scale(1.08)}58%{transform:scale(1)}}` +
      `.hp-c{transition:opacity .7s}.hp-mv{animation:hpflow var(--flow,6s) linear infinite}@keyframes hpflow{0%{transform:translateX(0);opacity:0}8%{opacity:1}88%{opacity:1}100%{transform:translateX(196px);opacity:0}}` +
      `@media (prefers-reduced-motion:reduce){.hp-heart,.hp-mv{animation:none!important}.hp-mv{transform:translateX(calc(var(--i,0) * 1px))}}</style>${body}</svg>`;
    // Without the page script the cells would all sit at the start; give each a resting place for calm readers.
    const html = svgx.replace(/<g class="hp-mv" style="animation-delay:calc\(var\(--flow,6s\) \* -([0-9.]+)\)">/g,
      (m, k) => `<g class="hp-mv" style="--i:${Math.round(196 * (1 - +k))};animation-delay:calc(var(--flow,6s) * -${k})">`) +
      `<div class="hp-ctl"><label class="lbl" for="hp-${l}">${esc(t.lbl)}</label>` +
      `<input id="hp-${l}" type="range" min="0" max="3" step="1" value="0" aria-valuetext="${attr(t.v[0])}">` +
      `<div class="hp-ends" aria-hidden="true"><span>${esc(t.lo)}</span><span>${esc(t.hi)}</span></div>` +
      `<p class="hp-say" aria-live="polite">${esc(t.s[0])}</p></div>`;
    return { cap: t.cap, cls: 'hp', data: { s: JSON.stringify(S) }, html };
  },

  // Anaemia, heart and nerves: tap the signs you have noticed; the list goes to the doctor, not to a verdict.
  'signs-check'(l) {
    const t = l === 'bn'
      ? { h: 'ডাক্তার দেখানোর আগে', sub: 'যেগুলো টের পেয়েছেন, সেগুলোয় চাপ দিন।',
          g: [['বুক আর শ্বাস', ['বুক ধড়ফড়', 'অল্প পরিশ্রমেই হাঁফ ধরা', 'উঠে দাঁড়ালে মাথা ঘোরা', 'সব সময় ক্লান্ত লাগা']],
            ['নার্ভ', ['হাতে-পায়ে ঝিনঝিন বা অবশ ভাব', 'টলমল করে হাঁটা', 'ভুলে যাওয়া, মন খারাপ থাকা']],
            ['আরও কিছু লক্ষণ', ['ফ্যাকাশে দেখানো', 'কানে ভোঁ ভোঁ শব্দ', 'রাতে পায়ে টান বা পা অস্থির', 'শীত শীত করা, হাত-পা ঠান্ডা', 'জিভে বা ঠোঁটের কোণে ঘা', 'বারবার মাথাব্যথা', 'চুল ওঠা, নখ ভেঙে যাওয়া', 'বরফ, মাটি বা চক খেতে ইচ্ছে', 'খাবার গিলতে অসুবিধা']]],
          red: ['আজ এর কোনোটা হচ্ছে?', ['বুকে ব্যথা', 'বসে থাকলেও শ্বাসকষ্ট', 'অজ্ঞান হয়ে যাওয়া', 'হঠাৎ মুখ, হাত বা শরীরের এক দিক দুর্বল']],
          none: 'এখনও কিছু বাছেননি।',
          many: 'আপনি {n}টা লক্ষণ টের পেয়েছেন। এই তালিকা দেখে অ্যানিমিয়া আছে কিনা বলা যায় না, সেটা বোঝা যায় রক্ত পরীক্ষায়। তালিকাটা ডাক্তারবাবুকে দেখান।',
          warn: 'আজই হাসপাতালে যান। অ্যাপয়েন্টমেন্টের জন্য অপেক্ষা করবেন না।',
          share: 'তালিকাটা পাঠান (হোয়াটসঅ্যাপ বা অন্য কোথাও)', copied: 'তালিকা কপি হয়েছে',
          head: 'আমি যে লক্ষণগুলো টের পেয়েছি:', ask: 'ডাক্তারবাবুকে জিজ্ঞেস করব: এটা কি অ্যানিমিয়া হতে পারে? একটা রক্ত পরীক্ষা করা যায়?',
          cap: 'তালিকাটা ডাক্তারবাবুর কাছে নিয়ে যান। আপনি নিজে না পাঠালে কিছুই কোথাও জমা থাকে না বা যায় না।' }
      : { h: 'Before you see your doctor', sub: 'Tap the ones you have noticed.',
          g: [['Heart and breath', ['A racing or pounding heart', 'Breathless on small effort', 'Dizzy when you stand up', 'Tired all the time']],
            ['Nerves', ['Pins and needles or numbness', 'Unsteady walking', 'Forgetting things, low mood']],
            ['Other signs', ['Looking pale', 'Ringing in the ears', 'Cramps or restless legs at night', 'Feeling cold, cold hands and feet', 'Sore tongue or mouth corners', 'Headaches that keep coming back', 'Hair fall, nails that break', 'Craving ice, clay or chalk', 'Trouble swallowing']]],
          red: ['Any of these today?', ['Chest pain', 'Breathless even sitting still', 'Fainting', 'Sudden weakness of the face, an arm or one side']],
          none: 'Nothing ticked yet.',
          many: 'You have noticed {n}. A list like this cannot tell you whether you have anaemia. A blood count can. Show this list to your doctor.',
          warn: 'Go to a hospital today. Do not wait for an appointment.',
          share: 'Send this list (WhatsApp or anywhere)', copied: 'List copied',
          head: 'Signs I have noticed:', ask: 'I want to ask my doctor: could this be anaemia, and can we do a blood count?',
          cap: 'Take this list to your doctor. Nothing you tap is saved or sent anywhere unless you send it.' };
    const group = (k, items, red) => `<div class="chk-g${red ? ' red' : ''}"><p class="k">${esc(k)}</p><div class="chk-l">` +
      items.map((x) => btn(`chk-i${red ? ' red' : ''}`, x, ' aria-pressed="false"')).join('') + '</div></div>';
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p>` +
      t.g.map(([k, items]) => group(k, items, false)).join('') + group(t.red[0], t.red[1], true) +
      `<div class="chk-out"><p class="chk-warn" hidden>${esc(t.warn)}</p><p class="chk-msg" aria-live="polite">${esc(t.none)}</p>` +
      `${btn('chk-share', t.share, ' hidden')}</div>`;
    return { cap: t.cap, cls: 'chk', data: { none: t.none, many: t.many, head: t.head, ask: t.ask, copied: t.copied }, html };
  },

  // Anaemia in children: four things families call a bad habit or naughtiness; each card turns over.
  'habit-or-sign'(l) {
    const ic = {
      pot: `<path d="M9 22h22l-3 13H12z" fill="${C.amber}"/><path d="M20 22c-1-6-4-9-9-10 1 6 4 9 9 10zM20 22c1-7 4-11 9-12-1 6-4 10-9 12z" fill="${C.teal2}"/>`,
      tear: `<circle cx="20" cy="21" r="13" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><path d="M14 18h3M23 18h3" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/><path d="M15 28c3-3 7-3 10 0" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/><path d="M15 21c0 0-2 3-2 4a2 2 0 0 0 4 0c0-1-2-4-2-4z" fill="${C.o2}"/>`,
      book: `<path d="M6 12c5-2 10-2 14 1 4-3 9-3 14-1v20c-5-2-10-2-14 1-4-3-9-3-14-1z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2" stroke-linejoin="round"/><path d="M20 13v20" stroke="${C.teal2}" stroke-width="2"/><path d="M27 6c2 1 3 3 2 5M31 4c3 2 4 5 3 8" fill="none" stroke="${C.muted}" stroke-width="1.8" stroke-linecap="round"/>`,
      bolt: `<path d="M23 4L10 22h8l-3 14 14-19h-8z" fill="${C.red}"/>`,
    };
    const t = l === 'bn'
      ? { h: 'অভ্যাস, না লক্ষণ?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'হতে পারে আয়রনের অভাব',
          c: [['pot', 'মাটি আর পলেস্তারা খায়', 'বদ অভ্যাস?', 'সপ্তাহের পর সপ্তাহ মাটি, চক বা পলেস্তারা খাওয়াকে বলে পাইকা। এর পিছনে আয়রনের অভাব থাকতে পারে।'],
            ['tear', 'সারাদিন ঘ্যানঘ্যান, শুধু কোলে উঠতে চায়', 'আদুরে?', 'আয়রন কম থাকলে বাচ্চা ক্লান্ত আর খিটখিটে থাকতে পারে।'],
            ['book', 'ক্লাসে অন্যমনস্ক থাকে', 'ফাঁকিবাজ?', 'আয়রন কম থাকলে মন বসাতে আর শিখতে অসুবিধা হতে পারে।'],
            ['bolt', 'অল্পেই রেগে যায়', 'দুষ্টু?', 'আয়রন কম থাকলে বাচ্চা খিটখিটে হতে পারে, অল্পেই রেগে যেতে পারে।']],
          cap: 'এগুলোর প্রত্যেকটার অন্য কারণও থাকতে পারে। আয়রনের অভাব তার একটা কিনা, রক্ত পরীক্ষায় বোঝা যায়।' }
      : { h: 'Habit, or a sign?', sub: 'Tap a card to turn it over.', sign: 'It can be low iron',
          c: [['pot', 'She eats mud and plaster', 'A bad habit?', 'Eating mud, chalk or plaster for weeks is called pica. Low iron can be behind it.'],
            ['tear', 'She whines all day and wants to be carried', 'Spoilt?', 'A child short of iron can be tired and irritable.'],
            ['book', 'He drifts off in class', 'Lazy?', 'Low iron can make it hard to pay attention and to learn.'],
            ['bolt', 'He flares up at small things', 'Naughty?', 'Low iron can make a child irritable and quick to anger.']],
          cap: 'Each of these has other causes too. A blood count shows whether low iron is one of them.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },

  // Anaemia in children: the iron a baby is born with runs down while a growing child keeps needing it; food fills the gap.
  'iron-gap'(l) {
    const t = l === 'bn'
      ? { store: 'জন্মের সময় জমানো আয়রন', need: 'বড় হতে যতটা আয়রন লাগে', x: ['জন্ম', 'প্রথম জন্মদিন', 'দ্বিতীয় জন্মদিন'],
          milk: 'শুধু দুধ', food: 'দুধ আর বাড়ির খাবার', short: 'আয়রন কম পড়ছে', fill: 'খাবারে ফাঁক ভরছে',
          cap: 'জন্মের সময়ের জমানো আয়রন বাচ্চা ধীরে ধীরে খরচ করে ফেলে, অথচ বড় হতে আয়রন লেগেই চলে। মাঝের ফাঁকটা ভরাতে হয় খাবার দিয়ে। দুটো বোতাম চেপে দেখুন। ছবিতে কোনো আসল মাপ নেই।' }
      : { store: 'iron stored at birth', need: 'iron a growing child needs', x: ['birth', 'first birthday', 'second birthday'],
          milk: 'Mostly milk', food: 'Milk and family food', short: 'Iron runs short', fill: 'Food fills the gap',
          cap: 'A baby slowly uses up the iron it was born with, while a growing child keeps needing more. Food has to fill the gap. Tap the two buttons. The drawing has no real numbers.' };
    const store = bez([40, 62], [95, 70], [135, 150], [200, 182]).concat([[340, 188]]);
    const need = bez([40, 132], [110, 124], [160, 96], [210, 90]).concat([[340, 86]]);
    let x0 = 40; for (let x = 40; x <= 340; x++) { if (yAt(store, x) >= yAt(need, x)) { x0 = x; break; } }
    const xs = []; for (let x = x0; x <= 340; x += 5) xs.push(x);
    const top = xs.map((x) => [x, yAt(need, x)]), bot = xs.map((x) => [x, yAt(store, x)]).reverse();
    const poly = top.concat(bot).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const d = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
    const bowl = (x, y) => `<g transform="translate(${x},${y})"><path d="M-14 0h28a14 12 0 0 1-28 0z" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><path d="M-11 -3c4-5 7-1 11-4s7 2 11-1" fill="none" stroke="${C.amber}" stroke-width="3" stroke-linecap="round"/><circle cx="7" cy="-6" r="3" fill="${C.teal2}"/></g>`;
    const bottle = (x, y) => `<g transform="translate(${x},${y})"><rect x="-7" y="-14" width="14" height="24" rx="5" fill="#fff" stroke="${C.muted}" stroke-width="2"/><rect x="-4" y="-20" width="8" height="7" rx="3" fill="${C.amber}"/><rect x="-5" y="-4" width="10" height="12" rx="3" fill="${C.amberBg}"/></g>`;
    const mid = Math.round((x0 + 340) / 2);
    const body =
      `<path d="M40 204h300" stroke="${C.mintLine}" stroke-width="2"/>` +
      [40, 190, 340].map((x, i) => `<path d="M${x} 200v8" stroke="${C.mintLine}" stroke-width="2"/>` + T(x, 226, t.x[i], { a: i === 0 ? 'start' : i === 2 ? 'end' : 'middle', size: 12.5, fill: C.muted })).join('') +
      `<polygon class="ig-gap ig-short" points="${poly}" fill="${C.roseBg}" stroke="${C.rose}" stroke-width="1.5" stroke-dasharray="5 4"/>` +
      `<polygon class="ig-gap ig-full" points="${poly}" fill="${C.mint}"/>` +
      `<path class="ig-line" pathLength="1" d="${d(store)}" fill="none" stroke="${C.teal}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path class="ig-line" pathLength="1" d="${d(need)}" fill="none" stroke="${C.red}" stroke-width="3.4" stroke-linecap="round"/>` +
      T(46, 48, t.store, { a: 'start', size: 13, fill: C.teal, w: 600 }) +
      T(340, 72, t.need, { a: 'end', size: 13, fill: C.red, w: 600 }) +
      `<g class="ig-short">${bottle(mid - 12, 122)}${bottle(mid + 10, 124)}${T(mid, 158, t.short, { size: 13, fill: C.red, w: 700 })}</g>` +
      `<g class="ig-full">${bowl(mid - 22, 124)}${bowl(mid + 18, 128)}${bottle(mid, 112)}${T(mid, 158, t.fill, { size: 13, fill: C.teal2, w: 700 })}</g>`;
    const svgx = `<svg class="figsvg" viewBox="0 0 360 236" role="img" aria-label="${attr(t.cap)}" font-family="inherit">` +
      `<style>.ig-line{stroke-dasharray:1;stroke-dashoffset:1;animation:igdraw 2.4s ease-out .3s forwards}@keyframes igdraw{to{stroke-dashoffset:0}}.ig-gap,.ig-short,.ig-full{transition:opacity .6s}` +
      `@media (prefers-reduced-motion:reduce){.ig-line{animation:none;stroke-dashoffset:0}}</style>${body}</svg>`;
    const html = svgx + `<div class="seg" role="group">${btn('gap-b', t.milk, ' data-m="milk" aria-pressed="true"')}${btn('gap-b', t.food, ' data-m="food" aria-pressed="false"')}</div>`;
    return { cap: t.cap, cls: 'gap', data: { mode: 'milk' }, html };
  },

  // Thalassemia, how it runs in families: each tap is one pregnancy; one copy comes from each parent by chance.
  'baby-chance'(l) {
    const t = l === 'bn'
      ? { h: 'এই বাচ্চাটা কী পাবে?', both: 'দুজনেই বাহক', one: 'শুধু মা বাহক', go: 'পরের বাচ্চা', again: 'আবার শুরু',
          mum: 'মা', dad: 'বাবা', kid: 'বাচ্চা', car: 'বাহক', non: 'বাহক নন',
          r: { ok: 'সুস্থ, বাহকও নয়', car: 'বাহক, সুস্থ', maj: 'থ্যালাসেমিয়া মেজর' },
          say: { start: 'প্রতিবার চাপ দেওয়া মানে একটা গর্ভধারণ।',
            ok: 'এই বাচ্চা দুটো ঠিক নকশাই পেয়েছে, তাই সে সুস্থ, বাহকও নয়।',
            car: 'এই বাচ্চা একটা ভুল নকশা পেয়েছে, তাই সে বাহক, কিন্তু সুস্থ।',
            maj: 'এই বাচ্চা মা আর বাবা দুজনের কাছ থেকেই ভুল নকশা পেয়েছে, তাই তার থ্যালাসেমিয়া মেজর। সারা জীবনের জন্য রক্ত নিতে হবে।' },
          nb: 'প্রতিটা গর্ভধারণে ৪ ভাগের ১ ভাগ সম্ভাবনা আবার নতুন করে শুরু হয়, আগে যা-ই হয়ে থাকুক।',
          no: 'বাবার কোনো ভুল নকশা নেই, তাই কোনো বাচ্চা দুটো ভুল নকশা পাবে না।',
          so: 'এ পর্যন্ত',
          cap: 'প্রতিটা বাচ্চা মায়ের কাছ থেকে একটা আর বাবার কাছ থেকে একটা নকশা পায়, পুরোটাই ভাগ্যের উপর। যতবার খুশি চাপুন। একটা পরিবারে বাচ্চা কম, তাই ৪ ভাগের ১ ভাগ হিসেবটা সব সময় মেলে না। পরপর দুটো বাচ্চার থ্যালাসেমিয়া মেজর হতে পারে, আবার একটারও না হতে পারে।' }
      : { h: 'What will this baby get?', both: 'Both are carriers', one: 'Only the mother is a carrier', go: 'Next baby', again: 'Start again',
          mum: 'Mother', dad: 'Father', kid: 'Baby', car: 'carrier', non: 'not a carrier',
          r: { ok: 'Healthy, not a carrier', car: 'Carrier, healthy', maj: 'Thalassemia major' },
          say: { start: 'Each tap is one pregnancy.',
            ok: 'This baby got two working copies, so it is healthy and not a carrier.',
            car: 'This baby got one faulty copy, so it is a carrier, and healthy.',
            maj: 'This baby got the faulty copy from both parents, so it has thalassemia major and will need blood transfusions for life.' },
          nb: 'The 1 in 4 chance starts again with every pregnancy, whatever happened before.',
          no: 'The father has no faulty copy to pass on, so no baby can get two.',
          so: 'So far',
          cap: 'Each baby gets one copy from the mother and one from the father, purely by chance. Tap as many times as you like. A real family has too few children to show 1 in 4 neatly. Two affected children in a row can happen, and so can none.' };
    const s = 1.15;
    const slot = (x, y, side) => `<rect class="bc-empty" x="${x - 11}" y="${y - 17}" width="22" height="34" rx="6" fill="none" stroke="${C.mintLine}" stroke-width="2" stroke-dasharray="4 3"/>` +
      copy(x, y, 'ok', s, `bc-c${side}-ok`) + copy(x, y, 'beta', s, `bc-c${side}-beta`);
    const ring = (x, y, cls) => `<rect class="${cls}" x="${x - 15}" y="${y - 21}" width="30" height="42" rx="9" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/>`;
    const path = (x1, y1, x2, y2, cls) => `<path class="bc-p ${cls}" pathLength="1" d="M${x1} ${y1 + 20}C${x1} ${y1 + 62} ${x2} ${y2 - 62} ${x2} ${y2 - 20}" fill="none" stroke="${C.amber}" stroke-width="2.6" stroke-linecap="round"/>`;
    const M = 95, F = 265, K = 180, PY = 112, KY = 214, d = 13;
    const body =
      person(M, 34, .9) + T(M, 70, t.mum, { size: 13.5, w: 700, fill: C.teal }) + T(M, 85, t.car, { size: 12.5, fill: C.muted }) +
      person(F, 34, .9) + T(F, 70, t.dad, { size: 13.5, w: 700, fill: C.teal }) +
      `<g class="bc-fb">${T(F, 85, t.car, { size: 12.5, fill: C.muted })}</g><g class="bc-fo">${T(F, 85, t.non, { size: 12.5, fill: C.muted })}</g>` +
      ring(M - d, PY, 'bc-r bc-rm0') + ring(M + d, PY, 'bc-r bc-rm1') + ring(F - d, PY, 'bc-r bc-rf0') + ring(F + d, PY, 'bc-r bc-rf1') +
      copy(M - d, PY, 'ok', s) + copy(M + d, PY, 'beta', s) + copy(F - d, PY, 'ok', s) +
      copy(F + d, PY, 'beta', s, 'bc-fb') + copy(F + d, PY, 'ok', s, 'bc-fo') +
      path(M - d, PY, K - d, KY, 'bc-pm0') + path(M + d, PY, K - d, KY, 'bc-pm1') + path(F - d, PY, K + d, KY, 'bc-pf0') + path(F + d, PY, K + d, KY, 'bc-pf1') +
      person(K, 172, .72) +
      slot(K - d, KY, 'l') + slot(K + d, KY, 'r') +
      ['ok', 'car', 'maj'].map((k) => `<g class="bc-t bc-t-${k}">${T(K, 252, t.r[k], { size: 14, w: 700, fill: k === 'maj' ? C.red : C.teal2 })}</g>`).join('');
    const svgx = `<svg class="figsvg" viewBox="0 0 360 262" role="img" aria-label="${attr(t.cap)}" font-family="inherit"><style>` +
      `.bc-r,.bc-p,.bc-cl-ok,.bc-cl-beta,.bc-cr-ok,.bc-cr-beta,.bc-t,.bc-fo{display:none}` +
      `.baby[data-mode=one] .bc-fb{display:none}.baby[data-mode=one] .bc-fo{display:inline}` +
      `.baby[data-pm="0"] .bc-rm0,.baby[data-pm="1"] .bc-rm1,.baby[data-pf="0"] .bc-rf0,.baby[data-pf="1"] .bc-rf1{display:inline;animation:bcin .35s ease-out both}` +
      `.baby[data-pm="0"] .bc-pm0,.baby[data-pm="1"] .bc-pm1,.baby[data-pf="0"] .bc-pf0,.baby[data-pf="1"] .bc-pf1{display:inline;stroke-dasharray:1;stroke-dashoffset:1;animation:bcdraw .7s ease-in-out .25s forwards}` +
      `.baby[data-cl=ok] .bc-cl-ok,.baby[data-cl=beta] .bc-cl-beta,.baby[data-cr=ok] .bc-cr-ok,.baby[data-cr=beta] .bc-cr-beta{display:inline;animation:bcin .4s ease-out both}` +
      `.baby[data-cl] .bc-empty{display:none}.baby[data-kid=ok] .bc-t-ok,.baby[data-kid=car] .bc-t-car,.baby[data-kid=maj] .bc-t-maj{display:inline;animation:bcin .4s ease-out both}` +
      `@keyframes bcin{from{opacity:0}to{opacity:1}}@keyframes bcdraw{to{stroke-dashoffset:0}}` +
      `@media (prefers-reduced-motion:reduce){.baby *{animation:none!important}.baby .bc-p{stroke-dashoffset:0!important}}</style>${body}</svg>`;
    const leg = ['ok', 'car', 'maj'].map((k) => `<span class="bc-leg bc-${k}"><i></i>${esc(t.r[k])}: <b data-k="${k}">${l === 'bn' ? '০' : '0'}</b></span>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p>` +
      `<div class="seg" role="group">${btn('bc-m', t.both, ' data-m="both" aria-pressed="true"')}${btn('bc-m', t.one, ' data-m="one" aria-pressed="false"')}</div>` +
      svgx +
      `<p class="bc-say" aria-live="polite">${esc(t.say.start)}</p>` +
      `<div class="bc-ctl">${btn('bc-go', t.go)}${btn('bc-again', t.again)}</div>` +
      `<div class="bc-sofar"><span class="k">${esc(t.so)}</span><span class="bc-dots" aria-hidden="true"></span><span class="bc-legs">${leg}</span></div>` +
      `<p class="bc-note bc-nb">${esc(t.nb)}</p><p class="bc-note bc-no">${esc(t.no)}</p>`;
    return { cap: t.cap, cls: 'baby', data: { mode: 'both', start: t.say.start, ok: t.say.ok, car: t.say.car, maj: t.say.maj }, html };
  },

  // Anaemia, the basics: the same low report in three people from the chapter; tap one to see why, and what iron does.
  'three-reasons'(l) {
    const t = l === 'bn'
      ? { h: 'একই রিপোর্ট, তিনটে আলাদা কারণ', sub: 'কার হিমোগ্লোবিন কেন কম, দেখতে একজনের উপর চাপ দিন।', rep: 'রিপোর্ট', hb: 'হিমোগ্লোবিন', low: 'কম',
          rows: ['কেন কম', 'ডাক্তারবাবু কী করেন', 'শুধু আয়রন টনিক খেলে'], pick: 'উপরে একজনকে বেছে নিন।',
          p: [['তিনতলার সেই মহিলা', 'বছরের পর বছর মাসিকে বেশি রক্ত যাওয়া, সবার শেষে অল্প খাওয়া, আর খাওয়ার সঙ্গে চা।', 'মাসিকের কথা জিজ্ঞেস করেন, আয়রন দেন, আর রক্ত যাওয়ার চিকিৎসা করেন।', 'কাজে লাগে, কিন্তু রক্ত যাওয়ারও চিকিৎসা দরকার।', 'part'],
            ['অবসরপ্রাপ্ত ভদ্রলোক', 'চোখের আড়ালে অল্প অল্প রক্ত যাওয়া, সাধারণত পাকস্থলী বা অন্ত্র থেকে, যেমন আলসার, পাইলস, বা বছরের পর বছর খাওয়া ব্যথার ওষুধ। কম ক্ষেত্রে সেটা টিউমার।', 'রক্ত কোথা থেকে যাচ্ছে, খুঁজে বার করতে পরীক্ষা করান।', 'সংখ্যাটা বাড়িয়ে দেয়, আর রক্ত যাওয়াটা আড়াল করে।', 'bad'],
            ['টনিক খাওয়া মেয়েটি', 'হয়তো তিনি থ্যালাসেমিয়া বা হিমোগ্লোবিন ই এর বাহক। লোহিত কণিকা ছোট, হিমোগ্লোবিন বরাবর একটু কম।', 'একটা বিশেষ রক্ত পরীক্ষা করান, যাতে আয়রনের অভাব থেকে এটাকে আলাদা করে চেনা যায়।', 'কোনো কাজ করে না।', 'none']],
          cap: 'তিনজনের রিপোর্টেই একই কথা লেখা। হিমোগ্লোবিন কেন কমল, তার উপরই নির্ভর করে কী কাজে লাগবে। সেটা জানতে লাগে ডাক্তার আর রক্ত পরীক্ষা।' }
      : { h: 'One report, three reasons', sub: 'Tap a person to see why their hemoglobin is low.', rep: 'Report', hb: 'Hemoglobin', low: 'Low',
          rows: ['Why it is low', 'What the doctor does', 'An iron tonic on its own'], pick: 'Choose a person above.',
          p: [['The woman on the third floor', 'Heavy periods for years, meals eaten last and little, and tea with food.', 'Asks about her periods, gives iron, and treats the bleeding.', 'Helps, but the bleeding has to be treated too.', 'part'],
            ['The retired man', 'Slow bleeding he cannot see, usually from the stomach or bowel, such as an ulcer, piles, or years of painkillers. Less often, it is a growth.', 'Sends him for tests to find where the blood is going.', 'Pushes the number up and hides the bleeding.', 'bad'],
            ['The young woman on tonics', 'She may be a carrier of thalassemia or hemoglobin E. Her red cells are small and her hemoglobin runs a little low.', 'Orders one particular blood test that tells it apart from low iron.', 'Does nothing for it.', 'none']],
          cap: 'All three reports say the same word. Why the hemoglobin fell decides what helps, and finding out takes a doctor and a blood test.' };
    const face = [
      `${person(26, 32, .95)}<circle cx="26" cy="5" r="6" fill="${C.teal}"/>`,
      `${person(26, 32, .95)}<g fill="none" stroke="#fff" stroke-width="1.8"><circle cx="21.5" cy="18.5" r="3.4"/><circle cx="30.5" cy="18.5" r="3.4"/><path d="M25 18.5h2"/></g>`,
      `<path d="M13.5 20c0-10 5.5-15 12.5-15s12.5 5 12.5 15v15h-25z" fill="${C.teal2}"/>${person(26, 32, .95)}<rect x="36" y="30" width="9" height="13" rx="2.5" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="1.6"/>`,
    ];
    const badge = { part: ['#FFF1DC', '#9A5A0C'], bad: ['#FDEDEE', '#B4202E'], none: ['#EEF0EF', '#3E4A48'] };
    const report = `<svg class="tr-rep" viewBox="0 0 300 66" aria-hidden="true" font-family="inherit"><rect x="1" y="1" width="298" height="64" rx="14" fill="#fff" stroke="${C.mintLine}" stroke-width="1.5"/>` +
      T(18, 24, t.rep, { a: 'start', size: 12.5, fill: C.muted, w: 600 }) + `<path d="M18 34h120M18 44h90" stroke="${C.mintLine}" stroke-width="3" stroke-linecap="round" opacity=".7"/>` +
      T(160, 42, t.hb, { a: 'start', size: 14, w: 700, fill: C.ink }) +
      `<rect x="232" y="24" width="56" height="26" rx="13" fill="${C.roseBg}" stroke="${C.red}" stroke-width="1.5"/>` + T(252, 42, t.low, { size: 13.5, w: 700, fill: C.red }) +
      `<path d="M272 31v11M268 38l4 4 4-4" fill="none" stroke="${C.red}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${face[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl>` +
      `<dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd>` +
      `<dt>${esc(t.rows[2])}</dt><dd><span class="tr-badge" style="background:${badge[x[4]][0]};color:${badge[x[4]][1]}">${esc(x[3])}</span></dd></dl></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p>${report}<div class="tr-tabs">${tabs}</div>` +
      `<div class="tr-out" aria-live="polite"><p class="tr-pick">${esc(t.pick)}</p>${panels}</div>`;
    return { cap: t.cap, cls: 'tr', html };
  },

  // Thalassemia, the basics: "telling the two apart". Eight lines from the chapter; the reader sorts each into carrier or major.
  'trait-or-major'(l) {
    const t = l === 'bn'
      ? { h: 'বাহক, না থ্যালাসেমিয়া মেজর?', sub: 'প্রতিটা কথা কার, চাপ দিয়ে বলুন।', a: 'বাহক (ট্রেট)', b: 'থ্যালাসেমিয়া মেজর',
          right: 'ঠিক', wrong: 'এটা আসলে', next: 'পরেরটা', again: 'আবার খেলুন', of: '{i} / {n}',
          end: '{n}টার মধ্যে {k}টা ঠিক হয়েছে।', endnote: 'যেটাই আপনার গল্পের কাছাকাছি হোক, রিপোর্টগুলো নিয়ে একজন হেমাটোলজিস্টের কাছে যান।',
          q: [['একদম সুস্থ বোধ করেন, কাজে কামাই প্রায় নেই', 'a', 'বাহক আর পাঁচজনের মতোই সুস্থ।'],
            ['কয়েক সপ্তাহ অন্তর রক্ত নিতে হয়', 'b', 'শরীর যে হিমোগ্লোবিন বানাতে পারে না, রক্ত সেটা জুগিয়ে দেয়।'],
            ['এর জন্য কোনো চিকিৎসা লাগে না', 'a', 'আয়রনের ওষুধও লাগে না, যদি না পরীক্ষায় সত্যিই আয়রন কম আসে।'],
            ['রোজ আয়রন বের করার ওষুধ খেতে হয়', 'b', 'প্রতি ব্যাগ রক্ত একটু করে আয়রন রেখে যায়। চিলেশনের ওষুধ সেটা বের করে।'],
            ['দুধ খেতে খেতে ক্লান্ত হয়ে পড়ে, মুখ ফ্যাকাশে, এমন একটা ছোট্ট বাচ্চা', 'b', 'টনিকে কাজ হয় না। দরকার রক্ত পরীক্ষা আর একজন হেমাটোলজিস্ট, দেরি না করে।'],
            ['বিয়ের আগে হবু স্বামী বা স্ত্রীর পরীক্ষা করানো দরকার', 'a', 'দুজনেই বাহক হলে প্রতিবার গর্ভধারণে ৪ ভাগের ১ ভাগ সম্ভাবনা থাকে যে বাচ্চার থ্যালাসেমিয়া মেজর হবে।'],
            ['কিছু বাচ্চা বোন ম্যারো ট্রান্সপ্লান্টে সেরে উঠতে পারে', 'b', 'ছোটবেলাতেই এটা ভেবে দেখা ভালো, তাই রোগ ধরা পড়ার পরই জিজ্ঞেস করুন।'],
            ['পরে কোনোদিন থ্যালাসেমিয়ার রোগী হয়ে যাবেন না', 'a', 'বাহক সারা জীবন বাহকই থাকেন।']],
          cap: 'দুজনের রিপোর্টেই থ্যালাসেমিয়া শব্দটা আছে, অথচ একজন সুস্থ আর অন্যজনের হাতে সময় নেই। এই খেলাটা শুধু চিনতে শেখায়, রোগ ঠিক করে ডাক্তার আর রক্ত পরীক্ষা।' }
      : { h: 'Carrier, or thalassemia major?', sub: 'Tap who each line is about.', a: 'Carrier (trait)', b: 'Thalassemia major',
          right: 'Right', wrong: 'This one is', next: 'Next', again: 'Play again', of: '{i} of {n}',
          end: 'You sorted {k} of {n} correctly.', endnote: 'Whichever story is closer to yours, take your reports to a hematologist.',
          q: [['Feels perfectly well and hardly misses a day of work', 'a', 'A carrier is as healthy as anyone else.'],
            ['Needs a blood transfusion every few weeks', 'b', 'The blood gives the hemoglobin the body cannot make.'],
            ['Needs no treatment for it', 'a', 'Iron tablets are not needed either, unless a test shows iron is truly low.'],
            ['Takes a medicine every day to remove iron', 'b', 'Each bag of blood leaves a little iron behind. Chelation removes it.'],
            ['A baby who tires halfway through a feed and looks pale', 'b', 'Tonics will not help. The baby needs a blood test and a hematologist, without delay.'],
            ['Should get the partner tested before the wedding', 'a', 'If both are carriers, every pregnancy has a 1 in 4 chance that the baby will have thalassemia major.'],
            ['Some children can be cured with a bone marrow transplant', 'b', 'It is best considered early in childhood, so ask soon after the diagnosis.'],
            ['Will not turn into a thalassemia patient later', 'a', 'A carrier stays a carrier for life.']],
          cap: 'Both reports say thalassemia, yet one person is healthy and the other has no time to lose. This game helps you tell them apart; only a doctor and a blood test can say which is yours.' };
    const n = t.q.length, nn = l === 'bn' ? bnDigits(n) : String(n);
    const cards = t.q.map(([line, ans, why], i) => `<div class="tm-card" data-ans="${ans}"${i ? ' hidden' : ''}>` +
      `<p class="tm-n">${esc(t.of.replace('{i}', l === 'bn' ? bnDigits(i + 1) : String(i + 1)).replace('{n}', nn))}</p>` +
      `<p class="tm-q">${esc(line)}</p>` +
      `<div class="tm-ch">${btn('tm-a', t.a, ' data-c="a"')}${btn('tm-b', t.b, ' data-c="b"')}</div>` +
      `<div class="tm-fb" hidden><p class="tm-v"></p><p class="tm-why">${esc(why)}</p>${btn('tm-next', t.next)}</div></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p>` +
      `<div class="tm-dots" aria-hidden="true">${t.q.map(() => '<i></i>').join('')}</div>${cards}` +
      `<div class="tm-end" hidden><p class="tm-score" aria-live="polite"></p><p class="tm-endnote">${esc(t.endnote)}</p>${btn('tm-again', t.again)}</div>`;
    return { cap: t.cap, cls: 'tm', data: { a: t.a, b: t.b, right: t.right, wrong: t.wrong, end: t.end, n: nn }, html };
  },
};

export const FIGURE_NAMES = Object.keys(FIG).concat(Object.keys(TRY));
export function figure(name, l) {
  if (TRY[name]) {
    const { html, cap, cls, data = {} } = TRY[name](l);
    const da = Object.entries(data).map(([k, v]) => k === 'mode' ? ` data-mode="${attr(v)}"` : ` data-${k}="${attr(v)}"`).join('');
    return `<figure class="fig try ${cls}"${da}>${html}<figcaption>${esc(cap)}</figcaption></figure>`;
  }
  const f = FIG[name];
  if (!f) throw new Error(`[figure: ${name}] is not a known figure. Known: ${FIGURE_NAMES.join(', ')}`);
  const { svg: s, cap } = f(l);
  return `<figure class="fig">${s}<figcaption>${esc(cap)}</figcaption></figure>`;
}
