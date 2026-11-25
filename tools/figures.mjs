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

  // Thalassemia, why regular care matters: iron in the heart over the years. Kept low with the daily medicine and
  // yearly check-ups (a small rise caught at a check-up); climbing while the child still feels fine when doses are skipped.
  'quiet-iron'(l) {
    const t = l === 'bn'
      ? { y: 'হৃৎপিণ্ডে আয়রন', x: 'বছরের পর বছর', band: 'কষ্ট টের পাওয়া যায়', fine: 'এখনও দিব্যি আছে', cu: 'চেক-আপ',
          a: 'রোজ ওষুধ, নিয়মিত চেক-আপ', b: 'ওষুধ বাদ, চেক-আপ বাদ',
          cap: 'রক্তের সঙ্গে আসা আয়রন জমে নিঃশব্দে। রোজ ওষুধ আর প্রতি বছর চেক-আপ হলে আয়রন কম থাকে, আর একটু বাড়লেও গোড়াতেই ধরা পড়ে। ওষুধ বাদ পড়তে থাকলে বছরের পর বছর আয়রন বাড়ে, অথচ বাচ্চা তখনও দিব্যি আছে। ছবিতে কোনো আসল মাপ নেই।' }
      : { y: 'iron in the heart', x: 'years go by', band: 'trouble is felt', fine: 'still feels fine', cu: 'check-up',
          a: 'medicine daily, check-ups kept', b: 'doses skipped, check-ups missed',
          cap: 'Iron from transfusions builds up without a sound. With the medicine every day and a check-up every year, it stays low, and a rise is caught early. When doses are skipped, it climbs for years while the child still feels fine. The drawing has no real numbers.' };
    const face = (x, y, sad) => `<g transform="translate(${x},${y})"><circle r="8" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="1.6"/><circle cx="-2.8" cy="-1.6" r="1.1" fill="${C.ink}"/><circle cx="2.8" cy="-1.6" r="1.1" fill="${C.ink}"/>` +
      (sad ? `<path d="M-3 3.6c2-1.6 4-1.6 6 0" fill="none" stroke="${C.ink}" stroke-width="1.3" stroke-linecap="round"/>` : `<path d="M-3 2.2c2 2 4 2 6 0" fill="none" stroke="${C.ink}" stroke-width="1.3" stroke-linecap="round"/>`) + `</g>`;
    const tick = (x, y) => `<g class="qi-cu" transform="translate(${x},${y})"><circle r="6.5" fill="#fff" stroke="${C.teal2}" stroke-width="1.8"/><path d="M-3 0l2 2 4-4" fill="none" stroke="${C.teal2}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    const red = 'M40 186C120 172 200 126 332 64';
    const teal = 'M40 186L120 184C142 183 154 172 176 169C188 168 198 182 222 184L332 184';
    const body =
      `<rect x="40" y="40" width="292" height="40" rx="8" fill="${C.roseBg}"/>` + T(50, 64, t.band, { a: 'start', size: 12.5, fill: C.red, w: 600 }) +
      T(40, 30, t.y, { a: 'start', size: 13, fill: C.muted, w: 600 }) +
      `<path d="M40 200h292" stroke="${C.mintLine}" stroke-width="2"/><path d="M326 195l6 5-6 5" fill="none" stroke="${C.mintLine}" stroke-width="2" stroke-linecap="round"/>` +
      T(332, 218, t.x, { a: 'end', size: 12.5, fill: C.muted }) +
      `<path class="qi-line" pathLength="1" d="${teal}" fill="none" stroke="${C.teal2}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path class="qi-line" pathLength="1" d="${red}" fill="none" stroke="${C.red}" stroke-width="3.4" stroke-linecap="round"/>` +
      tick(80, 185) + tick(176, 169) + tick(262, 184) + T(176, 157, t.cu, { size: 12.5, fill: C.teal2, w: 600 }) +
      `<g class="qi-f">${face(118, 156, false)}${face(208, 120, false)}${face(300, 66, true)}</g>` +
      T(206, 145, t.fine, { a: 'start', size: 12.5, fill: '#9A5A0C', w: 600 }) +
      `<rect x="40" y="228" width="16" height="5" rx="2.5" fill="${C.teal2}"/>` + T(62, 234, t.a, { a: 'start', size: 12.5, fill: C.ink }) +
      `<rect x="40" y="246" width="16" height="5" rx="2.5" fill="${C.red}"/>` + T(62, 252, t.b, { a: 'start', size: 12.5, fill: C.ink });
    return {
      cap: t.cap,
      svg: svg('qi', 360, 262, t.cap,
        '.qi-line{stroke-dasharray:1;stroke-dashoffset:1;animation:qidraw 9s ease-in-out infinite}@keyframes qidraw{0%{stroke-dashoffset:1;opacity:1}55%,92%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}' +
        '.qi-f,.qi-cu{animation:qifade 9s ease-in-out infinite}@keyframes qifade{0%,20%{opacity:0}45%,92%{opacity:1}100%{opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.qi-line{stroke-dashoffset:0}.qi-f,.qi-cu{opacity:1}}',
        body),
    };
  },

  // Thalassemia, the iron medicine: two jars. Blood bags drip iron into both; the daily medicine (a tap) lets it out of
  // one, so its level stays low; with the tap closed the level of the other keeps rising.
  'iron-jar'(l) {
    const t = l === 'bn'
      ? { a: 'রোজ খাওয়া হলে', b: 'বন্ধ থাকলে', drip: 'রক্তের সঙ্গে আয়রন', tap: 'ওষুধ', iron: 'আয়রন',
          cap: 'প্রতিবার রক্তের সঙ্গে একটু করে আয়রন শরীরে জমা হয়। রোজের ওষুধ সেটা বের করে দেয়, তাই মাত্রা কম থাকে। ওষুধ বন্ধ থাকলে আয়রন আসতেই থাকে আর মাত্রা বাড়তে থাকে, অথচ বাচ্চা কিছুই টের পায় না। ছবিতে কোনো আসল মাপ নেই।' }
      : { a: 'taken every day', b: 'stopped', drip: 'iron from each transfusion', tap: 'medicine', iron: 'iron',
          cap: 'Every transfusion adds a little iron to the body. The daily medicine lets it out, so the level stays low. When the medicine stops, the iron keeps coming and the level rises, though the child feels nothing. The drawing has no real numbers.' };
    const bag = (x) => `<g transform="translate(${x},30)"><rect x="-13" y="-12" width="26" height="30" rx="7" fill="${C.red}"/><rect x="-7" y="-17" width="14" height="6" rx="2" fill="${C.rose}"/><path d="M0 18v8" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/></g>`;
    const drops = (x, to, cls) => [0, 1, 2].map((i) => `<circle class="${cls}" cx="${x}" cy="62" r="4" fill="${C.amber}" style="--to:${to}px;animation-delay:${(i * 0.9).toFixed(1)}s"/>`).join('');
    const jar = (x) => `<path d="M${x - 42} 76v86a14 14 0 0 0 14 14h56a14 14 0 0 0 14-14V76" fill="#fff" stroke="${C.mintLine}" stroke-width="2.5"/>`;
    const clip = (x, id) => `<clipPath id="${id}"><path d="M${x - 41} 77v85a13 13 0 0 0 13 13h56a13 13 0 0 0 13-13V77z"/></clipPath>`;
    const A = 95, B = 265;
    const body =
      `<defs>${clip(A, `ij-a-${l}`)}${clip(B, `ij-b-${l}`)}</defs>` +
      T(180, 14, t.drip, { size: 12.5, fill: C.muted, w: 600 }) +
      bag(A) + bag(B) + drops(A, 92, 'ij-d') + drops(B, 70, 'ij-d') +
      jar(A) + `<g clip-path="url(#ij-a-${l})"><rect x="${A - 45}" y="150" width="90" height="40" fill="${C.amberBg}"/><rect x="${A - 45}" y="150" width="90" height="4" fill="${C.amber}" opacity=".6"/></g>` +
      jar(B) + `<g clip-path="url(#ij-b-${l})"><g class="ij-rise"><rect x="${B - 45}" y="150" width="90" height="140" fill="${C.amberBg}"/><rect x="${B - 45}" y="150" width="90" height="4" fill="${C.amber}" opacity=".6"/></g></g>` +
      T(A, 166, t.iron, { size: 12.5, fill: '#9A5A0C', w: 600 }) + T(B, 166, t.iron, { size: 12.5, fill: '#9A5A0C', w: 600 }) +
      `<path d="M${A + 42} 160h14v10" fill="none" stroke="${C.teal2}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
      [0, 1].map((i) => `<circle class="ij-out" cx="${A + 56}" cy="176" r="3.5" fill="${C.amber}" style="animation-delay:${(i * 0.9).toFixed(1)}s"/>`).join('') +
      T(A + 60, 200, t.tap, { size: 12.5, fill: C.teal2, w: 600 }) +
      `<path d="M${B + 42} 160h14v10" fill="none" stroke="${C.muted}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>` +
      `<path d="M${B + 50} 179l8 8M${B + 58} 179l-8 8" stroke="${C.red}" stroke-width="2.4" stroke-linecap="round"/>` +
      T(B + 60, 202, t.tap, { size: 12.5, fill: C.muted, w: 600 }) +
      T(A, 222, t.a, { size: 13.5, fill: C.teal2, w: 700 }) + T(B, 222, t.b, { size: 13.5, fill: C.red, w: 700 });
    return {
      cap: t.cap,
      svg: svg('ij', 360, 232, t.cap,
        '.ij-d{animation:ijdrop 2.7s ease-in infinite;opacity:0}@keyframes ijdrop{0%{transform:translateY(0);opacity:0}10%{opacity:1}80%{opacity:1}100%{transform:translateY(var(--to));opacity:0}}' +
        '.ij-out{animation:ijout 1.8s ease-in infinite;opacity:0}@keyframes ijout{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(14px);opacity:0}}' +
        '.ij-rise{animation:ijrise 10s ease-in-out infinite}@keyframes ijrise{0%{transform:translateY(0)}85%,100%{transform:translateY(-62px)}}' +
        '@media (prefers-reduced-motion:reduce){.ij-d,.ij-out{animation:none;opacity:0}.ij-rise{animation:none;transform:translateY(-62px)}}',
        body),
    };
  },
  // Thalassemia, everyday life: a child walks a road past school, play, work and marriage, each lighting up in turn,
  // while a red line of regular care (transfusions and the iron medicine) keeps pace underneath the whole way.
  'growing-up'(l) {
    const t = l === 'bn'
      ? { m: ['স্কুল', 'খেলা', 'চাকরি', 'বিয়ে'], care: 'নিয়মিত রক্ত আর আয়রন বের করার ওষুধ, সারা পথ',
          cap: 'নিয়মিত রক্ত আর আয়রন বের করার ওষুধ সঙ্গে চললে থ্যালাসেমিয়ার অনেক বাচ্চা স্কুল, খেলা, চাকরি আর বিয়ের পথ পেরিয়ে বড় হয়। চিকিৎসা চলে সারা পথ জুড়ে। ছবিতে কোনো আসল বয়স বা মাপ নেই।' }
      : { m: ['School', 'Play', 'Work', 'Marriage'], care: 'regular transfusions and the iron medicine, all the way',
          cap: 'With regular transfusions and the iron medicine going alongside, many children with thalassemia grow up through school, play, work and marriage. The care keeps going the whole way. The drawing has no real ages or numbers.' };
    const icon = [
      `<rect x="-11" y="-8" width="22" height="21" rx="5" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><path d="M-5 -8v-3a5 5 0 0 1 10 0v3" fill="none" stroke="${C.amber}" stroke-width="2"/><rect x="-6" y="1" width="12" height="6" rx="2" fill="${C.amber}"/>`,
      `<g transform="rotate(35)"><rect x="-4" y="-15" width="8" height="21" rx="3" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><path d="M0 6v9" stroke="${C.teal2}" stroke-width="3" stroke-linecap="round"/></g><circle cx="-10" cy="-8" r="4" fill="${C.red}"/>`,
      `<rect x="-13" y="-5" width="26" height="18" rx="4" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M-5 -5v-4h10v4" fill="none" stroke="${C.teal2}" stroke-width="2"/><path d="M-13 3h26" stroke="${C.teal2}" stroke-width="2"/>`,
      `<circle cx="-5" cy="3" r="8" fill="none" stroke="${C.amber}" stroke-width="3"/><circle cx="6" cy="3" r="8" fill="none" stroke="${C.amber}" stroke-width="3"/><path d="M-5 -10l3 4-3 3-3-3z" fill="${C.o2}"/>`,
    ];
    const X0 = 45, X1 = 315, xs = [82, 160, 238, 312];
    const pc = (x) => +(((x - X0) / (X1 - X0)) * 88).toFixed(1);
    let keys = '';
    const stops = xs.map((x, i) => {
      const p = pc(x);
      keys += `@keyframes gu${i}{0%,${Math.max(0, p - 2)}%{opacity:.28}${p}%,94%{opacity:1}100%{opacity:.28}}.gu-m${i}{animation:gu${i} 11s ease-in-out infinite}`;
      return `<g class="gu-m${i}"><circle cx="${x}" cy="56" r="22" fill="#fff" stroke="${C.mintLine}" stroke-width="2"/><g transform="translate(${x},56)">${icon[i]}</g>` +
        `<circle cx="${x}" cy="122" r="6" fill="#fff" stroke="${C.teal2}" stroke-width="2.6"/>` + T(x, 148, t.m[i], { size: 13.5, fill: C.teal2, w: 700 }) + '</g>';
    }).join('');
    const body =
      `<path d="M${X0 - 15} 122H${X1 + 15}" stroke="${C.mint}" stroke-width="12" stroke-linecap="round"/>` + stops +
      `<g class="gu-w"><g transform="translate(${X0},104) scale(.5)">${person(0, 0, 1)}</g></g>` +
      `<g transform="translate(${X0 - 14},172)">${cell(6, false)}</g>` +
      `<path class="gu-c" pathLength="1" d="M${X0} 172H${X1 + 10}" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>` +
      T(180, 194, t.care, { size: 12.5, fill: C.muted, w: 600 });
    return {
      cap: t.cap,
      svg: svg('gu', 360, 204, t.cap,
        keys +
        '.gu-w{animation:guw 11s linear infinite}@keyframes guw{0%{transform:translateX(0)}88%,100%{transform:translateX(' + (X1 - X0) + 'px)}}' +
        '.gu-c{stroke-dasharray:1;stroke-dashoffset:1;animation:guc 11s linear infinite}@keyframes guc{0%{stroke-dashoffset:1}88%,100%{stroke-dashoffset:0}}' +
        '@media (prefers-reduced-motion:reduce){.gu-w{transform:translateX(' + (X1 - X0) + 'px)}.gu-c{stroke-dashoffset:0}[class^=gu-m]{opacity:1}}',
        body),
    };
  },
  // Low platelets: a cut in a blood vessel wall. With enough platelets (purple) they gather and seal the gap;
  // with too few, only two arrive and the gap stays open longer. No blood is drawn leaking out.
  'platelet-plug'(l) {
    const P = '#7A5AD1';
    const t = l === 'bn'
      ? { a: 'প্লেটলেট যথেষ্ট', b: 'প্লেটলেট কম', cut: 'কাটা জায়গা', sealed: 'মুখ বন্ধ', open: 'মুখ খোলা থাকে বেশিক্ষণ',
          cap: 'কোথাও কাটলে প্লেটলেট (বেগুনি) ছুটে গিয়ে একসঙ্গে জুড়ে ফাঁকটা বন্ধ করে। প্লেটলেট কম থাকলে কম পৌঁছায়, তাই রক্ত থামতে বেশি সময় লাগে। ছবিতে কোনো আসল মাপ নেই।' }
      : { a: 'Enough platelets', b: 'Too few', cut: 'a cut', sealed: 'sealed', open: 'stays open longer',
          cap: 'At a cut, platelets (purple) gather and stick together to seal the gap. With too few, fewer arrive, so bleeding takes longer to stop. The drawing has no real numbers.' };
    const gx = [170, 179, 188, 197, 206];
    const lane = (y, n, cls, lab, done) => {
      let g = T(40, y - 16, lab, { a: 'start', size: 13.5, fill: n > 2 ? C.teal2 : C.red, w: 700 }) +
        `<rect x="40" y="${y}" width="280" height="46" fill="${C.vessel}"/>` +
        `<path d="M40 ${y}H164M212 ${y}H320M40 ${y + 46}H320" stroke="${C.rose}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M164 ${y}l3 -8M212 ${y}l-3 -8" stroke="${C.rose}" stroke-width="4" stroke-linecap="round"/>` +
        `<rect x="166" y="${y - 4}" width="44" height="8" rx="4" fill="none" stroke="${C.muted}" stroke-width="1.2" stroke-dasharray="3 3"/>`;
      for (let i = 0; i < 6; i++) g += `<g transform="translate(${70 + i * 42},${y + 31})">${cell(7, false)}</g>`;
      for (let i = 0; i < n; i++) {
        const sx = 60 + i * 22, sy = y + 16;
        g += `<ellipse class="${cls}" cx="${gx[i]}" cy="${y}" rx="5.6" ry="3.8" fill="${P}" style="--dx:${sx - gx[i]}px;--dy:${sy - y}px;animation-delay:${(i * 0.45).toFixed(2)}s"/>`;
      }
      return g + T(188, y - 16, done, { size: 12.5, fill: n > 2 ? C.teal2 : '#9A5A0C', w: 600 }).replace('<text', `<text class="${cls}-t"`);
    };
    const body = lane(48, 5, 'pp-a', t.a, t.sealed) + lane(150, 2, 'pp-b', t.b, t.open);
    return {
      cap: t.cap,
      svg: svg('pp', 360, 214, t.cap,
        '.pp-a,.pp-b{animation:ppgo 8s ease-in-out infinite;opacity:0}@keyframes ppgo{0%{transform:translate(var(--dx),var(--dy));opacity:0}8%{opacity:1}55%,92%{transform:translate(0,0);opacity:1}100%{transform:translate(0,0);opacity:0}}' +
        '.pp-a-t,.pp-b-t{animation:pptx 8s ease-in-out infinite;opacity:0}@keyframes pptx{0%,62%{opacity:0}70%,92%{opacity:1}100%{opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.pp-a,.pp-b{animation:none;opacity:1;transform:none}.pp-a-t,.pp-b-t{animation:none;opacity:1}}',
        body),
    };
  },
  // Dengue: a timeline. A few days of fever, then the risky window after the fever goes (it pulses as the
  // dot passes), then getting better, then a stretch of tiredness. No real days are drawn.
  'dengue-days'(l) {
    const t = l === 'bn'
      ? { a: 'জ্বর', goes: 'জ্বর ছাড়ল', b: 'কড়া নজর', c: 'সেরে ওঠা', d: 'ক্লান্তি', look: 'বিপদের লক্ষণ?',
          cap: 'ডেঙ্গু সাধারণত শুরু হয় কয়েকদিনের খুব জ্বর দিয়ে। বিপদের সময় প্রায়ই আসে জ্বর ছাড়ার পরে, তাই তখনই সবচেয়ে কাছ থেকে নজর রাখতে হয়। তারপর বেশিরভাগ মানুষ এক-দু সপ্তাহে সেরে ওঠেন, যদিও কয়েক সপ্তাহ ক্লান্তি থাকতে পারে। ছবিতে কোনো আসল দিন নেই।' }
      : { a: 'Fever', goes: 'fever goes', b: 'Watch closely', c: 'Getting better', d: 'Tired', look: 'warning signs?',
          cap: 'Dengue usually starts with a few days of high fever. The risky time often comes after the fever goes, so that is when to watch most closely. Most people then get better within one to two weeks, though tiredness can last a few weeks. The drawing has no real days.' };
    const y = 98, h = 26;
    const body =
      `<rect x="20" y="${y}" width="90" height="${h}" rx="13" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/>` +
      `<rect class="dd-w" x="114" y="${y}" width="88" height="${h}" rx="13" fill="${C.roseBg}" stroke="${C.red}" stroke-width="2.4"/>` +
      `<rect x="206" y="${y}" width="90" height="${h}" rx="13" fill="${C.mint}" stroke="${C.mintLine}" stroke-width="2"/>` +
      `<rect x="300" y="${y}" width="42" height="${h}" rx="13" fill="#fff" stroke="${C.mintLine}" stroke-width="2" stroke-dasharray="4 4"/>` +
      T(65, y - 10, t.a, { size: 12.5, fill: '#9A5A0C', w: 700 }) + T(158, y - 10, t.b, { size: 12.5, fill: C.red, w: 700 }) +
      T(251, y - 10, t.c, { size: 12.5, fill: C.teal2, w: 700 }) + T(321, y - 10, t.d, { size: 11.5, fill: C.muted, w: 600 }) +
      `<path d="M112 ${y - 4}v${h + 12}" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="3 3"/>` + T(112, y + h + 22, t.goes, { size: 12, fill: C.ink, w: 600 }) +
      `<g class="dd-l"><circle cx="158" cy="30" r="13" fill="#fff" stroke="${C.red}" stroke-width="2.4"/><path d="M158 22v9" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/><circle cx="158" cy="36" r="1.9" fill="${C.red}"/>` +
      T(158, 62, t.look, { size: 12, fill: C.red, w: 600 }) + '</g>' +
      `<g class="dd-m"><circle cx="30" cy="${y + h / 2}" r="7" fill="${C.teal}"/></g>`;
    return {
      cap: t.cap,
      svg: svg('dd', 360, 160, t.cap,
        '.dd-m{animation:ddmv 12s linear infinite}@keyframes ddmv{0%{transform:translateX(0)}92%,100%{transform:translateX(292px)}}' +
        '.dd-w{animation:ddw 12s ease-in-out infinite}@keyframes ddw{0%,26%{stroke-width:2.4}31%,52%{stroke-width:5}57%,100%{stroke-width:2.4}}' +
        '.dd-l{animation:ddl 12s ease-in-out infinite;opacity:0}@keyframes ddl{0%,26%{opacity:0}31%,54%{opacity:1}60%,100%{opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.dd-m{animation:none;transform:translateX(128px)}.dd-w{animation:none;stroke-width:4}.dd-l{animation:none;opacity:1}}',
        body),
    };
  },
  // Low platelets, ITP: two lines of the platelet count over time, drawn slowly. The child's dips and climbs back by
  // itself; the adult's dips and stays lower. Small marks are regular checks, in both lanes (Dr. Roy, 2026-11-22: no watch-only content). No numbers, no real time.
  'itp-paths'(l) {
    const P = '#7A5AD1';
    const t = l === 'bn'
      ? { a: 'বাচ্চাদের', b: 'বড়দের', ok: 'যথেষ্ট প্লেটলেট', a2: 'প্রায়ই নিজে থেকে সেরে যায়', b2: 'থেকে যেতে পারে, নিয়মিত দেখাতে হয়', time: 'সময়',
          cap: 'বাচ্চাদের আইটিপিতে প্লেটলেট কমে যায়, আর প্রায়ই কয়েক সপ্তাহ বা মাসে নিজে থেকে আবার বাড়ে। বড়দের বেশি দিন কম থাকতে পারে, তখন নিয়মিত পরীক্ষা (ছোট দাগ) আর হেমাটোলজিস্ট যে চিকিৎসা ঠিক করেন, সেটা চলে। ছবিতে কোনো আসল মাপ বা সময় নেই।' }
      : { a: 'In a child', b: 'In an adult', ok: 'enough platelets', a2: 'often settles by itself', b2: 'may last, with regular checks', time: 'time',
          cap: 'In a child with ITP the count falls and often climbs back by itself within weeks or months. In an adult it may stay low for longer, with regular checks (the small marks) and the treatment the hematologist plans. The drawing has no real numbers or times.' };
    const lane = (y, d, lab, lab2, col, ticks) => {
      let g = T(24, y - 8, lab, { a: 'start', size: 13.5, fill: C.teal2, w: 700 }) +
        `<rect x="24" y="${y}" width="312" height="70" rx="12" fill="${C.mint}"/>` +
        `<path d="M34 ${y + 18}H326" stroke="${C.mintLine}" stroke-width="2" stroke-dasharray="5 5"/>` +
        T(326, y + 12, t.ok, { a: 'end', size: 12.5, fill: C.muted, w: 600 }) +
        `<path class="ip-l" pathLength="1" d="${d}" fill="none" stroke="${P}" stroke-width="4" stroke-linecap="round"/>`;
      for (const x of ticks) g += `<path class="ip-t" d="M${x} ${y + 60}v-8" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/>`;
      return g + T(180, y + 90, lab2, { size: 12.5, fill: col, w: 600 });
    };
    const body =
      lane(34, 'M36 52C70 52 74 92 100 92S150 88 180 70 250 50 324 50', t.a, t.a2, C.teal2, [90, 140]) +
      lane(150, 'M36 166C70 166 74 206 100 206S150 196 180 198 250 190 324 194', t.b, t.b2, '#9A5A0C', [120, 170, 220, 270, 320]) +
      `<path d="M36 262H324" stroke="${C.muted}" stroke-width="1.6"/><path d="M318 257l7 5-7 5" fill="none" stroke="${C.muted}" stroke-width="1.6"/>` +
      T(180, 280, t.time, { size: 12.5, fill: C.muted, w: 600 });
    return {
      cap: t.cap,
      svg: svg('ip', 360, 290, t.cap,
        '.ip-l{stroke-dasharray:1;stroke-dashoffset:1;animation:ipl 10s ease-in-out infinite}@keyframes ipl{0%{stroke-dashoffset:1}70%,94%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:.2}}' +
        '.ip-t{opacity:0;animation:ipt 10s ease-in-out infinite}@keyframes ipt{0%,45%{opacity:0}60%,94%{opacity:1}100%{opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.ip-l{stroke-dashoffset:0}.ip-t{opacity:1}}',
        body),
    };
  },
  // Anaemia, B12 and folate: the road B12 takes from food to blood. In the top lane a B12 dot (blue) leaves the food,
  // picks up the stomach's helper (teal) and goes through the gut into the blood. In the lower lane, pernicious anaemia,
  // the stomach makes no helper, so the dot stops there and fades. No numbers.
  'b12-route'(l) {
    const t = l === 'bn'
      ? { food: 'খাবার', st: 'পাকস্থলী', gut: 'অন্ত্র', blood: 'রক্ত', a: 'স্বাভাবিক', b: 'পারনিশাস অ্যানিমিয়া', help: 'সাহায্যকারী প্রোটিন', no: 'সাহায্যকারী নেই',
          cap: 'খাবারের বি১২ (নীল) পাকস্থলীতে একটা সাহায্যকারী প্রোটিনের (সবুজ) সঙ্গে জোড়ে, তারপর অন্ত্র দিয়ে রক্তে যায়। পারনিশাস অ্যানিমিয়ায় পাকস্থলী সেই প্রোটিন বানাতে পারে না, তাই বি১২ ওখানেই আটকে যায়, যত খাবারই খান। ছবিতে কোনো আসল মাপ নেই।' }
      : { food: 'food', st: 'stomach', gut: 'gut', blood: 'blood', a: 'Usual road', b: 'Pernicious anaemia', help: 'helper protein', no: 'no helper',
          cap: 'B12 from food (blue) joins a helper protein (green) in the stomach, then passes through the gut into the blood. In pernicious anaemia the stomach cannot make the helper, so B12 stops there, however much food is eaten. The drawing has no real numbers.' };
    const X = [44, 136, 228, 316];
    const station = (x, y, lab, kind) => {
      const shape = kind === 'food'
        ? `<rect x="${x - 20}" y="${y - 16}" width="40" height="32" rx="10" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><ellipse cx="${x - 5}" cy="${y}" rx="9" ry="5" fill="${C.amber}"/><circle cx="${x + 9}" cy="${y - 2}" r="5" fill="#fff" stroke="${C.amber}" stroke-width="1.6"/>`
        : kind === 'st'
          ? `<path d="M${x - 16} ${y - 14}c10-4 18 2 18 10s10 4 12 -2c6 14-6 24-18 22s-18-10-12-30z" fill="${C.roseBg}" stroke="${C.rose}" stroke-width="2"/>`
          : kind === 'gut'
            ? `<path d="M${x - 18} ${y - 8}h30a6 6 0 0 1 0 12h-24a6 6 0 0 0 0 12h30" fill="none" stroke="${C.rose}" stroke-width="5" stroke-linecap="round"/>`
            : `<g transform="translate(${x},${y})">${cell(13, false)}</g>`;
      return shape + T(x, y + 32, lab, { size: 12.5, fill: C.muted, w: 600 });
    };
    const lane = (y, title, blocked) => {
      let g = T(20, y - 30, title, { a: 'start', size: 13.5, fill: blocked ? C.red : C.teal2, w: 700 }) +
        `<path d="M${X[0] + 22} ${y}H${X[3] - 16}" stroke="${C.mintLine}" stroke-width="3" stroke-dasharray="4 5"/>`;
      g += station(X[0], y, t.food, 'food') + station(X[1], y, t.st, 'st') + station(X[2], y, t.gut, 'gut') + station(X[3], y, t.blood, 'blood');
      if (blocked) {
        g += `<g transform="translate(${X[1] + 26},${y - 22})"><circle r="9" fill="#fff" stroke="${C.red}" stroke-width="2"/><path d="M-4-4l8 8M4-4l-8 8" stroke="${C.red}" stroke-width="2.4" stroke-linecap="round"/></g>`;
        g += `<g class="br-d br-stop"><circle cx="${X[0]}" cy="${y - 1}" r="6" fill="${C.o2}"/></g>`;
        g += T(X[1] + 40, y + 50, t.no, { size: 12.5, fill: C.red, w: 600 });
      } else {
        g += `<g class="br-d br-go"><circle cx="${X[0]}" cy="${y - 1}" r="6" fill="${C.o2}"/><circle class="br-h" cx="${X[0] + 9}" cy="${y - 1}" r="5" fill="${C.teal2}"/></g>`;
        g += T(X[1], y - 26, t.help, { size: 12.5, fill: C.teal2, w: 600 });
      }
      return g;
    };
    const body = lane(62, t.a, false) + lane(178, t.b, true);
    const go = X[3] - X[0], stop = X[1] - X[0];
    return {
      cap: t.cap,
      svg: svg('br', 360, 250, t.cap,
        `.br-go{animation:brgo 9s ease-in-out infinite}@keyframes brgo{0%{transform:translateX(0)}35%{transform:translateX(${stop}px)}45%{transform:translateX(${stop}px)}85%,100%{transform:translateX(${go}px)}}` +
        `.br-h{opacity:0;animation:brh 9s ease-in-out infinite}@keyframes brh{0%,33%{opacity:0}40%,100%{opacity:1}}` +
        `.br-stop{animation:brst 9s ease-in-out infinite}@keyframes brst{0%{transform:translateX(0);opacity:1}35%{transform:translateX(${stop - 6}px);opacity:1}60%{transform:translateX(${stop - 6}px);opacity:1}80%,100%{transform:translateX(${stop - 6}px);opacity:.15}}` +
        `@media (prefers-reduced-motion:reduce){.br-go{transform:translateX(${go}px)}.br-h{opacity:1}.br-stop{transform:translateX(${stop - 6}px)}}`,
        body),
    };
  },
  // Thalassemia, Hemoglobin E: three people and their two copies. E with a normal copy (trait), E with E (HbE disease),
  // E with beta (HbE beta thalassemia). The bar under each shows how much it affects life: none, a little, and for
  // HbE beta a bar that swings between mild and severe, because it varies. No numbers.
  'hbe-three'(l) {
    const t = l === 'bn'
      ? { n: [['HbE ট্রেট'], ['HbE ডিজিজ'], ['HbE বিটা', 'থ্যালাসেমিয়া']], s: ['সুস্থ বাহক', 'সাধারণত হালকা', 'হালকা থেকে গুরুতর'], lo: 'কম', hi: 'বেশি', k: 'জীবনে প্রভাব',
          cap: 'HbE একটা নকশায় থাকলে মানুষটি সুস্থ বাহক। দুটো নকশাতেই E থাকলে সাধারণত শুধু হালকা অ্যানিমিয়া। একটায় E আর অন্যটায় বিটা থ্যালাসেমিয়া থাকলে অসুখটা হালকা থেকে গুরুতর, যে কোনোরকম হতে পারে, তাই নিয়মিত দেখাশোনা লাগে। ছবিতে কোনো আসল মাপ নেই।' }
      : { n: [['HbE trait'], ['HbE disease'], ['HbE beta', 'thalassemia']], s: ['healthy carrier', 'usually mild', 'mild to severe'], lo: 'less', hi: 'more', k: 'effect on life',
          cap: 'With E in one copy, the person is a healthy carrier. With E in both copies, there is usually only mild anaemia. With E in one copy and beta thalassemia in the other, the illness can be anything from mild to severe, so it needs regular care. The drawing has no real numbers.' };
    const X = [60, 180, 300], kinds = [['e', 'ok'], ['e', 'e'], ['e', 'beta']];
    let body = '';
    X.forEach((x, i) => {
      body += person(x, 46, 0.95) + pair(x, 96, kinds[i][0], kinds[i][1], 1.05);
      t.n[i].forEach((line, j) => { body += T(x, 136 + j * 16, line, { size: 13, fill: C.ink, w: 700 }); });
      const by = 174;
      body += `<rect x="${x - 44}" y="${by}" width="88" height="12" rx="6" fill="${C.mint}" stroke="${C.mintLine}" stroke-width="1.5"/>`;
      if (i === 1) body += `<rect x="${x - 44}" y="${by}" width="22" height="12" rx="6" fill="${C.amber}"/>`;
      if (i === 2) body += `<rect class="ht-v" x="${x - 44}" y="${by}" width="88" height="12" rx="6" fill="${C.red}"/>`;
      body += T(x, by + 30, t.s[i], { size: 12.5, fill: i === 0 ? C.teal2 : i === 1 ? '#9A5A0C' : C.red, w: 600 });
    });
    body += T(180, 226, t.k, { size: 12.5, fill: C.muted, w: 600 });
    return {
      cap: t.cap,
      svg: svg('ht', 360, 236, t.cap,
        '.ht-v{transform-box:fill-box;transform-origin:left center;animation:htv 6s ease-in-out infinite}@keyframes htv{0%,100%{transform:scaleX(.22)}45%,60%{transform:scaleX(1)}}' +
        '@media (prefers-reduced-motion:reduce){.ht-v{transform:scaleX(.6)}}',
        body),
    };
  },
  // Blood cancers: the bone marrow as a workshop. Top lane, healthy: red cells, white cells (blue) and platelets (purple)
  // leave the marrow into the blood in a steady mix. Lower lane, a blood cancer: faulty cells (dark) appear one by one and
  // fill the marrow, and fewer healthy cells leave. No blood, no numbers.
  'marrow-crowd'(l) {
    const P = '#7A5AD1', BAD = '#2E3A59';
    const t = l === 'bn'
      ? { a: 'সুস্থ বোন ম্যারো', b: 'রক্তের ক্যান্সার', m: 'বোন ম্যারো', bl: 'রক্ত', bad: 'খারাপ কোষ',
          cap: 'বোন ম্যারো রোজ লোহিত কণিকা, শ্বেত কণিকা (নীল) আর প্লেটলেট (বেগুনি) বানিয়ে রক্তে পাঠায়। রক্তের ক্যান্সারে একটা খারাপ কোষ (কালচে) বাড়তে বাড়তে ম্যারো ভরিয়ে ফেলে, তাই সুস্থ কোষ কম বেরোয়: ক্লান্তি, সংক্রমণ আর রক্ত পড়া সেখান থেকেই। ছবিতে কোনো আসল মাপ নেই।' }
      : { a: 'Healthy marrow', b: 'Blood cancer', m: 'marrow', bl: 'blood', bad: 'faulty cells',
          cap: 'The bone marrow makes red cells, white cells (blue) and platelets (purple) every day and sends them into the blood. In a blood cancer, faulty cells (dark) multiply and fill the marrow, so fewer healthy cells come out, which is why tiredness, infections and bleeding follow. The drawing has no real numbers.' };
    const white = `<circle r="7.5" fill="#fff" stroke="${C.o2}" stroke-width="2.2"/><circle r="3.2" fill="${C.o2}"/>`;
    const plt = `<ellipse rx="5" ry="3.4" fill="${P}"/>`;
    const out = (y, n, cls) => {
      const kinds = [cell(7, false), white, plt];
      let g = `<rect x="150" y="${y - 20}" width="190" height="40" rx="20" fill="${C.vessel}"/>`;
      for (let i = 0; i < n; i++) g += `<g transform="translate(150,${y})"><g class="${cls}" style="animation-delay:-${(6 / n * i).toFixed(2)}s">${kinds[i % 3]}</g></g>`;
      return g + T(300, y - 26, t.bl, { size: 12.5, fill: C.muted, w: 600 });
    };
    const box = (y, title, col) => T(20, y - 44, title, { a: 'start', size: 13.5, fill: col, w: 700 }) +
      `<rect x="20" y="${y - 32}" width="120" height="64" rx="16" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/>` + T(80, y + 48, t.m, { size: 12.5, fill: C.muted, w: 600 });
    let body = box(68, t.a, C.teal2) + out(68, 9, 'mc-go');
    const seeds = [[40, 56], [58, 82], [84, 52], [104, 78], [124, 58], [48, 70], [72, 66], [96, 64], [118, 82], [36, 84]];
    [[44, 58, 'r'], [70, 80, 'w'], [96, 56, 'p'], [118, 76, 'r'], [60, 68, 'w']].forEach(([x, y, k]) => {
      body += `<g transform="translate(${x},${y})">${k === 'r' ? cell(7, false) : k === 'w' ? white : plt}</g>`;
    });
    body += box(196, t.b, C.red) + out(196, 3, 'mc-go');
    [[46, 184], [72, 208], [98, 182], [120, 204], [60, 196]].forEach(([x, y]) => { body += `<g transform="translate(${x},${y})">${cell(6.5, false)}</g>`; });
    seeds.forEach(([x, y], i) => {
      body += `<circle class="mc-bad" cx="${x}" cy="${y + 128}" r="8" fill="${BAD}" style="animation-delay:${(i * 0.45).toFixed(2)}s"/>`;
    });
    body += `<circle cx="156" cy="148" r="6" fill="${BAD}"/>` + T(166, 152, t.bad, { a: 'start', size: 12.5, fill: BAD, w: 700 });
    return {
      cap: t.cap,
      svg: svg('mc', 360, 256, t.cap,
        '.mc-go{animation:mcgo 6s linear infinite}@keyframes mcgo{0%{transform:translateX(4px);opacity:0}10%{opacity:1}88%{opacity:1}100%{transform:translateX(180px);opacity:0}}' +
        '.mc-bad{opacity:0;animation:mcb 9s ease-out infinite}@keyframes mcb{0%{opacity:0;transform:scale(.3)}8%,90%{opacity:1;transform:scale(1)}100%{opacity:0}}.mc-bad{transform-box:fill-box;transform-origin:center}' +
        '@media (prefers-reduced-motion:reduce){.mc-go{transform:translateX(90px);opacity:1}.mc-bad{opacity:1;transform:none}}',
        body),
    };
  },
  // Blood cancers, CML: the three phases as a road (chronic, accelerated, blast). Top lane, tablets taken without gaps and
  // checked with tests: the dot stays in the slow chronic phase, with small test marks. Lower lane, tablets stopped: the dot
  // drifts slowly towards the faster phases. No numbers, no times.
  'cml-phases'(l) {
    const t = l === 'bn'
      ? { z: ['ক্রনিক (ধীর)', 'অ্যাক্সিলারেটেড', 'ব্লাস্ট'], a: 'ট্যাবলেট ফাঁক ছাড়া, নিয়মিত পরীক্ষা', b: 'ট্যাবলেট বন্ধ', test: 'পরীক্ষা',
          cap: 'সিএমএলের তিনটে পর্যায়: ক্রনিক (ধীর), অ্যাক্সিলারেটেড আর ব্লাস্ট। ফাঁক ছাড়া ট্যাবলেট আর নিয়মিত পরীক্ষা সিএমএলকে ধীর পর্যায়ে ধরে রাখতে পারে। নিজে থেকে বন্ধ করলে সেটা দ্রুত পর্যায়ের দিকে এগোতে পারে। ছবিতে কোনো আসল সময় নেই।' }
      : { z: ['Chronic (slow)', 'Accelerated', 'Blast'], a: 'Tablets without gaps, regular tests', b: 'Tablets stopped', test: 'tests',
          cap: 'CML has three phases: chronic (slow), accelerated and blast. Tablets taken without gaps, checked with regular tests, can hold CML in the slow phase. Stopped on one’s own, it can move towards the faster phases. The drawing has no real times.' };
    const road = (y) =>
      `<rect x="20" y="${y}" width="170" height="30" rx="15" fill="${C.mint}" stroke="${C.mintLine}" stroke-width="2"/>` +
      `<rect x="194" y="${y}" width="72" height="30" rx="15" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/>` +
      `<rect x="270" y="${y}" width="70" height="30" rx="15" fill="${C.roseBg}" stroke="${C.red}" stroke-width="2"/>`;
    const labels = (y) => T(105, y, t.z[0], { size: 12.5, fill: C.teal2, w: 700 }) + T(230, y, t.z[1], { size: 12, fill: '#9A5A0C', w: 700 }) + T(305, y, t.z[2], { size: 12.5, fill: C.red, w: 700 });
    let body = labels(34) +
      T(20, 60, t.a, { a: 'start', size: 13, fill: C.teal2, w: 700 }) + road(68) +
      `<g class="cp-a"><circle cx="50" cy="83" r="8" fill="${C.teal}"/></g>`;
    [70, 110, 150].forEach((x) => { body += `<path class="cp-t" d="M${x} 104v-6" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/>`; });
    body += T(110, 122, t.test, { size: 12.5, fill: C.muted, w: 600 }) +
      T(20, 156, t.b, { a: 'start', size: 13, fill: C.red, w: 700 }) + road(164) +
      `<g class="cp-b"><circle cx="50" cy="179" r="8" fill="${C.teal}"/></g>`;
    return {
      cap: t.cap,
      svg: svg('cp', 360, 210, t.cap,
        '.cp-a{animation:cpa 5s ease-in-out infinite alternate}@keyframes cpa{0%{transform:translateX(0)}100%{transform:translateX(110px)}}' +
        '.cp-t{animation:cpt 2.5s ease-in-out infinite}@keyframes cpt{0%,100%{opacity:.35}50%{opacity:1}}' +
        '.cp-b{animation:cpb 12s ease-in infinite}@keyframes cpb{0%{transform:translateX(0)}85%,100%{transform:translateX(262px)}}' +
        '@media (prefers-reduced-motion:reduce){.cp-a{transform:translateX(60px)}.cp-b{transform:translateX(200px)}.cp-t{opacity:1}}',
        body),
    };
  },
  // Blood cancers, myeloma: the bone marrow in the middle, and the four places myeloma shows itself around it (bones,
  // calcium in the blood, kidneys, blood counts). Each link lights up in turn. No numbers, no frightening images.
  'myeloma-four'(l) {
    const t = l === 'bn'
      ? { m: 'বোন ম্যারো', n: ['হাড় দুর্বল', 'ক্যালসিয়াম বেশি', 'কিডনির ক্ষতি', 'রক্তকণিকা কম'], s: ['ব্যথা, সহজে ভাঙা', 'জলতেষ্টা, গুলিয়ে যাওয়া', 'প্রস্রাব কম', 'ক্লান্তি, সংক্রমণ'],
          cap: 'মায়েলোমার কোষ বোন ম্যারোতে জমে, আর চার জায়গায় ধরা দিতে পারে: হাড় দুর্বল হয়, রক্তে ক্যালসিয়াম বাড়ে, কিডনির ক্ষতি হয়, আর রক্তকণিকা কমে যায়। ছবিতে কোনো আসল মাপ নেই।' }
      : { m: 'bone marrow', n: ['Bones weaken', 'Calcium rises', 'Kidneys strain', 'Blood counts fall'], s: ['pain, break easily', 'thirst, confusion', 'less urine', 'tiredness, infections'],
          cap: 'Myeloma cells build up in the bone marrow and can show themselves in four places: the bones weaken, calcium rises in the blood, the kidneys are harmed, and the blood counts fall. The drawing has no real numbers.' };
    const P = [[90, 58], [270, 58], [90, 196], [270, 196]];
    const icon = [
      `<rect x="-20" y="-6" width="40" height="12" rx="6" fill="#fff" stroke="${C.muted}" stroke-width="2"/><circle cx="-20" cy="-5" r="6" fill="#fff" stroke="${C.muted}" stroke-width="2"/><circle cx="-20" cy="5" r="6" fill="#fff" stroke="${C.muted}" stroke-width="2"/><circle cx="20" cy="-5" r="6" fill="#fff" stroke="${C.muted}" stroke-width="2"/><circle cx="20" cy="5" r="6" fill="#fff" stroke="${C.muted}" stroke-width="2"/><path d="M-2-6l4 5-3 3 3 4" fill="none" stroke="${C.red}" stroke-width="2" stroke-linecap="round"/>`,
      `<circle r="15" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#9A5A0C">Ca</text>`,
      `<path d="M-6-14c-12 0-14 14-8 22s14 8 14-2c0-6-4-6-4-10s2-10-2-10z" fill="${C.roseBg}" stroke="${C.rose}" stroke-width="2"/><path d="M6-14c12 0 14 14 8 22s-14 8-14-2c0-6 4-6 4-10s-2-10 2-10z" fill="${C.roseBg}" stroke="${C.rose}" stroke-width="2"/>`,
      `<g transform="translate(-8,0)">${cell(9, false)}</g><g transform="translate(10,4)">${cell(6, false)}</g>`,
    ];
    let body = `<rect x="130" y="100" width="100" height="48" rx="14" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/>`;
    [[150, 118], [170, 130], [190, 116], [208, 132], [160, 136], [200, 122]].forEach(([x, y]) => { body += `<circle cx="${x}" cy="${y}" r="5.5" fill="#2E3A59"/>`; });
    body += T(180, 166, t.m, { size: 12.5, fill: C.muted, w: 600 });
    P.forEach(([x, y], i) => {
      const ex = x < 180 ? 130 : 230, ey = y < 124 ? 104 : 144;
      body += `<path class="mf-l" style="animation-delay:${(i * 1.5).toFixed(1)}s" d="M${ex} ${ey}L${x + (x < 180 ? 28 : -28)} ${y + (y < 124 ? 10 : -10)}" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>`;
      body += `<g transform="translate(${x},${y})"><g class="mf-i" style="animation-delay:${(i * 1.5).toFixed(1)}s">${icon[i]}</g></g>`;
      const ty = y < 124 ? y - 36 : y + 34;
      body += T(x, ty, t.n[i], { size: 13, fill: C.ink, w: 700 }) + T(x, ty + 15, t.s[i], { size: 12, fill: C.muted, w: 600 });
    });
    return {
      cap: t.cap,
      svg: svg('mf', 360, 250, t.cap,
        '.mf-l{opacity:.15;animation:mfl 6s ease-in-out infinite}@keyframes mfl{0%,100%{opacity:.15}8%,22%{opacity:1}30%{opacity:.15}}' +
        '.mf-i{transform-box:fill-box;transform-origin:center;animation:mfi 6s ease-in-out infinite}@keyframes mfi{0%,100%{transform:scale(1)}12%{transform:scale(1.15)}24%{transform:scale(1)}}' +
        '@media (prefers-reduced-motion:reduce){.mf-l{opacity:.8}.mf-i{transform:none}}',
        body),
    };
  },
  // Blood cancers, acute leukaemia: the road from signs to treatment, which is short and should be walked quickly.
  // A dot moves from the signs (a few weeks), to a blood count, to the hematologist, to treatment, each stop lighting up.
  'acute-clock'(l) {
    const t = l === 'bn'
      ? { s: [['লক্ষণ', 'কয়েক সপ্তাহে'], ['রক্ত পরীক্ষা', 'দেরি না করে'], ['হেমাটোলজিস্ট', 'তাড়াতাড়ি'], ['চিকিৎসা', 'সঙ্গে সঙ্গে']],
          cap: 'অ্যাকিউট লিউকেমিয়া কয়েক সপ্তাহে বাড়ে। তাই লক্ষণ থেকে রক্ত পরীক্ষা, হেমাটোলজিস্ট আর চিকিৎসা পর্যন্ত পথটা দেরি না করে পেরোতে হয়। ছবিতে কোনো আসল সময় নেই।' }
      : { s: [['Signs', 'over a few weeks'], ['Blood count', 'without delay'], ['Hematologist', 'quickly'], ['Treatment', 'straight away']],
          cap: 'Acute leukaemia grows over a few weeks, so the road from the first signs to a blood count, a hematologist and treatment should be walked without delay. The drawing has no real times.' };
    const X = [45, 135, 225, 315], y = 92;
    const icon = [
      `<circle r="15" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><path d="M0-7v8" stroke="#9A5A0C" stroke-width="2.6" stroke-linecap="round"/><circle cy="6" r="1.8" fill="#9A5A0C"/>`,
      `<circle r="15" fill="#fff" stroke="${C.red}" stroke-width="2"/><g transform="translate(-3,0)">${cell(6, false)}</g><g transform="translate(6,3)">${cell(4, false)}</g>`,
      `<circle r="15" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cy="-4" r="4.5" fill="${C.teal}"/><path d="M-8 9c0-5 3.5-7.5 8-7.5s8 2.5 8 7.5z" fill="${C.teal}"/>`,
      `<circle r="15" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M-6 0l4 4 8-9" fill="none" stroke="${C.teal2}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    ];
    let body = `<path d="M${X[0]} ${y}H${X[3]}" stroke="${C.mintLine}" stroke-width="4" stroke-linecap="round"/>`;
    X.forEach((x, i) => {
      body += `<g transform="translate(${x},${y})"><g class="ac-s" style="animation-delay:${(i * 1.1).toFixed(1)}s">${icon[i]}</g></g>`;
      body += T(x, y + 36, t.s[i][0], { size: 13, fill: C.ink, w: 700 }) + T(x, y + 52, t.s[i][1], { size: 12, fill: C.muted, w: 600 });
    });
    body += `<g class="ac-d"><circle cx="${X[0]}" cy="${y - 28}" r="7" fill="${C.red}"/></g>`;
    return {
      cap: t.cap,
      svg: svg('ac', 360, 160, t.cap,
        `.ac-d{animation:acd 5s ease-in-out infinite}@keyframes acd{0%,8%{transform:translateX(0)}30%{transform:translateX(90px)}52%{transform:translateX(180px)}74%,100%{transform:translateX(270px)}}` +
        '.ac-s{transform-box:fill-box;transform-origin:center;animation:acs 5s ease-in-out infinite}@keyframes acs{0%,100%{transform:scale(1)}10%{transform:scale(1.15)}20%{transform:scale(1)}}' +
        '@media (prefers-reduced-motion:reduce){.ac-d{transform:translateX(270px)}.ac-s{transform:none}}',
        body),
    };
  },
  // Blood cancers, lymphoma: a simple body outline with the lymph nodes most easily felt (neck, armpits, groin) as small
  // dots. One node in the neck slowly grows into a painless lump and stays, while the others stay small. No faces.
  'lymph-map'(l) {
    const P = '#7A5AD1';
    const t = l === 'bn'
      ? { neck: 'গলা', arm: 'বগল', groin: 'কুঁচকি', lump: 'ব্যথাহীন ডেলা',
          cap: 'লসিকা গ্রন্থি (লিম্ফ নোড) সারা শরীরে থাকে, সবচেয়ে সহজে টের পাওয়া যায় গলা, বগল আর কুঁচকিতে। লিম্ফোমায় একটা নোড ফুলে ব্যথাহীন ডেলা হয়, যা কমে না। সংক্রমণে ফোলা গ্রন্থি সাধারণত এক-দু সপ্তাহে কমে যায়।' }
      : { neck: 'neck', arm: 'armpit', groin: 'groin', lump: 'painless lump',
          cap: 'Lymph nodes (glands) are all over the body, most easily felt in the neck, armpits and groin. In lymphoma a node swells into a painless lump that does not go down. Glands swollen by an infection usually go down within a week or two.' };
    const body0 =
      `<circle cx="180" cy="40" r="20" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>` +
      `<path d="M172 60h16v10h30c12 0 18 6 20 16l10 56h-18l-10-48v100l6 76h-20l-12-70h-8l-12 70h-20l6-76V94l-10 48h-18l10-56c2-10 8-16 20-16h30z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2" stroke-linejoin="round"/>`;
    const node = (x, y, r = 4.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P}" opacity=".75"/>`;
    let body = body0 + node(170, 66) + node(162, 84) + node(214, 92) + node(146, 92) + node(166, 166) + node(194, 166);
    body += `<g transform="translate(192,72)"><circle class="lm-g" r="6" fill="${P}"/></g>`;
    body += `<path d="M204 70H262" stroke="${C.red}" stroke-width="1.6" stroke-dasharray="3 3"/>` + T(266, 74, t.lump, { a: 'start', size: 12.5, fill: C.red, w: 700 });
    body += T(110, 64, t.neck, { a: 'end', size: 12.5, fill: C.muted, w: 600 }) + `<path d="M114 60H158" stroke="${C.mintLine}" stroke-width="1.4"/>` +
      T(110, 96, t.arm, { a: 'end', size: 12.5, fill: C.muted, w: 600 }) + `<path d="M114 92H140" stroke="${C.mintLine}" stroke-width="1.4"/>` +
      T(110, 170, t.groin, { a: 'end', size: 12.5, fill: C.muted, w: 600 }) + `<path d="M114 166H160" stroke="${C.mintLine}" stroke-width="1.4"/>`;
    return {
      cap: t.cap,
      svg: svg('lm', 360, 320, t.cap,
        '.lm-g{transform-box:fill-box;transform-origin:center;animation:lmg 7s ease-in-out infinite}@keyframes lmg{0%{transform:scale(.75)}60%,100%{transform:scale(2)}}' +
        '@media (prefers-reduced-motion:reduce){.lm-g{transform:scale(2)}}',
        body),
    };
  },
  // Blood cancers, CLL: watch and wait as a long, slow road. A gently rising line of lymphocytes over years, with
  // regular check-up dots along it; a dot walks the road, each check-up lights as it passes, and treatment starts
  // only at the end, when signs appear. No numbers, no real intervals.
  'cll-watch'(l) {
    const P = '#7A5AD1';
    const t = l === 'bn'
      ? { y: 'লিম্ফোসাইট', x: 'বছরের পর বছর', chk: 'নিয়মিত চেকআপ', tx: 'দরকার হলে চিকিৎসা',
          cap: 'সিএলএল সাধারণত খুব ধীরে বাড়ে। অনেকের প্রথমে নিয়মিত চেকআপ হয়, আর লক্ষণ বা পরীক্ষায় দরকার বোঝা গেলে চিকিৎসা শুরু হয়। মাঝে নতুন লক্ষণ হলে অপেক্ষা না করে জানান।' }
      : { y: 'lymphocytes', x: 'years', chk: 'regular check-ups', tx: 'treatment when needed',
          cap: 'CLL usually grows very slowly. Many people first have regular check-ups, and treatment starts when signs or tests show it is needed. New signs in between are reported without waiting.' };
    const pts = [[40, 190], [90, 184], [140, 176], [190, 166], [240, 152], [290, 132], [330, 108]];
    let body = `<path d="M30 210H340M30 210V40" stroke="${C.mintLine}" stroke-width="1.6"/>` +
      T(34, 34, t.y, { a: 'start', size: 12.5, fill: C.muted, w: 600 }) + T(336, 228, t.x, { a: 'end', size: 12.5, fill: C.muted, w: 600 });
    body += `<path d="M${pts.map(p => p.join(' ')).join('L')}" fill="none" stroke="${P}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    pts.slice(0, 6).forEach(([x, y], i) => {
      body += `<circle class="cw-c" style="animation-delay:${[0, 1.3, 2.5, 3.8, 5.2, 6.5][i]}s" cx="${x}" cy="${y}" r="6.5" fill="#fff" stroke="${C.teal2}" stroke-width="2"/>`;
    });
    body += T(150, 206, t.chk, { a: 'middle', size: 12.5, fill: C.teal2, w: 700 });
    body += `<circle cx="330" cy="108" r="9" fill="${C.red}" opacity=".9"/>` + T(326, 86, t.tx, { a: 'end', size: 12.5, fill: C.red, w: 700 });
    body += `<circle class="cw-d" r="5" fill="${C.teal}"><animateMotion dur="7.7s" repeatCount="indefinite" path="M${pts.map(p => p.join(' ')).join('L')}"/></circle>`;
    return {
      cap: t.cap,
      svg: svg('cw', 360, 240, t.cap,
        '.cw-c{animation:cwc 7.7s linear infinite}@keyframes cwc{0%,12%{fill:#7A5AD1}20%,100%{fill:#fff}}' +
        '@media (prefers-reduced-motion:reduce){.cw-c{animation:none}.cw-d{display:none}}',
        body),
    };
  },
  // The bone marrow test: the pelvis seen from the back, with the spine in the middle (grey, untouched). A needle moves
  // gently in and out of the back of the right hip bone; beside it, the two samples it gives (a drop of liquid marrow
  // and a thin core) go to the microscope. No faces, no blood, no numbers.
  'marrow-test'(l) {
    const P = '#7A5AD1';
    const t = l === 'bn'
      ? { spine: 'শিরদাঁড়া: হাত দেওয়া হয় না', hip: 'কোমরের হাড়', asp: 'তরল মজ্জা', core: 'সরু টুকরো', mic: 'প্যাথোলজিস্ট',
          cap: 'চামড়া অবশ করে কোমরের হাড়ের পেছন দিক থেকে অল্প তরল মজ্জা আর একটা সরু টুকরো নেওয়া হয়। শিরদাঁড়ায় হাত দেওয়া হয় না। প্যাথোলজিস্ট দুটোই মাইক্রোস্কোপে দেখেন।' }
      : { spine: 'spine: not touched', hip: 'hip bone', asp: 'liquid marrow', core: 'thin core', mic: 'pathologist',
          cap: 'With the skin numbed, a little liquid marrow and a thin core are taken from the back of the hip bone. The spine is not touched. A pathologist looks at both under a microscope.' };
    let body = '';
    for (let i = 0; i < 6; i++) body += `<rect x="104" y="${30 + i * 22}" width="22" height="17" rx="4" fill="#e8e8ee" stroke="#b8b8c4" stroke-width="1.5"/>`;
    body += `<path d="M100 120c-30-10-62-4-80 18c-10 14-6 34 10 42c24 10 56 4 70-14z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>` +
      `<path d="M130 120c30-10 62-4 80 18c10 14 6 34-10 42c-24 10-56 4-70-14z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>` +
      '';
    body += `<g class="mt-n"><path d="M196 92L176 134" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><rect x="190" y="78" width="16" height="10" rx="3" transform="rotate(25 198 83)" fill="${C.teal}"/></g>`;
    body += T(115, 22, t.spine, { a: 'middle', size: 12, fill: C.muted, w: 600 }) + T(176, 205, t.hip, { a: 'middle', size: 12.5, fill: C.teal2, w: 700 });
    body += `<path d="M232 118h28" stroke="${C.mintLine}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    body += `<path d="M272 96c-6 9-10 14-10 19a10 10 0 0 0 20 0c0-5-4-10-10-19z" fill="${C.red}" opacity=".8"/>` + T(272, 146, t.asp, { a: 'middle', size: 12, fill: C.muted, w: 600 });
    body += `<rect x="300" y="100" width="34" height="9" rx="4.5" fill="${P}" opacity=".8"/>` + T(317, 128, t.core, { a: 'middle', size: 12, fill: C.muted, w: 600 });
    body += `<g transform="translate(296,160)"><path d="M10 40h28M24 40v-8M14 32h20l-4-14h-12zM20 18l6-14 6 3-5 13" fill="none" stroke="${C.teal2}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></g>` +
      T(320, 218, t.mic, { a: 'middle', size: 12, fill: C.teal2, w: 700 });
    return {
      cap: t.cap,
      svg: svg('mt', 360, 230, t.cap,
        '.mt-n{animation:mtn 4s ease-in-out infinite}@keyframes mtn{0%,100%{transform:translate(6px,-12px)}45%,60%{transform:translate(0,0)}}' +
        '@media (prefers-reduced-motion:reduce){.mt-n{animation:none}}',
        body),
    };
  },
  // Blood cancers, MDS: the marrow as a box of young cells on the left, a blood vessel on the right. Young cells move
  // towards the blood; most fade before they get there, so the blood side stays thin. No faces, no numbers.
  'mds-marrow'(l) {
    const P = '#7A5AD1';
    const t = l === 'bn'
      ? { m: 'অস্থিমজ্জা', b: 'রক্ত', y: 'কচি কণিকা', few: 'সুস্থ কণিকা কম',
          cap: 'এমডিএস-এ মজ্জার কচি কণিকাগুলো সুস্থ কণিকা হয়ে বড় হয় না, তাই রক্তে সুস্থ লোহিত কণিকা, শ্বেত কণিকা বা প্লেটলেট কম পড়ে।' }
      : { m: 'bone marrow', b: 'blood', y: 'young cells', few: 'few healthy cells',
          cap: 'In MDS, young cells in the marrow do not grow up into healthy cells, so the blood is short of healthy red cells, white cells or platelets.' };
    let body = `<rect x="14" y="40" width="160" height="150" rx="18" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>` +
      `<rect x="232" y="40" width="114" height="150" rx="40" fill="${C.roseBg}" stroke="${C.rose}" stroke-width="2"/>`;
    body += T(94, 30, t.m, { a: 'middle', size: 12.5, fill: C.teal2, w: 700 }) + T(289, 30, t.b, { a: 'middle', size: 12.5, fill: C.rose, w: 700 });
    const ys = [70, 100, 130, 160];
    ys.forEach((y, i) => [40, 75, 110].forEach((x, j) => {
      body += `<circle cx="${x + (i % 2) * 12}" cy="${y}" r="${7 + ((i + j) % 3)}" fill="${P}" opacity="${0.45 + ((i * j) % 3) * 0.15}"/>`;
    }));
    body += T(94, 208, t.y, { a: 'middle', size: 12, fill: C.muted, w: 600 });
    [0, 1, 2, 3, 4].forEach(i => {
      body += `<circle class="md-c md-${i === 2 ? 'ok' : 'x'}" style="animation-delay:${(i * 0.9).toFixed(1)}s" cx="150" cy="${76 + i * 20}" r="6" fill="${i === 2 ? C.red : P}"/>`;
    });
    body += `<circle cx="276" cy="98" r="9" fill="${C.red}" opacity=".85"/><circle cx="304" cy="140" r="5" fill="#b9a7e8"/>`;
    body += T(289, 208, t.few, { a: 'middle', size: 12, fill: C.rose, w: 700 });
    return {
      cap: t.cap,
      svg: svg('md', 360, 222, t.cap,
        '.md-c{animation:mdx 4.5s ease-in infinite}.md-ok{animation-name:mdok}' +
        '@keyframes mdx{0%{transform:translateX(0);opacity:1}55%{transform:translateX(50px);opacity:0}100%{opacity:0}}' +
        '@keyframes mdok{0%{transform:translateX(0);opacity:1}80%{transform:translateX(120px);opacity:1}100%{transform:translateX(120px);opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.md-c{animation:none}}',
        body),
    };
  },
  // Blood cancers, MPN: two blood vessels. Above, usual blood: a few red cells flowing quickly. Below, thick blood:
  // packed red cells and platelets moving slowly, with a small clot forming at a narrowing. No faces, no numbers.
  'mpn-thick'(l) {
    const t = l === 'bn'
      ? { a: 'পাতলা রক্ত: সহজে চলে', b: 'ঘন রক্ত: ধীরে চলে', clot: 'জমাট',
          cap: 'রক্তকণিকা বেশি হলে রক্ত ঘন হয়ে ধীরে চলে, আর জমাট বাঁধার ঝুঁকি বাড়ে। চিকিৎসার লক্ষ্য রক্তকণিকা কমানো আর সেই ঝুঁকি কমানো।' }
      : { a: 'thinner blood: flows easily', b: 'thick blood: flows slowly', clot: 'clot',
          cap: 'With too many blood cells, the blood becomes thick and flows slowly, and the risk of a clot goes up. Treatment aims to bring the counts and that risk down.' };
    const vessel = (y) => `<rect x="14" y="${y}" width="332" height="44" rx="22" fill="${C.roseBg}" stroke="${C.rose}" stroke-width="2"/>`;
    let body = vessel(38) + vessel(132);
    body += T(18, 28, t.a, { a: 'start', size: 12.5, fill: C.muted, w: 700 }) + T(18, 122, t.b, { a: 'start', size: 12.5, fill: C.red, w: 700 });
    body += '<defs><clipPath id="mt2a"><rect x="16" y="40" width="328" height="40" rx="20"/></clipPath><clipPath id="mt2b"><rect x="16" y="134" width="328" height="40" rx="20"/></clipPath></defs><g clip-path="url(#mt2a)"><g class="mt-fast">';
    for (let i = 0; i < 6; i++) body += `<ellipse cx="${30 + i * 60}" cy="60" rx="9" ry="6" fill="${C.red}" opacity=".8"/>`;
    body += '</g></g><g clip-path="url(#mt2b)"><g class="mt-slow">';
    for (let i = 0; i < 26; i++) body += `<ellipse cx="${24 + i * 12 + (i % 2) * 3}" cy="${146 + (i % 3) * 8}" rx="7" ry="5" fill="${C.red}" opacity=".85"/>`;
    for (let i = 0; i < 6; i++) body += `<circle cx="${40 + i * 50}" cy="${150 + (i % 2) * 12}" r="3" fill="#b9a7e8"/>`;
    body += '</g></g>';
    body += `<g class="mt-clot"><circle cx="300" cy="154" r="11" fill="#8b1e2d"/><circle cx="292" cy="150" r="4" fill="#b9a7e8"/><circle cx="306" cy="160" r="4" fill="#b9a7e8"/></g>` +
      T(300, 196, t.clot, { a: 'middle', size: 12, fill: C.red, w: 700 });
    return {
      cap: t.cap,
      svg: svg('mt2', 360, 208, t.cap,
        '.mt-fast{animation:mtf 2.4s linear infinite}@keyframes mtf{from{transform:translateX(-60px)}to{transform:translateX(0)}}' +
        '.mt-slow{animation:mts 9s linear infinite}@keyframes mts{from{transform:translateX(-12px)}to{transform:translateX(0)}}' +
        '.mt-clot{transform-box:fill-box;transform-origin:center;animation:mtc 6s ease-in-out infinite}@keyframes mtc{0%{transform:scale(.4);opacity:.3}60%,100%{transform:scale(1);opacity:1}}' +
        '@media (prefers-reduced-motion:reduce){.mt-fast,.mt-slow,.mt-clot{animation:none}}',
        body),
    };
  },
  // Blood cancers, infection: the white cell count across one round of chemotherapy, as a line that dips into a
  // shaded "low count" window and climbs back. A dot travels the line; while it is in the window a thermometer and a
  // phone light up. No numbers, no days.
  'infection-window'(l) {
    const t = l === 'bn'
      ? { y: 'শ্বেত কণিকা', x: 'কেমোথেরাপির একটা দফা', win: 'কণিকা কম', call: 'জ্বর হলেই ফোন',
          cap: 'প্রতিটা দফার কেমোথেরাপিতে কিছু সময় শ্বেত কণিকা খুব কমে যায়, তখন সংক্রমণের ঝুঁকি সবচেয়ে বেশি। তখন জ্বর বা কাঁপুনি হলে সঙ্গে সঙ্গে হাসপাতালে ফোন করুন।' }
      : { y: 'white cells', x: 'one round of chemotherapy', win: 'low count', call: 'fever? call now',
          cap: 'In each round of chemotherapy there are times when the white cells are very low, and the risk of infection is highest. A fever or shivering then needs a call to the hospital at once.' };
    const path = 'M30 70C90 70 110 72 140 150C160 196 210 196 230 150C258 86 290 72 340 70';
    let body = `<rect x="128" y="120" width="116" height="78" rx="10" fill="${C.roseBg}" stroke="${C.rose}" stroke-dasharray="4 4"/>` +
      T(186, 136, t.win, { a: 'middle', size: 11.5, fill: C.red, w: 700 }) +
      `<path d="M30 206H346M30 206V40" stroke="${C.mintLine}" stroke-width="1.6"/>` +
      T(34, 34, t.y, { a: 'start', size: 12.5, fill: C.muted, w: 600 }) + T(342, 228, t.x, { a: 'end', size: 12, fill: C.muted, w: 600 }) +
      `<path d="${path}" fill="none" stroke="${C.teal}" stroke-width="3" stroke-linecap="round"/>` +
      `<circle r="6" fill="${C.teal2}"><animateMotion dur="7s" repeatCount="indefinite" path="${path}"/></circle>`;
    body += `<g class="iw-a"><rect x="300" y="118" width="8" height="26" rx="4" fill="#fff" stroke="${C.red}" stroke-width="2"/><circle cx="304" cy="148" r="6" fill="${C.red}"/>` +
      T(352, 176, t.call, { a: 'end', size: 12, fill: C.red, w: 700 }) + '</g>';
    return {
      cap: t.cap,
      svg: svg('iw', 360, 240, t.cap,
        '.iw-a{animation:iwa 7s linear infinite}@keyframes iwa{0%,30%{opacity:.15}38%,62%{opacity:1}70%,100%{opacity:.15}}' +
        '@media (prefers-reduced-motion:reduce){.iw-a{animation:none}}',
        body),
    };
  },
  // Anaemia, aplastic: two pieces of marrow side by side. Left, a healthy marrow packed with young cells of three kinds.
  // Right, aplastic anaemia: the same space with only a few cells, which slowly fade and return. No numbers.
  'aplastic-marrow'(l) {
    const t = l === 'bn'
      ? { a: 'সুস্থ মজ্জা', b: 'অ্যাপ্লাস্টিক অ্যানিমিয়া', a2: 'কচি কণিকায় ভরা', b2: 'কোষ খুব কম',
          cap: 'অ্যাপ্লাস্টিক অ্যানিমিয়ায় মজ্জার স্টেম সেল নষ্ট হয়ে যায়, তাই লোহিত কণিকা, শ্বেত কণিকা আর প্লেটলেট তিনটেই কম তৈরি হয়। ম্যারো পরীক্ষায় এটা দেখা যায়।' }
      : { a: 'healthy marrow', b: 'aplastic anaemia', a2: 'full of young cells', b2: 'very few cells',
          cap: 'In aplastic anaemia the stem cells in the marrow are damaged, so too few red cells, white cells and platelets are made. The marrow test shows this.' };
    const kinds = [C.red, '#7A5AD1', '#b9a7e8'];
    let body = `<rect x="14" y="40" width="156" height="150" rx="18" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>` +
      `<rect x="190" y="40" width="156" height="150" rx="18" fill="#fbf6ee" stroke="${C.mintLine}" stroke-width="2"/>`;
    body += T(92, 30, t.a, { a: 'middle', size: 12.5, fill: C.teal2, w: 700 }) + T(268, 30, t.b, { a: 'middle', size: 12.5, fill: C.red, w: 700 });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      body += `<circle cx="${34 + c * 29 + (r % 2) * 6}" cy="${60 + r * 28}" r="7" fill="${kinds[(r + c) % 3]}" opacity=".85"/>`;
    }
    [[220, 80], [300, 120], [250, 160]].forEach(([x, y], i) => {
      body += `<circle class="ap-c" style="animation-delay:${i * 1.2}s" cx="${x}" cy="${y}" r="7" fill="${kinds[i]}"/>`;
    });
    body += T(92, 208, t.a2, { a: 'middle', size: 12, fill: C.muted, w: 600 }) + T(268, 208, t.b2, { a: 'middle', size: 12, fill: C.muted, w: 600 });
    return {
      cap: t.cap,
      svg: svg('ap', 360, 220, t.cap,
        '.ap-c{animation:apc 4s ease-in-out infinite}@keyframes apc{0%,100%{opacity:.9}50%{opacity:.2}}' +
        '@media (prefers-reduced-motion:reduce){.ap-c{animation:none}}',
        body),
    };
  },
  // Haemophilia: two small cuts side by side. Left, clotting factor is there: threads cross the cut and the drops stop.
  // Right, the factor is missing: no threads form and drops keep falling. No faces, no numbers.
  'haemophilia-clot'(l) {
    const t = l === 'bn'
      ? { a: 'ফ্যাক্টর আছে: জমাট বাঁধে', b: 'ফ্যাক্টর কম: রক্ত পড়তেই থাকে',
          cap: 'জমাট বাঁধার ফ্যাক্টর থাকলে কাটা জায়গায় সুতোর মতো জাল তৈরি হয়ে রক্ত থামে। হিমোফিলিয়ায় ফ্যাক্টর কম থাকে, তাই রক্ত পড়া অনেকক্ষণ চলে।' }
      : { a: 'factor present: a clot forms', b: 'factor missing: bleeding goes on',
          cap: 'With clotting factor, threads form across a cut and the bleeding stops. In haemophilia the factor is low, so bleeding goes on for longer.' };
    const skin = (x) => `<rect x="${x}" y="60" width="150" height="34" rx="8" fill="#f3d9c4" stroke="#c99f84" stroke-width="1.5"/><path d="M${x + 55} 60l12 34M${x + 70} 60l12 34" stroke="${C.red}" stroke-width="3"/>`;
    let body = skin(14) + skin(196);
    body += T(89, 40, t.a, { a: 'middle', size: 12, fill: C.teal2, w: 700 }) + T(271, 40, t.b, { a: 'middle', size: 12, fill: C.red, w: 700 });
    body += '<g class="hc-net">';
    for (let i = 0; i < 5; i++) body += `<path d="M${60 + i * 6} 62L${88 - i * 4} 92" stroke="#b07a2a" stroke-width="1.6"/>`;
    body += '</g>';
    body += `<path class="hc-d1" d="M82 98c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z" fill="${C.red}"/>`;
    [0, 1, 2].forEach(i => {
      body += `<path class="hc-d" style="animation-delay:${i * 0.8}s" d="M264 98c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z" fill="${C.red}"/>`;
    });
    return {
      cap: t.cap,
      svg: svg('hc', 360, 190, t.cap,
        '.hc-net{animation:hcn 4s ease-in-out infinite}@keyframes hcn{0%,20%{opacity:0}50%,100%{opacity:1}}' +
        '.hc-d1{animation:hcd1 4s ease-in infinite}@keyframes hcd1{0%{transform:translateY(0);opacity:1}40%{transform:translateY(30px);opacity:0}100%{opacity:0}}' +
        '.hc-d{animation:hcd 2.4s ease-in infinite}@keyframes hcd{0%{transform:translateY(0);opacity:1}100%{transform:translateY(70px);opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.hc-net,.hc-d1,.hc-d{animation:none}}',
        body),
    };
  },
  // Clots: a simple outline of a leg and the lungs joined by a vein. A small clot sits in the calf; a piece breaks off and
  // travels up the vein to the lungs, where a red mark lights up. No faces, no numbers.
  'clot-travel'(l) {
    const t = l === 'bn'
      ? { dvt: 'পায়ে জমাট (ডিভিটি)', pe: 'ফুসফুসে পৌঁছলে (পিই)',
          cap: 'পায়ের গভীরের শিরায় জমাট বাঁধে (ডিভিটি)। তার একটা টুকরো শিরা দিয়ে ফুসফুসে চলে গেলে হয় পালমোনারি এমবোলিজম, যাতে সঙ্গে সঙ্গে হাসপাতাল দরকার।' }
      : { dvt: 'clot in the leg (DVT)', pe: 'reaches the lungs (PE)',
          cap: 'A clot forms in a deep vein of the leg (DVT). If a piece travels up the vein to the lungs, it becomes a pulmonary embolism, which needs a hospital at once.' };
    let body = `<path d="M120 60c-30 0-44 20-44 52s10 50 30 50c14 0 18-12 18-30V72c0-8-2-12-4-12z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>` +
      `<path d="M140 60c30 0 44 20 44 52s-10 50-30 50c-14 0-18-12-18-30V72c0-8 2-12 4-12z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>` +
      `<g class="ct-hit"><circle cx="160" cy="112" r="9" fill="${C.red}" opacity=".85"/></g>`;
    body += `<path d="M252 196c-6 30-8 60-6 90" stroke="#f3d9c4" stroke-width="34" stroke-linecap="round" fill="none"/>` +
      `<path d="M252 300V196C252 150 232 120 196 112" stroke="${C.rose}" stroke-width="5" fill="none"/>` +
      `<ellipse cx="252" cy="262" rx="7" ry="12" fill="#8b1e2d"/>`;
    body += `<circle r="5" fill="#8b1e2d"><animateMotion dur="4s" repeatCount="indefinite" path="M252 250V196C252 150 232 120 166 112"/></circle>`;
    body += T(226, 266, t.dvt, { a: 'end', size: 12, fill: C.red, w: 700 }) + T(130, 186, t.pe, { a: 'middle', size: 12, fill: C.red, w: 700 });
    return {
      cap: t.cap,
      svg: svg('ct', 360, 320, t.cap,
        '.ct-hit{animation:cth 4s linear infinite}@keyframes cth{0%,80%{opacity:.15}90%,100%{opacity:1}}' +
        '@media (prefers-reduced-motion:reduce){.ct-hit{animation:none}}',
        body),
    };
  },
  // Sickle cell: two small blood vessels side by side. In the top one, round soft red cells flow through. In the
  // bottom one, stiff curved sickle cells pile up at a narrow point and the flow stops. No faces, no numbers.
  'sickle-block'(l) {
    const t = l === 'bn'
      ? { ok: 'গোল নরম কণিকা সহজে চলে', bad: 'কাস্তের মতো শক্ত কণিকা আটকে যায়',
          cap: 'সাধারণত লোহিত কণিকা গোল আর নরম, সরু রক্তনালি দিয়ে সহজে চলে যায়। সিকল সেল ডিজিজে কণিকা শক্ত হয়ে বেঁকে যায়, সরু জায়গায় আটকে রক্ত চলাচল বন্ধ করে, তাতে ব্যথা হয়।' }
      : { ok: 'round, soft cells flow through', bad: 'stiff sickle cells get stuck',
          cap: 'Red blood cells are usually round and soft, and slip through narrow vessels. In sickle cell disease they become stiff and curved, get stuck at narrow points and block the blood flow, which causes pain.' };
    const vessel = y => `<path d="M20 ${y - 22}H200C240 ${y - 22} 260 ${y - 10} 290 ${y - 10}H340M20 ${y + 22}H200C240 ${y + 22} 260 ${y + 10} 290 ${y + 10}H340" stroke="${C.rose}" stroke-width="4" fill="none"/>` +
      `<path d="M20 ${y - 20}H200C240 ${y - 20} 260 ${y - 8} 290 ${y - 8}H340V${y + 8}H290C260 ${y + 8} 240 ${y + 20} 200 ${y + 20}H20z" fill="${C.roseBg}"/>`;
    let body = vessel(60) + vessel(170);
    body += '<g class="sb-flow">' + [40, 100, 160, 220, 280, 340, 400].map(x =>
      `<ellipse cx="${x}" cy="60" rx="11" ry="9" fill="${C.red}" opacity=".85"/>`).join('') + '</g>';
    const sickle = (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-14 4C-8 -10 8 -10 14 4C8 -3 -8 -3 -14 4z" fill="#8b1e2d"/>`;
    body += sickle(250, 168, 10) + sickle(236, 174, -20) + sickle(222, 165, 25) + sickle(206, 176, -5) + sickle(190, 166, 15) + sickle(172, 174, -25) +
      `<ellipse cx="140" cy="170" rx="11" ry="9" fill="${C.red}" opacity=".6"/><ellipse cx="110" cy="166" rx="11" ry="9" fill="${C.red}" opacity=".6"/>` +
      `<g class="sb-pain"><circle cx="276" cy="170" r="14" fill="none" stroke="${C.amber}" stroke-width="3"/></g>`;
    body += T(20, 24, t.ok, { a: 'start', size: 12, fill: C.teal, w: 700 }) + T(20, 134, t.bad, { a: 'start', size: 12, fill: C.red, w: 700 });
    return {
      cap: t.cap,
      svg: svg('sb', 360, 210, t.cap,
        '.sb-flow{animation:sbf 4s linear infinite}@keyframes sbf{from{transform:translateX(-60px)}to{transform:translateX(0)}}' +
        '.sb-pain{animation:sbp 2s ease-in-out infinite}@keyframes sbp{0%,100%{opacity:.2}50%{opacity:1}}' +
        '@media (prefers-reduced-motion:reduce){.sb-flow,.sb-pain{animation:none}}',
        body),
    };
  },
  // Pregnancy: a simple line across the months of pregnancy with four check-up dots. A drop at each dot is a
  // haemoglobin test; a small tag near the start is the carrier test; a band from the fourth month is iron tablets.
  'pregnancy-checks'(l) {
    const t = l === 'bn'
      ? { hb: 'প্রতিটা চেকআপে হিমোগ্লোবিন পরীক্ষা', carrier: 'শুরুতেই বাহক পরীক্ষা', iron: 'দ্বিতীয় তিন মাস থেকে আয়রন-ফলিক অ্যাসিড', start: 'শুরু', birth: 'প্রসব',
          cap: 'অ্যানিমিয়া মুক্ত ভারত কর্মসূচিতে গর্ভাবস্থার প্রতিটা চেকআপে, অন্তত চারবার, হিমোগ্লোবিন পরীক্ষা হয়। বাহক পরীক্ষা শুরুতেই করানো ভালো, আর দ্বিতীয় তিন মাস থেকে আয়রন-ফলিক অ্যাসিড ট্যাবলেট দেওয়া হয়।' }
      : { hb: 'haemoglobin test at every check-up', carrier: 'carrier test early', iron: 'iron and folic acid from the second three months', start: 'start', birth: 'birth',
          cap: 'Under the Anemia Mukt Bharat programme, haemoglobin is tested at every pregnancy check-up, at least four times. The carrier test is best done early, and iron and folic acid tablets are given from the second three months.' };
    const drop = x => `<path d="M${x} 64c-6 9-9 13-9 17a9 9 0 0 0 18 0c0-4-3-8-9-17z" fill="${C.red}" opacity=".85"/>`;
    let body = `<path d="M30 110H330" stroke="${C.teal2}" stroke-width="4" stroke-linecap="round"/>` +
      `<rect x="120" y="128" width="210" height="14" rx="7" fill="${C.mint}" stroke="${C.mintLine}" stroke-width="1.5"/>` +
      `<rect x="38" y="132" width="40" height="30" rx="6" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="1.5"/>`;
    body += [70, 160, 240, 300].map((x, i) => `<g class="pc-d pc-d${i}">${drop(x)}<circle cx="${x}" cy="110" r="7" fill="#fff" stroke="${C.teal}" stroke-width="3"/></g>`).join('');
    body += T(30, 30, t.hb, { a: 'start', size: 12.5, fill: C.red, w: 700 }) +
      T(30, 182, t.carrier, { a: 'start', size: 12.5, fill: C.amber, w: 700 }) +
      T(330, 160, t.iron, { a: 'end', size: 12.5, fill: C.teal, w: 700 }) +
      T(30, 100, t.start, { a: 'start', size: 12.5, fill: C.muted }) + T(330, 100, t.birth, { a: 'end', size: 12.5, fill: C.muted });
    return {
      cap: t.cap,
      svg: svg('pc', 360, 200, t.cap,
        '.pc-d{animation:pcd 6s ease-in-out infinite;opacity:.25}.pc-d1{animation-delay:1.5s}.pc-d2{animation-delay:3s}.pc-d3{animation-delay:4.5s}' +
        '@keyframes pcd{0%,10%{opacity:.25}20%,60%{opacity:1}80%,100%{opacity:.25}}' +
        '@media (prefers-reduced-motion:reduce){.pc-d{animation:none;opacity:1}}',
        body),
    };
  },
  // Transplant: four steps in a two-by-two grid, lit one after another. Collect the stem cells, conditioning,
  // the cells go in through a thin tube like a transfusion, the new marrow grows over weeks. No faces, no numbers.
  'transplant-steps'(l) {
    const t = l === 'bn'
      ? { s: [['এক', 'স্টেম সেল সংগ্রহ', 'নিজের বা দাতার রক্ত থেকে'], ['দুই', 'কন্ডিশনিং', 'কেমো বা রেডিওথেরাপি'], ['তিন', 'নল দিয়ে কোষ', 'রক্ত দেওয়ার মতো, ব্যথা নেই'], ['চার', 'নতুন ম্যারো', 'কয়েক সপ্তাহে বাড়ে']],
          cap: 'ট্রান্সপ্লান্টের চার ধাপ: স্টেম সেল সংগ্রহ, কেমোথেরাপি বা রেডিওথেরাপি দিয়ে কন্ডিশনিং, সরু নল দিয়ে রক্তে কোষ দেওয়া, আর কয়েক সপ্তাহ ধরে নতুন ম্যারো বেড়ে ওঠা। পুরো সেরে উঠতে এক বছর পর্যন্ত লাগতে পারে।' }
      : { s: [['1', 'Collect the stem cells', "from own or donor's blood"], ['2', 'Conditioning', 'chemo or radiotherapy'], ['3', 'Cells through a tube', 'like a transfusion, no pain'], ['4', 'New marrow grows', 'over several weeks']],
          cap: 'The four steps of a transplant: collecting the stem cells, conditioning with chemotherapy or radiotherapy, giving the cells into the blood through a thin tube, and the new marrow growing over several weeks. Full recovery can take up to a year.' };
    const icon = [
      (x, y) => `<path d="M${x} ${y - 12}c-6 9-9 13-9 17a9 9 0 0 0 18 0c0-4-3-8-9-17z" fill="${C.red}" opacity=".85"/>`,
      (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2.5"/><path d="M${x - 6} ${y}h12M${x} ${y - 6}v12" stroke="${C.amber}" stroke-width="2.5"/>`,
      (x, y) => `<rect x="${x - 7}" y="${y - 14}" width="14" height="18" rx="3" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M${x} ${y + 4}v10" stroke="${C.teal2}" stroke-width="2.5"/>`,
      (x, y) => [[-7, -4], [6, -6], [0, 6], [-9, 8], [9, 6]].map(([a, b]) => `<circle cx="${x + a}" cy="${y + b}" r="4.5" fill="${C.red}" opacity=".8"/>`).join(''),
    ];
    let body = '';
    t.s.forEach(([n, h, sub], i) => {
      const x = 14 + (i % 2) * 172, y = 12 + Math.floor(i / 2) * 104;
      body += `<g class="tp-s tp-s${i}"><rect x="${x}" y="${y}" width="160" height="92" rx="12" fill="#fff" stroke="${C.teal2}" stroke-width="2"/>` +
        `<rect x="${x + 8}" y="${y + 8}" width="${l === 'bn' ? 36 : 24}" height="24" rx="12" fill="${C.teal}"/>` + T(x + (l === 'bn' ? 26 : 20), y + 24.5, n, { a: 'middle', size: 12.5, fill: '#fff', w: 700 }) +
        icon[i](x + 134, y + 26) + T(x + 12, y + 58, h, { a: 'start', size: 12.5, fill: C.ink, w: 700 }) + T(x + 12, y + 78, sub, { a: 'start', size: 12.5, fill: C.muted }) + '</g>';
    });
    return {
      cap: t.cap,
      svg: svg('tp', 360, 220, t.cap,
        '.tp-s{animation:tps 8s ease-in-out infinite;opacity:.35}.tp-s1{animation-delay:2s}.tp-s2{animation-delay:4s}.tp-s3{animation-delay:6s}' +
        '@keyframes tps{0%,5%{opacity:.35}12%,40%{opacity:1}50%,100%{opacity:.35}}' +
        '@media (prefers-reduced-motion:reduce){.tp-s{animation:none;opacity:1}}',
        body),
    };
  },
  // Transfusion: a drip bag on a stand with a line to an arm. Three checks light up in turn beside it: the blood
  // sample that matches the group, the signature, and pulse, temperature and blood pressure. No numbers.
  'transfusion-steps'(l) {
    const t = l === 'bn'
      ? { s: ['রক্তের নমুনায় গ্রুপ মেলানো', 'সম্মতিপত্রে সই', 'পালস, টেম্পারেচার, প্রেশার দেখা', 'খারাপ লাগলে তখনই নার্সকে বলুন'],
          cap: 'রক্ত দেওয়ার আগে নমুনা নিয়ে গ্রুপ মেলানো হয় আর সাধারণত সম্মতিপত্রে সই নেওয়া হয়। আগে, মাঝে আর পরে পালস, টেম্পারেচার আর ব্লাড প্রেশার দেখা হয়। খারাপ লাগলে তখনই নার্সকে বলুন।' }
      : { s: ['a blood sample to match the group', 'a consent form', 'pulse, temperature, blood pressure', 'feel unwell? tell the nurse at once'],
          cap: 'Before a transfusion, a blood sample is taken to match the group, and a consent form is usually signed. Pulse, temperature and blood pressure are checked before, during and after. If you feel unwell, tell the nurse at once.' };
    let body = `<path d="M70 20V200M50 200h40M70 24h30" stroke="${C.muted}" stroke-width="3" fill="none"/>` +
      `<rect x="86" y="28" width="30" height="46" rx="8" fill="${C.roseBg}" stroke="${C.red}" stroke-width="2.5"/><rect x="90" y="44" width="22" height="26" rx="5" fill="${C.red}" opacity=".85"/>` +
      `<path d="M101 74v20c0 30-10 50-40 60" stroke="${C.red}" stroke-width="2.5" fill="none"/>` +
      `<path d="M20 160c20-6 30-6 46-4l40 8" stroke="#f3d9c4" stroke-width="22" stroke-linecap="round" fill="none"/>` +
      `<circle class="tf-drop" cx="101" cy="80" r="3.5" fill="${C.red}"/>`;
    t.s.forEach((x, i) => {
      const y = 40 + i * 44, warn = i === 3;
      body += `<g class="tf-c tf-c${i}"><circle cx="150" cy="${y}" r="10" fill="${warn ? C.amberBg : C.mint}" stroke="${warn ? C.amber : C.teal}" stroke-width="2.5"/>` +
        (warn ? T(150, y + 4.5, '!', { a: 'middle', size: 12.5, fill: C.amber, w: 700 }) : `<path d="M145 ${y}l4 4 7-8" stroke="${C.teal}" stroke-width="2.5" fill="none"/>`) +
        T(168, y + 4.5, x, { a: 'start', size: 12.5, fill: warn ? C.amber : C.ink, w: warn ? 700 : 400 }) + '</g>';
    });
    return {
      cap: t.cap,
      svg: svg('tf', 360, 220, t.cap,
        '.tf-drop{animation:tfd 2s ease-in infinite}@keyframes tfd{0%{transform:translateY(0);opacity:1}100%{transform:translateY(16px);opacity:0}}' +
        '.tf-c{animation:tfc 8s ease-in-out infinite;opacity:.35}.tf-c1{animation-delay:2s}.tf-c2{animation-delay:4s}.tf-c3{animation-delay:6s}' +
        '@keyframes tfc{0%,5%{opacity:.35}12%,45%{opacity:1}55%,100%{opacity:.35}}' +
        '@media (prefers-reduced-motion:reduce){.tf-drop,.tf-c{animation:none;opacity:1}}',
        body),
    };
  },
  // Donation: four steps in a row of rounded cards, lit one after another: the questions, the quick check (a drop
  // from the fingertip), about ten minutes in the chair with a sealed needle, then rest and a drink. No numbers.
  'donation-steps'(l) {
    const t = l === 'bn'
      ? { s: [['প্রশ্ন', 'শরীর, ওষুধ, যাতায়াত'], ['ছোট পরীক্ষা', 'প্রেশার, ওজন, এক ফোঁটা রক্ত'], ['রক্ত দেওয়া', 'মিনিট দশেক, নতুন সুচ'], ['বিশ্রাম', 'একটু খাবার আর জল']],
          cap: 'রক্ত দেওয়ার চার ধাপ: শরীর নিয়ে প্রশ্ন, প্রেশার, ওজন আর এক ফোঁটা রক্তের ছোট পরীক্ষা, মিনিট দশেক রক্ত দেওয়া নতুন জীবাণুমুক্ত সুচে, তারপর একটু বিশ্রাম আর খাবার-জল।' }
      : { s: [['Questions', 'health, medicines, travel'], ['A quick check', 'pressure, weight, a drop'], ['Giving blood', 'ten minutes, new needle'], ['Rest', 'a drink and a snack']],
          cap: 'The four steps of giving blood: questions about your health, a quick check of blood pressure, weight and a drop of blood, about ten minutes giving blood with a new sterile needle, then a short rest with a drink and a snack.' };
    const icon = [
      (x, y) => `<rect x="${x - 9}" y="${y - 12}" width="18" height="24" rx="3" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><path d="M${x - 5} ${y - 5}h10M${x - 5} ${y}h10M${x - 5} ${y + 5}h6" stroke="${C.teal2}" stroke-width="1.8"/>`,
      (x, y) => `<path d="M${x} ${y - 12}c-6 9-9 13-9 17a9 9 0 0 0 18 0c0-4-3-8-9-17z" fill="${C.red}" opacity=".85"/>`,
      (x, y) => `<rect x="${x - 8}" y="${y - 12}" width="16" height="22" rx="4" fill="${C.roseBg}" stroke="${C.red}" stroke-width="2"/><rect x="${x - 5}" y="${y - 3}" width="10" height="10" rx="2" fill="${C.red}" opacity=".85"/>`,
      (x, y) => `<path d="M${x - 9} ${y - 8}h16v14a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M${x + 7} ${y - 4}h3a3 3 0 0 1 0 6h-3" fill="none" stroke="${C.teal2}" stroke-width="2"/>`,
    ];
    let body = '';
    t.s.forEach(([h, sub], i) => {
      const x = 14 + (i % 2) * 172, y = 12 + Math.floor(i / 2) * 92;
      body += `<g class="dn-s dn-s${i}"><rect x="${x}" y="${y}" width="160" height="80" rx="12" fill="#fff" stroke="${C.teal2}" stroke-width="2"/>` +
        icon[i](x + 26, y + 30) + T(x + 48, y + 30, h, { a: 'start', size: 12.5, fill: C.ink, w: 700 }) + T(x + 12, y + 64, sub, { a: 'start', size: 12.5, fill: C.muted }) + '</g>';
    });
    return {
      cap: t.cap,
      svg: svg('dn', 360, 196, t.cap,
        '.dn-s{animation:dns 8s ease-in-out infinite;opacity:.35}.dn-s1{animation-delay:2s}.dn-s2{animation-delay:4s}.dn-s3{animation-delay:6s}' +
        '@keyframes dns{0%,5%{opacity:.35}12%,45%{opacity:1}55%,100%{opacity:.35}}' +
        '@media (prefers-reduced-motion:reduce){.dn-s{animation:none;opacity:1}}',
        body),
    };
  },
  // Clotting tests: four situations in a two-by-two grid, each with the tests usually asked for, lit in turn.
  // Before an operation; on warfarin; bleeding easily; a clot suspected. No ranges, no numbers, no meanings.
  'coag-tests'(l) {
    const t = l === 'bn'
      ? { s: [['অপারেশনের আগে', 'পিটি, আইএনআর, এপিটিটি', 'সঙ্গে সিবিসি'], ['ওয়ারফারিন খেলে', 'আইএনআর', 'ডাক্তার ঠিক করেন কবে'], ['সহজে রক্ত পড়লে', 'পিটি, এপিটিটি', 'দরকারে ফ্যাক্টর পরীক্ষা'], ['জমাট সন্দেহ হলে', 'ডি-ডাইমার', 'তারপর স্ক্যান']],
          cap: 'কোন অবস্থায় সাধারণত কোন জমাট বাঁধার পরীক্ষা করতে বলা হয়। প্রতিটা রিপোর্ট যিনি পরীক্ষা করতে বলেছেন সেই ডাক্তারকে দেখান, আর রিপোর্ট দেখে নিজে ওষুধ বদলাবেন না।' }
      : { s: [['Before an operation', 'PT, INR, APTT', 'with a blood count'], ['On warfarin', 'INR', 'the doctor decides when'], ['Bleeding easily', 'PT, APTT', 'then factor tests if needed'], ['A clot suspected', 'D-dimer', 'then a scan']],
          cap: 'Which clotting tests are usually asked for in each situation. Show every report to the doctor who asked for it, and never change a medicine because of a report.' };
    const icon = [
      (x, y) => `<path d="M${x - 9} ${y + 8}l14 -14l4 4l-14 14z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M${x + 5} ${y - 6}l4 -4" stroke="${C.teal2}" stroke-width="2.5"/>`,
      (x, y) => `<rect x="${x - 10}" y="${y - 5}" width="20" height="10" rx="5" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M${x} ${y - 5}v10" stroke="${C.teal2}" stroke-width="2"/>`,
      (x, y) => `<path d="M${x} ${y - 11}c-6 9-9 13-9 17a9 9 0 0 0 18 0c0-4-3-8-9-17z" fill="${C.red}" opacity=".85"/>`,
      (x, y) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="11" fill="#8b1e2d"/>`,
    ];
    let body = '';
    t.s.forEach(([h, tests, sub], i) => {
      const x = 14 + (i % 2) * 172, y = 12 + Math.floor(i / 2) * 104;
      body += `<g class="cg-s cg-s${i}"><rect x="${x}" y="${y}" width="160" height="92" rx="12" fill="#fff" stroke="${C.teal2}" stroke-width="2"/>` +
        icon[i](x + 136, y + 24) + T(x + 12, y + 26, h, { a: 'start', size: 12.5, fill: C.ink, w: 700 }) +
        T(x + 12, y + 56, tests, { a: 'start', size: 12.5, fill: C.teal, w: 700 }) + T(x + 12, y + 78, sub, { a: 'start', size: 12.5, fill: C.muted }) + '</g>';
    });
    return {
      cap: t.cap,
      svg: svg('cg', 360, 220, t.cap,
        '.cg-s{animation:cgs 8s ease-in-out infinite;opacity:.35}.cg-s1{animation-delay:2s}.cg-s2{animation-delay:4s}.cg-s3{animation-delay:6s}' +
        '@keyframes cgs{0%,5%{opacity:.35}12%,45%{opacity:1}55%,100%{opacity:.35}}' +
        '@media (prefers-reduced-motion:reduce){.cg-s{animation:none;opacity:1}}',
        body),
    };
  },
  // Anaemia, iron: two tanks of body iron. Tablets drip iron into both. In the first, a leak (heavy periods or
  // bleeding) lets it out, so the level hardly rises; in the second the leak is treated and the level slowly rises.
  'iron-tank'(l) {
    const t = l === 'bn'
      ? { a: 'কারণের চিকিৎসা হয়নি', b: 'কারণের চিকিৎসা হয়েছে', drip: 'আয়রন ট্যাবলেট', leak: 'বেশি মাসিক বা রক্তপাত', iron: 'আয়রন',
          cap: 'আয়রন ট্যাবলেট শরীরে আয়রন ভরে। কিন্তু বেশি মাসিক বা অন্য রক্তপাতে আয়রন বেরিয়ে যেতে থাকলে মাপ প্রায় বাড়ে না। কারণের চিকিৎসা হলে সেই ট্যাবলেটেই কয়েক মাসে আয়রন ভরে উঠতে পারে। ছবিতে কোনো আসল মাপ নেই।' }
      : { a: 'leak not treated', b: 'leak treated', drip: 'iron tablets', leak: 'heavy periods or bleeding', iron: 'iron',
          cap: 'Iron tablets put iron in. If iron keeps leaking out, with heavy periods or other bleeding, the level hardly rises. Once the leak is treated, the same tablets can fill the store over some months. The drawing has no real numbers.' };
    const pill = (x) => `<g transform="translate(${x},28)"><rect x="-12" y="-7" width="24" height="14" rx="7" fill="#fff" stroke="${C.red}" stroke-width="2"/><rect x="-12" y="-7" width="12" height="14" rx="7" fill="${C.red}"/></g>`;
    const drops = (x) => [0, 1, 2].map((i) => `<circle class="it-d" cx="${x}" cy="44" r="4" fill="${C.red}" style="animation-delay:${(i * 0.9).toFixed(1)}s"/>`).join('');
    const tank = (x) => `<path d="M${x - 46} 70v84a14 14 0 0 0 14 14h64a14 14 0 0 0 14-14V70" fill="#fff" stroke="${C.mintLine}" stroke-width="2.5"/>`;
    const clip = (x, id) => `<clipPath id="${id}"><path d="M${x - 45} 71v83a13 13 0 0 0 13 13h64a13 13 0 0 0 13-13V71z"/></clipPath>`;
    const A = 92, B = 268;
    const body =
      `<defs>${clip(A, `it-a-${l}`)}${clip(B, `it-b-${l}`)}</defs>` +
      T(180, 14, t.drip, { size: 12.5, fill: C.muted, w: 600 }) +
      pill(A) + pill(B) + drops(A) + drops(B) + tank(A) + tank(B) +
      `<g clip-path="url(#it-a-${l})"><rect x="${A - 50}" y="146" width="100" height="40" fill="${C.roseBg}"/><rect x="${A - 50}" y="146" width="100" height="4" fill="${C.red}" opacity=".55"/></g>` +
      `<g clip-path="url(#it-b-${l})"><g class="it-rise"><rect x="${B - 50}" y="146" width="100" height="140" fill="${C.roseBg}"/><rect x="${B - 50}" y="146" width="100" height="4" fill="${C.red}" opacity=".55"/></g></g>` +
      T(A, 162, t.iron, { size: 12.5, fill: C.red, w: 600 }) + T(B, 162, t.iron, { size: 12.5, fill: C.red, w: 600 }) +
      `<path d="M${A + 46} 156h14v10" fill="none" stroke="${C.muted}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
      [0, 1].map((i) => `<circle class="it-out" cx="${A + 60}" cy="172" r="3.5" fill="${C.red}" style="animation-delay:${(i * 0.9).toFixed(1)}s"/>`).join('') +
      T(A, 194, t.leak, { size: 11.5, fill: C.muted, w: 600 }) +
      `<path d="M${B + 46} 156h14v10" fill="none" stroke="${C.mintLine}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M${B + 54} 174l8 8M${B + 62} 174l-8 8" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/>` +
      T(A, 216, t.a, { size: 13.5, fill: C.red, w: 700 }) + T(B, 216, t.b, { size: 13.5, fill: C.teal2, w: 700 });
    return {
      cap: t.cap,
      svg: svg('it', 360, 226, t.cap,
        '.it-d{animation:itdrop 2.7s ease-in infinite;opacity:0}@keyframes itdrop{0%{transform:translateY(0);opacity:0}10%{opacity:1}80%{opacity:1}100%{transform:translateY(96px);opacity:0}}' +
        '.it-out{animation:itout 1.8s ease-in infinite;opacity:0}@keyframes itout{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(14px);opacity:0}}' +
        '.it-rise{animation:itrise 10s ease-in-out infinite}@keyframes itrise{0%{transform:translateY(0)}85%,100%{transform:translateY(-58px)}}' +
        '@media (prefers-reduced-motion:reduce){.it-d,.it-out{animation:none;opacity:0}.it-rise{animation:none;transform:translateY(-58px)}}',
        body),
    };
  },
  // Blood report (CBC): twenty healthy people appear one by one against a lab's range; one of them lands just
  // outside it, marked H, to show why one letter on a report is often nothing.
  'cbc-twenty'(l) {
    const t = l === 'bn'
      ? { band: 'ল্যাবের স্বাভাবিক মাত্রা', one: 'সুস্থ, তবু H', heal: 'কুড়িজন সুস্থ মানুষ',
          cap: 'ল্যাব এমনভাবে মাত্রা ঠিক করে যাতে বেশিরভাগ সুস্থ মানুষ তার মধ্যে পড়েন। মোটামুটি কুড়িজনে একজন সুস্থ মানুষ তবু বাইরে পড়েন। তাই একটা H বা L মানেই অসুখ নয়, ডাক্তারবাবু পুরো রিপোর্ট দেখে বলবেন। ছবিতে কোনো আসল মাপ নেই।' }
      : { band: "the lab's normal range", one: 'healthy, still H', heal: 'twenty healthy people',
          cap: 'A lab sets its range so that most healthy people fall inside it. About one healthy person in twenty still falls outside. So one H or L does not by itself mean illness; the doctor reads the whole report. The drawing has no real numbers.' };
    const ys = [104, 88, 120, 96, 112, 80, 126, 100, 92, 116, 84, 108, 122, 90, 102, 118, 86, 110, 98, 50];
    let dots = '';
    ys.forEach((y, i) => {
      const x = 32 + i * 15.5, out = i === ys.length - 1;
      dots += `<circle class="ct-p" cx="${x}" cy="${y}" r="${out ? 6.5 : 5.5}" fill="${out ? C.red : C.teal2}" style="animation-delay:${(i * 0.35).toFixed(2)}s"/>`;
    });
    const xo = 32 + 19 * 15.5;
    const body =
      `<rect x="20" y="70" width="320" height="66" rx="12" fill="${C.mint}" stroke="${C.mintLine}" stroke-width="2"/>` +
      T(26, 154, t.band, { a: 'start', size: 12.5, fill: C.teal2, w: 600 }) +
      T(26, 172, t.heal, { a: 'start', size: 12.5, fill: C.muted, w: 500 }) + dots +
      `<g class="ct-l"><path d="M${xo} 42v-14" stroke="${C.red}" stroke-width="1.6"/>` + T(xo, 22, t.one, { a: 'end', size: 12.5, fill: C.red, w: 700 }) + '</g>';
    return {
      cap: t.cap,
      svg: svg('ct', 360, 182, t.cap,
        '.ct-p{animation:ctin 9s ease-out infinite;opacity:0}@keyframes ctin{0%{opacity:0;transform:translateY(-8px)}6%,92%{opacity:1;transform:none}100%{opacity:0}}' +
        '.ct-l{animation:ctl 9s ease-in-out infinite;opacity:0}@keyframes ctl{0%,74%{opacity:0}80%,92%{opacity:1}100%{opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.ct-p,.ct-l{animation:none;opacity:1}}',
        body),
    };
  },
  // Anaemia, school and anganwadi test: the programme's four steps (test, iron, talk, retest) light up in turn,
  // and an arrow loops back from the retest, because the child is followed until the anaemia has gone.
  'school-track'(l) {
    const t = l === 'bn'
      ? { h: 'অ্যানিমিয়া মুক্ত ভারতের চারটে ধাপ', s: [['পরীক্ষা', 'আঙুলে এক ফোঁটা'], ['আয়রন', 'যেমন বলেছে'], ['কথা', 'টিচার, কর্মী'], ['আবার পরীক্ষা', 'তারিখ মেনে']], back: 'অ্যানিমিয়া না সারা পর্যন্ত',
          cap: 'আঙুলে এক ফোঁটা রক্তে পরীক্ষা, স্বাস্থ্যকর্মী যেভাবে বলেছেন সেভাবে আয়রন, কোনো অসুবিধা হলে টিচার বা স্বাস্থ্যকর্মীকে জানানো, আর দেওয়া তারিখে আবার পরীক্ষা। ঠিকমতো খেয়েও হিমোগ্লোবিন না বাড়লে কারণ খুঁজতে বাচ্চাকে বড় হাসপাতালে পাঠানো হয়।' }
      : { h: "The programme's four steps", s: [['test', 'finger-prick'], ['iron', 'as advised'], ['talk', 'teacher, worker'], ['retest', 'on the date']], back: 'until the anaemia has gone',
          cap: 'A finger-prick test, iron given the way the health worker explains, telling the teacher or health worker about any trouble, and a retest on the date given. If the hemoglobin has not risen though the iron was taken well, the child is sent to a bigger hospital to find out why.' };
    const X = [52, 140, 228, 316], Y = 80;
    const icon = [
      `<path d="M0-15c6 8 10 13 10 18a10 10 0 0 1-20 0c0-5 4-10 10-18z" fill="${C.red}"/><circle cx="-3" cy="4" r="3" fill="${C.rose}"/>`,
      `<g transform="rotate(-30)"><rect x="-15" y="-7" width="30" height="14" rx="7" fill="#fff" stroke="${C.o2}" stroke-width="2.2"/><rect x="-15" y="-7" width="15" height="14" rx="7" fill="${C.o2}"/></g>`,
      `<rect x="-16" y="-14" width="22" height="15" rx="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><rect x="-4" y="-2" width="20" height="14" rx="6" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/>`,
      `<rect x="-14" y="-13" width="28" height="26" rx="4" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><rect x="-14" y="-13" width="28" height="7" rx="3" fill="${C.teal2}"/><circle cx="4" cy="4" r="5.5" fill="none" stroke="${C.red}" stroke-width="2"/>`,
    ];
    let body = T(180, 16, t.h, { size: 13, fill: C.muted, w: 600 }) +
      `<path d="M${X[0]} ${Y}H${X[3]}" stroke="${C.mintLine}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>` +
      `<circle class="st-dot" cx="${X[0]}" cy="${Y}" r="5" fill="${C.teal2}"/>`;
    X.forEach((x, i) => {
      body += `<circle class="st-r" cx="${x}" cy="${Y}" r="35" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2.5" opacity="0" style="animation-delay:${i * 2}s"/>` +
        `<circle cx="${x}" cy="${Y}" r="29" fill="#fff" stroke="${C.mintLine}" stroke-width="2"/>` +
        `<g transform="translate(${x},${Y})">${icon[i]}</g>` +
        T(x, 136, t.s[i][0], { size: l === 'bn' ? 13 : 14, w: 700, fill: C.teal }) + T(x, 154, t.s[i][1], { size: 12.5, fill: C.muted });
    });
    body += `<g class="st-back"><path d="M${X[3]} 166c0 22-24 28-50 28H102c-26 0-50-6-50-28" fill="none" stroke="${C.teal2}" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M46 172l6-7 6 7" fill="none" stroke="${C.teal2}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` +
      T(180, 212, t.back, { size: 12.5, fill: C.teal2, w: 600 }) + '</g>';
    return {
      cap: t.cap,
      svg: svg('st', 360, 222, t.cap,
        '.st-r{animation:str 8s ease-in-out infinite}@keyframes str{0%{opacity:0}4%,20%{opacity:1}26%,100%{opacity:0}}' +
        `.st-dot{animation:stdot 8s ease-in-out infinite}@keyframes stdot{0%,20%{transform:translateX(0)}25%,45%{transform:translateX(88px)}50%,70%{transform:translateX(176px)}75%,100%{transform:translateX(264px)}}` +
        '.st-back{animation:stb 8s ease-in-out infinite}@keyframes stb{0%,74%{opacity:.15}82%,96%{opacity:1}100%{opacity:.15}}',
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
    const report = `<svg class="tr-rep" viewBox="0 0 300 66" aria-hidden="true" font-family="inherit"><rect x="1" y="1" width="298" height="64" rx="14" fill="#fff" stroke="${C.mintLine}" stroke-width="1.5"/>` +
      T(18, 24, t.rep, { a: 'start', size: 12.5, fill: C.muted, w: 600 }) + `<path d="M18 34h120M18 44h90" stroke="${C.mintLine}" stroke-width="3" stroke-linecap="round" opacity=".7"/>` +
      T(160, 42, t.hb, { a: 'start', size: 14, w: 700, fill: C.ink }) +
      `<rect x="232" y="24" width="56" height="26" rx="13" fill="${C.roseBg}" stroke="${C.red}" stroke-width="1.5"/>` + T(252, 42, t.low, { size: 13.5, w: 700, fill: C.red }) +
      `<path d="M272 31v11M268 38l4 4 4-4" fill="none" stroke="${C.red}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${face[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl>` +
      `<dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd>` +
      `<dt>${esc(t.rows[2])}</dt><dd><span class="tr-badge tr-${x[4]}">${esc(x[3])}</span></dd></dl></div>`).join('');
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

  // Thalassemia, blood transfusion: the reader makes the father's choices (keep the date or push it back) and the
  // marrow "factory" and the blood level answer. Keeping a date lets the factory rest again; each delay works it harder.
  'keep-the-date'(l) {
    const t = l === 'bn'
      ? { h: 'তারিখ রাখবেন, না পিছোবেন?', sub: 'মেয়েটির বাবার জায়গায় আপনি বেছে নিন, আর হাড়ের ভিতরের কারখানাটা দেখুন।',
          keep: 'তারিখ রাখুন', push: 'পিছিয়ে দিন', next: 'এরপর', again: 'আবার শুরু', blood: 'রক্ত', bone: 'হাড়ের ভিতরের কারখানা',
          st: ['বিশ্রামে', 'বেশি খাটছে', 'পাগলের মতো খাটছে'],
          q: ['মেয়ের পরীক্ষা পড়েছে ঠিক রক্ত নেওয়ার সপ্তাহে, আর তাকে দিব্যি দেখাচ্ছে।', 'তারপর নতুন তারিখেই পড়ল এক আত্মীয়ের বিয়ে।'],
          s: ['রক্ত সময়মতো আসে। হিমোগ্লোবিন থাকে ডাক্তার যেখানে চান সেখানে, আর হাড়ের ভিতরের কারখানা বিশ্রাম পায়।',
            'হিমোগ্লোবিন কমতেই থাকে। মেয়েকে এখনও ঠিকঠাক দেখায়, কিন্তু হাড়ের ভিতরের কারখানা বেশি খাটতে শুরু করেছে।',
            'এবার ফারাকটা অনেক লম্বা। কারখানা পাগলের মতো খাটছে, আর মেয়ে চুপচাপ হয়ে গেছে, সিঁড়ি ভাঙতে ধীর।'],
          none: 'দুটো তারিখই রেখেছেন, তাই হাড়ের ভিতরের কারখানা বিশ্রাম পেয়েছে।',
          some: 'তারিখ বারবার পিছোলে মাসের পর মাস ধরে ম্যারো হাড় চওড়া করে দেয়, প্লীহা বড় হয়, বাড় কমে যায়। পরীক্ষা বা বিয়ের কথা মাথায় রেখে ডাক্তারবাবু আগে থেকেই তারিখ ঠিক করে দিতে পারেন, তাই জিজ্ঞেস করুন।',
          endnote: 'শেষে মেয়েটির বাবা যেমন করেছিলেন, তারিখগুলো রান্নাঘরের ক্যালেন্ডারে লিখে রাখুন।',
          cap: 'ছবিটা এই আলোচনার কথাটাই দেখায়, কোনো আসল মাপ ছাড়া। দুই বারের মাঝে কতদিনের ফারাক, ডাক্তারবাবু প্রত্যেক বাচ্চার জন্য আলাদা করে ঠিক করেন, প্রতিবার রক্ত দেওয়ার আগে একটা রক্ত পরীক্ষা করে।' }
      : { h: 'Keep the date, or push it back?', sub: "Make her father's choices, and watch the factory in her bones.",
          keep: 'Keep the date', push: 'Push it back', next: 'Next', again: 'Start again', blood: 'blood', bone: 'the factory inside the bone',
          st: ['resting', 'working harder', 'in overdrive'],
          q: ['Her exams fall in the week of her transfusion, and she looks well.', "Then a relative's wedding falls on the new date."],
          s: ['The blood comes on time. Her hemoglobin stays where the doctor wants it, and the factory in her bones can rest.',
            'Her hemoglobin keeps falling. She still looks well, but the factory in her bones has started to work harder.',
            'Now the gap is long. The factory is in overdrive, and she is quieter and slower on the stairs.'],
          none: 'You kept both dates, so the factory in her bones could rest.',
          some: 'When dates keep slipping, over months the marrow widens the bones, the spleen grows and growth slows. Her doctor can plan the dates around exams and weddings ahead of time, so ask.',
          endnote: 'Write the dates on the kitchen calendar, as her father did in the end.',
          cap: 'This drawing shows the idea in the chapter, with no real numbers. The doctor works out the gap between transfusions for each child, using a blood test before every one.' };
    const gear = `<g class="kd-gear" transform="translate(70,86)"><circle r="13" fill="${C.teal2}"/>` +
      [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="-3.2" y="-19" width="6.4" height="8" rx="1.6" fill="${C.teal2}" transform="rotate(${a})"/>`).join('') +
      `<circle r="5" fill="#FFF6E8"/></g>`;
    const body =
      `<g fill="#FFF6E8" stroke="#E9D7B9" stroke-width="2"><circle cx="36" cy="60" r="18"/><circle cx="36" cy="108" r="18"/><circle cx="184" cy="60" r="18"/><circle cx="184" cy="108" r="18"/></g>` +
      `<rect x="36" y="63" width="148" height="42" fill="#FFF6E8"/><path d="M53.5 64H166.5M53.5 104H166.5" stroke="#E9D7B9" stroke-width="2"/>` +
      `<g class="kd-smoke"><circle cx="133" cy="50" r="5" fill="#C9C2B6"/><circle cx="138" cy="44" r="6" fill="#C9C2B6" style="animation-delay:-.8s"/><circle cx="144" cy="38" r="7" fill="#C9C2B6" style="animation-delay:-1.6s"/></g>` +
      `<rect x="128" y="56" width="8" height="20" fill="${C.teal}"/><path d="M92 100V78l12-7v7l12-7v7l12-7v29z" fill="${C.teal}"/>` +
      `<rect x="98" y="88" width="7" height="7" rx="1.5" fill="${C.amber}"/><rect x="111" y="88" width="7" height="7" rx="1.5" fill="${C.amber}"/>` + gear +
      T(110, 142, t.bone, { size: 12.5, fill: C.muted }) +
      t.st.map((x, i) => `<g class="kd-st kd-st${i}">${T(110, 162, x, { size: 14, w: 700, fill: i === 0 ? C.teal2 : i === 1 ? '#9A5A0C' : C.red })}</g>`).join('') +
      `<clipPath id="kd-clip-${l}"><rect x="262" y="26" width="34" height="114" rx="17"/></clipPath>` +
      `<rect x="262" y="26" width="34" height="114" rx="17" fill="#fff"/><g clip-path="url(#kd-clip-${l})"><rect x="262" y="40" width="34" height="30" fill="${C.mint}"/>` +
      `<rect class="kd-lvl" x="262" y="26" width="34" height="140" fill="${C.red}" opacity=".9"/></g>` +
      `<rect x="262" y="26" width="34" height="114" rx="17" fill="none" stroke="${C.mintLine}" stroke-width="2"/>` +
      T(279, 18, t.blood, { size: 12.5, fill: C.muted, w: 600 }) +
      `<path d="M300 55h5" stroke="${C.teal2}" stroke-width="2"/>` + T(308, 59.5, l === 'bn' ? 'লক্ষ্য' : 'target', { a: 'start', size: 12.5, fill: C.teal2, w: 600 });
    const svgx = `<svg class="figsvg" viewBox="0 0 360 172" role="img" aria-label="${attr(t.cap)}" font-family="inherit"><style>` +
      `.kd-gear{transform-box:fill-box;transform-origin:center;animation:kdspin var(--spin,6s) linear infinite}@keyframes kdspin{to{transform:translate(70px,86px) rotate(360deg)}from{transform:translate(70px,86px) rotate(0)}}` +
      `.kd-smoke{opacity:0;transition:opacity .6s}.kd[data-s="1"] .kd-smoke{opacity:.5}.kd[data-s="2"] .kd-smoke{opacity:1}` +
      `.kd-smoke circle{animation:kdsmoke 2.4s ease-out infinite}@keyframes kdsmoke{0%{transform:translateY(6px);opacity:0}30%{opacity:1}100%{transform:translateY(-10px);opacity:0}}` +
      `.kd-lvl{transform:translateY(var(--drop,22px));transition:transform 1s cubic-bezier(.2,.7,.2,1)}` +
      `.kd-st{display:none}.kd[data-s="0"] .kd-st0,.kd[data-s="1"] .kd-st1,.kd[data-s="2"] .kd-st2{display:inline}` +
      `@media (prefers-reduced-motion:reduce){.kd-gear{animation:none}.kd-smoke circle{animation:none}.kd-lvl{transition:none}}</style>${body}</svg>`;
    const cards = t.q.map((q, i) => `<div class="tm-card"${i ? ' hidden' : ''}><p class="tm-q">${esc(q)}</p>` +
      `<div class="tm-ch">${btn('tm-a', t.keep, ' data-c="keep"')}${btn('tm-b', t.push, ' data-c="push"')}</div>` +
      `<div class="tm-fb" hidden><p class="tm-why"></p>${btn('tm-next', t.next)}</div></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p>${svgx}${cards}` +
      `<div class="tm-end" hidden><p class="tm-score" aria-live="polite"></p><p class="tm-endnote">${esc(t.endnote)}</p>${btn('tm-again', t.again)}</div>`;
    return { cap: t.cap, cls: 'kd', data: { s0: t.s[0], s1: t.s[1], s2: t.s[2], none: t.none, some: t.some }, html };
  },

  // Thalassemia, why regular care matters: the stops on a check-up day; tap one to see what it looks for and why.
  'checkup-day'(l) {
    const t = l === 'bn'
      ? { h: 'চেক-আপের দিন', sub: 'প্রতিটা ধাপে চাপ দিয়ে দেখুন, সেটা কী খোঁজে।', pick: 'উপরে একটা ধাপ বেছে নিন।',
          rows: ['কী খোঁজে', 'বাচ্চা ভালো থাকলেও কেন দরকার'],
          p: [['হার্টের স্ক্যান', 'হৃৎপিণ্ডের পেশিতে আয়রন জমেছে কিনা, আর হৃৎপিণ্ড কতটা ভালো পাম্প করছে।', 'কোনো কষ্ট হওয়ার বহু বছর আগে থেকেই হৃৎপিণ্ডে আয়রন জমতে পারে। গোড়ায় ধরা পড়লে সময় থাকতেই ওষুধ বদলানো যায়।'],
            ['লিভার', 'লিভারে আয়রন কতটা, আর লিভার কেমন কাজ করছে।', 'লিভারেও আয়রন জমে, আর প্রথম কয়েক বছর সেখানকার গোলমাল সাধারণত কোনো জানান দেয় না।'],
            ['উচ্চতা আর বাড়', 'আগের বারের পর বাচ্চা কতটা লম্বা হল, আর বয়ঃসন্ধির লক্ষণ।', 'গ্রন্থিতে আয়রন জমলে বাড় কমে যেতে পারে, বয়ঃসন্ধি পিছিয়ে যেতে পারে। চার্টে একটা ধীর বছরই প্রায়ই প্রথম সংকেত।'],
            ['হরমোনের পরীক্ষা', 'যে গ্রন্থিগুলো বাড়, বয়ঃসন্ধি, রক্তের সুগার আর থাইরয়েড চালায়।', 'আয়রন এই গ্রন্থিগুলোর ক্ষতি করে চুপিচুপি। গোলমাল ধরা পড়লে তার চিকিৎসা আছে।'],
            ['আয়রনের মাত্রা', 'শরীরের আয়রন বাড়ছে, না কমছে।', 'আয়রন বের করার ওষুধ ঠিকঠাক কাজ করছে কিনা, আর কখন সেটা বদলানো দরকার, ডাক্তারবাবু তা বুঝতে পারেন।']],
          cap: 'কোন পরীক্ষা, কতদিন অন্তর, তা আপনার বাচ্চার হেমাটোলজিস্ট ঠিক করেন, আর বয়সের সঙ্গে সেটা বদলায়।' }
      : { h: 'The check-up day', sub: 'Tap each stop to see what it looks for.', pick: 'Choose a stop above.',
          rows: ['What it looks for', 'Why it matters when your child feels fine'],
          p: [['Heart scan', 'Iron in the heart muscle, and how well the heart pumps.', 'Iron can settle in the heart for years before it causes any symptom. Found early, the iron medicine can be changed in time.'],
            ['Liver', 'Iron in the liver, and how well the liver is working.', 'Iron builds up in the liver too, and trouble there usually gives no warning in the early years.'],
            ['Height and growth', 'How much your child has grown since the last visit, and the signs of puberty.', 'Iron in the glands can slow growth and delay puberty. A slow year on the growth chart is often the first sign.'],
            ['Hormone tests', 'The glands that control growth, puberty, blood sugar and the thyroid.', 'Iron harms these glands quietly. When a problem is found, there is treatment for it.'],
            ['Iron level', 'Whether the iron in the body is going up or coming down.', 'It shows the doctor whether the iron medicine is doing its job, and when to change it.']],
          cap: 'Which tests your child needs, and how often, is decided by your hematologist, and it changes with age.' };
    const icon = [
      `<path d="M26 40C12 31 12 19 18 16c3.5-1.6 6.5.5 8 3 1.5-2.5 4.5-4.6 8-3 6 3 6 15-8 24z" fill="${C.red}"/><path d="M14 27h7l3-5 4 10 3-5h7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="M10 22c4-8 22-10 32-4 4 3 2 10-6 13-7 3-15 7-20 5-6-2-9-8-6-14z" fill="${C.rose}"/><circle cx="20" cy="24" r="2.4" fill="${C.amber}"/><circle cx="28" cy="27" r="2" fill="${C.amber}"/><circle cx="33" cy="22" r="1.8" fill="${C.amber}"/>`,
      `<rect x="31" y="8" width="9" height="36" rx="2" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="1.6"/><path d="M31 14h4M31 20h5M31 26h4M31 32h5M31 38h4" stroke="${C.amber}" stroke-width="1.4"/>${person(18, 30, .8)}`,
      `<rect x="20" y="8" width="12" height="34" rx="6" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><rect x="22" y="26" width="8" height="14" rx="4" fill="${C.o2}"/><path d="M17 8h18" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<path d="M26 8c7 10 12 16 12 22a12 12 0 0 1-24 0c0-6 5-12 12-22z" fill="${C.red}"/><text x="26" y="35" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">Fe</text>`,
    ];
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${icon[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl><dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd></dl></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="tr-tabs">${tabs}</div>` +
      `<div class="tr-out" aria-live="polite"><p class="tr-pick">${esc(t.pick)}</p>${panels}</div>`;
    return { cap: t.cap, cls: 'tr cu', html };
  },

  // Thalassemia, the iron medicine: the common reasons a dose is missed (TIF's own table of barriers); tap one to see
  // what helps and what to ask the doctor.
  'what-gets-in-the-way'(l) {
    const t = l === 'bn'
      ? { h: 'আটকায় কোথায়?', sub: 'আপনার বাড়ির সঙ্গে যেটা মেলে, তাতে চাপ দিন।', pick: 'উপরে একটা বেছে নিন।', rows: ['কী কাজে দেয়', 'ডাক্তারবাবুকে জিজ্ঞেস করুন'],
          p: [['ভুলে যাওয়া', 'রোজ একই সময়, এমন কিছুর সঙ্গে জুড়ে যা রোজ হয়ই, যেমন রাতের খাওয়া বা দাঁত মাজা। ফোনে একটা অ্যালার্ম, আর একটা চার্ট যেখানে প্রতিদিন টিক দেওয়া হয়।', 'আমাদের দিনের সঙ্গে মানায় এমন সময়ে কি ওষুধটা দেওয়া যায়?'],
            ['বিস্বাদ বা পেটে গোলমাল', 'বন্ধ না করে ডাক্তারবাবুকে বলুন। আয়রন বের করার ওষুধ একটাই নয়, আর ডাক্তারবাবু প্রায়ই ওষুধটা বা দেওয়ার ধরনটা বদলে দিতে পারেন।', 'আমার বাচ্চার পক্ষে খাওয়া সহজ, এমন কোনো ওষুধ আছে কি?'],
            ['বন্ধুরা দেখে ফেলবে', 'বাড়িতে খাওয়ার মতো একটা সময়, স্কুলে যাওয়ার আগে বা ফিরে। কিশোর-কিশোরী ধাপে ধাপে দায়িত্ব নিলে, আর বাবা-মা তখনও খেয়াল রাখলে, সবচেয়ে ভালো চলে।', 'বন্ধুরা আশেপাশে থাকে না, এমন সময়ে কি খাওয়া যায়?'],
            ['ছোট বাচ্চা খেতে চায় না', 'প্রতি সন্ধেয় একই মুহূর্ত, প্রশংসা, আর স্টিকারের একটা চার্ট, সপ্তাহ শেষে ছোট্ট পুরস্কার।', 'তবুও রোজ রাতে লড়াই চললে, অন্যভাবে কি দেওয়া যায়?'],
            ['ভালোই তো আছে, কী দরকার', 'আয়রন কোনো জানান দেয় না। প্রতি বছরের চেক-আপে দেখা যায় আয়রন বাড়ছে না কমছে, তাতেই বোঝা যায় ওষুধ কাজ করছে।', 'আয়রন বাড়ছে, না কমছে?']],
          cap: 'যেখানেই আটকাক, হেমাটোলজিস্টকে বলুন। প্রায়ই পরিকল্পনাটা আপনার পরিবারের সুবিধামতো বদলানো যায়।' }
      : { h: 'What gets in the way?', sub: 'Tap the one that sounds like your home.', pick: 'Choose one above.', rows: ['What helps', 'Ask your doctor'],
          p: [['Forgetting', 'The same time every day, tied to something that already happens, like dinner or brushing teeth. An alarm on the phone, and a chart where each day is ticked.', 'Can the medicine fit a time that suits our day?'],
            ['The taste, or an upset stomach', 'Tell the doctor instead of stopping. There is more than one iron medicine, and the doctor can often change it, or the way it is given.', 'Is there an iron medicine my child finds easier to take?'],
            ['Friends might see', 'A time at home, before school or after it. A teenager who takes charge step by step, with a parent still checking, does best.', 'Can it be taken at a time when friends are not around?'],
            ['A small child refuses', 'The same moment every evening, praise, and a sticker chart with a small reward at the end of the week.', 'If it is still a fight every night, is there another way to give it?'],
            ['Feels fine, so why bother', 'Iron gives no warning. The yearly check-ups show whether it is going up or coming down, and that is how you see the medicine working.', 'Is the iron going up or coming down?']],
          cap: 'Whatever gets in the way, tell your hematologist. The plan can often be changed to fit your family.' };
    const icon = [
      `<circle cx="26" cy="28" r="14" fill="#fff" stroke="${C.teal2}" stroke-width="2.4"/><path d="M26 20v8l6 4" fill="none" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/><path d="M13 14l6-5M39 14l-6-5" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<circle cx="26" cy="26" r="15" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><circle cx="21" cy="23" r="1.6" fill="${C.ink}"/><circle cx="31" cy="23" r="1.6" fill="${C.ink}"/><path d="M19 33c2-3 4 1 7-2s5 1 7-1" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `${person(18, 32, .8)}${person(34, 32, .8)}<circle cx="42" cy="12" r="6" fill="#fff" stroke="${C.muted}" stroke-width="1.6"/><circle cx="42" cy="12" r="2" fill="${C.muted}"/>`,
      `${person(18, 36, .72)}<ellipse cx="37" cy="16" rx="6" ry="4.5" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><path d="M37 20.5v16" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/><path d="M40 34l7 7M47 34l-7 7" stroke="${C.red}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<circle cx="26" cy="26" r="15" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="21" cy="23" r="1.6" fill="${C.ink}"/><circle cx="31" cy="23" r="1.6" fill="${C.ink}"/><path d="M20 30c3 3 9 3 12 0" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
    ];
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${icon[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl><dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd></dl></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="tr-tabs">${tabs}</div>` +
      `<div class="tr-out" aria-live="polite"><p class="tr-pick">${esc(t.pick)}</p>${panels}</div>`;
    return { cap: t.cap, cls: 'tr wg', html };
  },
  // Thalassemia, everyday life: four things families are told, each turned over to show what is true.
  'myth-or-fact'(l) {
    const ic = {
      bat: `<g transform="rotate(35 22 20)"><rect x="18" y="4" width="8" height="21" rx="3" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><path d="M22 25v9" stroke="${C.teal2}" stroke-width="3" stroke-linecap="round"/></g><circle cx="9" cy="11" r="4" fill="${C.red}"/>`,
      fish: `<path d="M5 20c5-7 15-8 22 0-7 8-17 7-22 0z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2" stroke-linejoin="round"/><path d="M27 20l8-6v12z" fill="${C.teal2}"/><circle cx="11" cy="18.5" r="1.7" fill="${C.ink}"/>`,
      friends: `${person(13, 27, .62)}${person(28, 27, .62)}`,
      rings: `<circle cx="15" cy="23" r="8" fill="none" stroke="${C.amber}" stroke-width="3"/><circle cx="26" cy="23" r="8" fill="none" stroke="${C.amber}" stroke-width="3"/><path d="M15 9l3 4-3 3-3-3z" fill="${C.o2}"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['bat', 'ওর ক্রিকেট খেলা চলবে না', 'সত্যি?', 'খেলা ওর পক্ষে ভালো। কৈশোরের আগে সাধারণত প্রাণ খুলে খেলতে পারে। পরে সিরিয়াস খেলার আগে ডাক্তারবাবুকে জিজ্ঞেস করুন।'],
            ['fish', 'মাছ, ডিম, মাংস সব বন্ধ', 'সত্যি?', 'নিয়মিত রক্ত নিলে রক্তের আয়রনের তুলনায় খাবারের আয়রন সামান্য।'],
            ['friends', 'ওর সঙ্গে খেললে অন্য বাচ্চারও হবে', 'সত্যি?', 'থ্যালাসেমিয়া কারও কাছ থেকে ছড়ায় না। আসে শুধু বাবা-মায়ের কাছ থেকে সন্তানের মধ্যে।'],
            ['rings', 'ওর কোনোদিন সন্তান হবে না', 'সত্যি?', 'থ্যালাসেমিয়া মেজর নিয়েও অনেকের সন্তান হয়। গর্ভধারণের পরিকল্পনা হয় বিশেষজ্ঞ দলের সঙ্গে।']],
          cap: 'প্রতিটা বাচ্চা আলাদা। আপনার বাচ্চার জন্য ঠিক কী, সেটা হেমাটোলজিস্টকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['bat', 'He must not play cricket', 'True?', 'Play is good for him. Before the teens he can usually play freely. Ask the doctor before serious sport later.'],
            ['fish', 'No fish, no eggs, no meat', 'True?', 'With regular transfusions, the iron in food is small next to the iron in blood.'],
            ['friends', 'Children who play with him can catch it', 'True?', 'Nobody catches thalassemia. It passes only from parents to their children.'],
            ['rings', 'She can never have children', 'True?', 'Many people with thalassemia major have children. The pregnancy is planned with the specialist team.']],
          cap: 'Every child is different. Ask your hematologist what is right for yours.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Low platelets: tick the signs noticed, to take to the doctor; any red-flag sign shows "go to a hospital today".
  'platelet-signs'(l) {
    const t = l === 'bn'
      ? { h: 'ডাক্তারবাবুকে যা জানাবেন', sub: 'যেগুলো চোখে পড়েছে, সেগুলোয় চাপ দিন।',
          g: [['চামড়ায়', ['ছোট ছোট লাল বিন্দু, প্রায়ই পায়ের সামনে', 'বেগুনি বা বাদামি ছোপ', 'অল্পেই কালশিটে']],
            ['রক্ত পড়া', ['নাক দিয়ে রক্ত', 'মাড়ি থেকে রক্ত', 'কাটা জায়গা থেকে অনেকক্ষণ রক্ত পড়ে', 'মাসিক অনেক বেশি']],
            ['ডাক্তারবাবু যা জিজ্ঞেস করবেন', ['গত কয়েক সপ্তাহে জ্বর', 'নতুন কোনো ওষুধ বা ব্যথার ওষুধ', 'প্রায় রোজ মদ']]],
          red: ['আজ এর কোনোটা হচ্ছে?', ['চেপে ধরলেও রক্ত পড়া থামছে না', 'বমি, প্রস্রাব বা পায়খানায় রক্ত, বা কালো পায়খানা', 'হঠাৎ খুব মাথাব্যথা, ঝিমুনি বা সব গুলিয়ে যাওয়া', 'জ্বরের মধ্যে বা পরে পেটে খুব ব্যথা বা বারবার বমি', 'জ্বরের মধ্যে বা পরে মাড়ি বা নাক দিয়ে রক্ত, অস্থির লাগা, বা ঠান্ডা ফ্যাকাশে চামড়া']],
          none: 'এখনও কিছু বাছেননি।',
          many: 'আপনি {n}টা বেছেছেন। এই তালিকা দেখে প্লেটলেট কেন কম, বলা যায় না। রিপোর্টের সঙ্গে তালিকাটা ডাক্তারবাবুকে দেখান।',
          warn: 'আজই হাসপাতালে যান। অ্যাপয়েন্টমেন্টের জন্য অপেক্ষা করবেন না।',
          share: 'তালিকাটা পাঠান (হোয়াটসঅ্যাপ বা অন্য কোথাও)', copied: 'তালিকা কপি হয়েছে',
          head: 'যা যা চোখে পড়েছে:', ask: 'ডাক্তারবাবুকে জিজ্ঞেস করব: প্লেটলেট কেন কম, আর আবার কবে পরীক্ষা করাতে হবে?',
          cap: 'তালিকাটা ডাক্তারবাবুর কাছে নিয়ে যান। আপনি নিজে না পাঠালে কিছুই কোথাও জমা থাকে না বা যায় না।' }
      : { h: 'Signs to tell the doctor about', sub: 'Tap the ones you have noticed.',
          g: [['On the skin', ['Tiny red dots, often on the shins', 'Purple or brown patches', 'Bruises that come easily']],
            ['Bleeding', ['Nosebleeds', 'Bleeding gums', 'A cut that keeps bleeding', 'Periods much heavier than usual']],
            ['The doctor will also ask', ['A fever in the last few weeks', 'A new medicine or painkiller', 'Alcohol most days']]],
          red: ['Any of these today?', ['Bleeding that will not stop with pressure', 'Blood in vomit, urine or stool, or black stool', 'A sudden severe headache, drowsiness or confusion', 'Severe stomach pain or vomiting again and again, during or after a fever', 'Bleeding gums or nose, restlessness, or cold pale skin, during or after a fever']],
          none: 'Nothing ticked yet.',
          many: 'You have ticked {n}. A list like this cannot tell you why the count is low. Show it to your doctor with the report.',
          warn: 'Go to a hospital today. Do not wait for an appointment.',
          share: 'Send this list (WhatsApp or anywhere)', copied: 'List copied',
          head: 'Things I have noticed:', ask: 'I want to ask my doctor: why is my platelet count low, and when should it be checked again?',
          cap: 'Take this list to your doctor. Nothing you tap is saved or sent anywhere unless you send it.' };
    const group = (k, items, red) => `<div class="chk-g${red ? ' red' : ''}"><p class="k">${esc(k)}</p><div class="chk-l">` +
      items.map((x) => btn(`chk-i${red ? ' red' : ''}`, x, ' aria-pressed="false"')).join('') + '</div></div>';
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p>` +
      t.g.map(([k, items]) => group(k, items, false)).join('') + group(t.red[0], t.red[1], true) +
      `<div class="chk-out"><p class="chk-warn" hidden>${esc(t.warn)}</p><p class="chk-msg" aria-live="polite">${esc(t.none)}</p>` +
      `${btn('chk-share', t.share, ' hidden')}</div>`;
    return { cap: t.cap, cls: 'chk', data: { none: t.none, many: t.many, head: t.head, ask: t.ask, copied: t.copied }, html };
  },
  // Dengue: four beliefs families hear, each turned over to show what is true.
  'dengue-myths'(l) {
    const ic = {
      therm: `<rect x="17" y="5" width="7" height="22" rx="3.5" fill="#fff" stroke="${C.red}" stroke-width="2"/><rect x="19" y="14" width="3" height="14" fill="${C.red}"/><circle cx="20.5" cy="30" r="6" fill="${C.red}"/>`,
      plt: `<ellipse cx="14" cy="15" rx="7" ry="4.5" fill="#7A5AD1"/><ellipse cx="26" cy="23" rx="7" ry="4.5" fill="#7A5AD1" opacity=".75"/><ellipse cx="15" cy="30" rx="5" ry="3.4" fill="#7A5AD1" opacity=".5"/>`,
      leaf: `<path d="M20 35c-9-4-13-12-10-23 8 1 15 6 16 15 1 4-1 7-6 8z" fill="${C.teal2}"/><path d="M20 35c-2-8-4-15-9-22" stroke="#fff" stroke-width="1.6" fill="none"/>`,
      pill: `<g transform="rotate(-35 20 20)"><rect x="8" y="14" width="12" height="12" rx="6" fill="${C.amberBg}"/><rect x="8" y="14" width="24" height="12" rx="6" fill="none" stroke="${C.amber}" stroke-width="2"/><path d="M20 14v12" stroke="${C.amber}" stroke-width="2"/></g>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['therm', 'জ্বর ছেড়ে গেছে, মানে বিপদ কেটে গেছে', 'সত্যি?', 'বিপদের সময় প্রায়ই আসে জ্বর ছাড়ার পরে। তখনও লক্ষণগুলোর দিকে নজর রাখুন।'],
            ['plt', 'প্লেটলেট কম হলেই প্লেটলেট দিতে হবে', 'সত্যি?', 'খুব রক্তপাত হলে বা তার জোরালো ঝুঁকি থাকলে প্লেটলেট দেওয়া হয়, শুধু সংখ্যা দেখে নয়।'],
            ['leaf', 'পেঁপে পাতার রসে ডেঙ্গু সারে', 'সত্যি?', 'বিশ্ব স্বাস্থ্য সংস্থা বলছে, ডেঙ্গুর নির্দিষ্ট চিকিৎসা নেই। দেওয়ার আগে ডাক্তারবাবুকে জিজ্ঞেস করুন।'],
            ['pill', 'জ্বরে যেকোনো ব্যথার ওষুধ চলে', 'সত্যি?', 'আইবুপ্রোফেন আর অ্যাসপিরিনে রক্তপাতের সম্ভাবনা বাড়ে। ডাক্তারবাবু যা বলেন, সাধারণত প্যারাসিটামল, সেটাই দিন।']],
          cap: 'প্রতিটা অসুখ আলাদা। যে ডাক্তারবাবু দেখছেন, তাঁকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['therm', 'The fever has gone, so the danger is over', 'True?', 'The risky time often comes after the fever goes. Keep watching for the warning signs.'],
            ['plt', 'A low count always needs a platelet transfusion', 'True?', 'Platelets are given for serious bleeding or a high risk of it, not for the number alone.'],
            ['leaf', 'Papaya leaf juice cures dengue', 'True?', 'WHO says there is no specific treatment for dengue. Ask the doctor before giving it.'],
            ['pill', 'Any painkiller is fine for the fever', 'True?', 'Ibuprofen and aspirin can make bleeding more likely. Give what the doctor advises, usually paracetamol.']],
          cap: 'Every illness is different. Ask the doctor who is looking after your child.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Low platelets, ITP: four beliefs (the steroid card: Dr. Roy, 2026-11-22) families bring to the clinic; each card turns over to what the chapter says.
  'itp-cards'(l) {
    const ic = {
      plt: `<ellipse cx="14" cy="15" rx="7" ry="4.5" fill="#7A5AD1"/><ellipse cx="26" cy="23" rx="7" ry="4.5" fill="#7A5AD1" opacity=".75"/><ellipse cx="15" cy="30" rx="5" ry="3.4" fill="#7A5AD1" opacity=".5"/>`,
      up: `<path d="M8 32l9-9 6 5 10-14" fill="none" stroke="#7A5AD1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 13h7v7" fill="none" stroke="#7A5AD1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
      pill: `<g transform="rotate(-35 20 20)"><rect x="8" y="14" width="12" height="12" rx="6" fill="${C.amberBg}"/><rect x="8" y="14" width="24" height="12" rx="6" fill="none" stroke="${C.amber}" stroke-width="2"/><path d="M20 14v12" stroke="${C.amber}" stroke-width="2"/></g>`,
      steroid: `<rect x="11" y="12" width="18" height="24" rx="4" fill="#fff" stroke="${C.red}" stroke-width="2"/><rect x="14" y="6" width="12" height="7" rx="2" fill="${C.red}"/><path d="M16 21l8 8M24 21l-8 8" stroke="${C.red}" stroke-width="2.4" stroke-linecap="round"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['plt', 'আইটিপি একরকমের ব্লাড ক্যান্সার', 'সত্যি?', 'আইটিপিতে রোগ প্রতিরোধ ক্ষমতা ভুল করে প্লেটলেট নষ্ট করে। এটা ক্যান্সার নয়।'],
            ['up', 'প্লেটলেট বেড়ে গেছে, এবার ওষুধ বন্ধ করা যায়', 'সত্যি?', 'ওষুধ বন্ধ করলে কারও কারও আবার বেড়ে যায়। কমানো বা বন্ধ করা ডাক্তারবাবুই ঠিক করবেন।'],
            ['steroid', 'প্লেটলেট বাড়াতে দোকান থেকে স্টেরয়েড কিনে খাওয়াই যায়', 'সত্যি?', 'ডাক্তারের নজর ছাড়া স্টেরয়েডে সংক্রমণ, ডায়াবেটিস, হাই প্রেশার আর হাড় দুর্বল হতে পারে, আর হঠাৎ ছাড়াও বিপজ্জনক। আগে হেমাটোলজিস্টকে জিজ্ঞেস করুন।'],
            ['pill', 'জ্বর-ব্যথায় যেকোনো ওষুধ চলে', 'সত্যি?', 'অ্যাসপিরিন আর আইবুপ্রোফেনে রক্ত পড়া বাড়তে পারে। কোনটা নিরাপদ, ডাক্তারবাবুকে জিজ্ঞেস করুন।']],
          cap: 'প্রত্যেকের আইটিপি আলাদা। যে ডাক্তারবাবু দেখছেন, তাঁকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['plt', 'ITP is a kind of blood cancer', 'True?', 'In ITP the immune system destroys platelets by mistake. It is not a cancer.'],
            ['up', 'The count is up, so the medicine can stop', 'True?', 'Some people get worse when a medicine is stopped. Only the doctor lowers or stops it.'],
            ['steroid', 'Steroids from the chemist are a safe way to raise the count', 'True?', 'Without a doctor watching, steroids can cause infections, diabetes, high blood pressure and weak bones, and stopping suddenly is dangerous too. Ask your hematologist first.'],
            ['pill', 'Any medicine is fine for fever or pain', 'True?', 'Aspirin and ibuprofen can make bleeding worse. Ask the doctor which one is safe.']],
          cap: 'Every person’s ITP is different. Ask the doctor who is looking after you.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Anaemia, B12 and folate: four beliefs; each card turns over to what the chapter says (no doses, no self-treatment).
  'b12-cards'(l) {
    const ic = {
      tonic: `<rect x="13" y="12" width="14" height="22" rx="3" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><rect x="15" y="6" width="10" height="7" rx="2" fill="${C.amber}"/><path d="M16 22h8M16 27h8" stroke="${C.amber}" stroke-width="1.6" stroke-linecap="round"/>`,
      inj: `<g transform="rotate(-40 20 20)"><rect x="8" y="16" width="20" height="8" rx="2" fill="#fff" stroke="${C.o2}" stroke-width="2"/><path d="M28 20h8M4 20h4M4 16v8" stroke="${C.o2}" stroke-width="2" stroke-linecap="round"/></g>`,
      egg: `<ellipse cx="20" cy="22" rx="10" ry="13" fill="#fff" stroke="${C.amber}" stroke-width="2"/><circle cx="20" cy="24" r="5" fill="${C.amber}"/>`,
      leaf: `<path d="M20 35c-9-4-13-12-10-23 8 1 15 6 16 15 1 4-1 7-6 8z" fill="${C.teal2}"/><path d="M20 35c-2-8-4-15-9-22" stroke="#fff" stroke-width="1.6" fill="none"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['tonic', 'হাত-পা ঝিনঝিন করলে দোকানের নার্ভ টনিকেই হবে', 'সত্যি?', 'আগে রক্ত পরীক্ষা। বি১২ সত্যিই কম কিনা আর কেন, সেটা জানা দরকার, টনিকে আসল কারণ ধরা পড়তে দেরি হয়।'],
            ['inj', 'ভালো লাগছে, এবার ইঞ্জেকশন বন্ধ', 'সত্যি?', 'পারনিশাস অ্যানিমিয়ায় সাধারণত সারা জীবন ইঞ্জেকশন লাগে। বন্ধ করার আগে ডাক্তারবাবুকে জিজ্ঞেস করুন।'],
            ['egg', 'বেশি মাছ-ডিম খেলেই সব সময় ঠিক হয়ে যাবে', 'সত্যি?', 'পাকস্থলী যদি বি১২ টানতে না পারে, তাহলে খাবার বাড়িয়ে লাভ হয় না।'],
            ['leaf', 'শুধু ফলিক অ্যাসিড খেলেই চলবে', 'সত্যি?', 'আগে বি১২ দেখা হয়। শুধু ফলিক অ্যাসিডে বি১২-এর ঘাটতি চাপা পড়তে পারে, আর নার্ভের ক্ষতি চলতে থাকে।']],
          cap: 'যা-ই খান বা বন্ধ করুন, আগে ডাক্তারবাবুকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['tonic', 'A nerve tonic from the chemist will fix the tingling', 'True?', 'A blood test comes first. The doctor needs to know whether B12 is really low and why, and a tonic can delay finding the cause.'],
            ['inj', 'I feel better, so the injections can stop', 'True?', 'In pernicious anaemia the injections are usually needed for life. Ask your doctor before stopping.'],
            ['egg', 'More fish and eggs will always put it right', 'True?', 'If the stomach cannot take in B12, eating more does not help.'],
            ['leaf', 'Folic acid on its own is enough', 'True?', 'B12 is checked first. Folic acid alone can hide a B12 shortage while the nerves go on being harmed.']],
          cap: 'Whatever you take or stop, ask your doctor first.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Thalassemia, Hemoglobin E: tap the name on the report to see what it means and what to ask. No result says what
  // the reader has; each ends with the hematologist.
  'hbe-names'(l) {
    const t = l === 'bn'
      ? { h: 'রিপোর্টে কোনটা লেখা?', sub: 'আপনার রিপোর্টের নামে চাপ দিন।', pick: 'উপরে একটা বেছে নিন।', rows: ['এর মানে', 'ডাক্তারবাবুকে জিজ্ঞেস করুন'],
          p: [['HbE ট্রেট', 'সুস্থ বাহক। কোনো চিকিৎসা লাগে না। ছোট লোহিত কণিকা দেখে আয়রনের অভাব ভেবে নেওয়া হতে পারে।', 'আমার আয়রন সত্যিই কম, না শুধু HbE-এর জন্য এমন দেখাচ্ছে?'],
            ['HbE ডিজিজ', 'দুটো নকশাতেই E। সাধারণত শুধু হালকা অ্যানিমিয়া, স্বাভাবিক জীবন।', 'এটা কি সত্যিই HbE ডিজিজ, না HbE বিটা থ্যালাসেমিয়া?'],
            ['HbE বিটা থ্যালাসেমিয়া', 'থ্যালাসেমিয়ার একটা রূপ। হালকা থেকে গুরুতর হতে পারে, বছরের পর বছর বদলাতেও পারে। রক্ত না লাগলেও নিয়মিত দেখাতে হয়।', 'কত দিন পরপর দেখাব, আর জ্বর এলে কী করব?'],
            ['দুজনের দুরকম ট্রেট', 'একজনের HbE ট্রেট আর অন্যজনের বিটা থ্যালাসেমিয়া ট্রেট হলে সন্তানের HbE বিটা থ্যালাসেমিয়া হতে পারে।', 'সন্তান নেওয়ার আগে আমাদের কী করা উচিত?']],
          cap: 'সব রিপোর্ট একসঙ্গে নিয়ে হেমাটোলজিস্টের কাছে যান। শুধু নাম দেখে কিছু ঠিক করবেন না।' }
      : { h: 'Which one is on your report?', sub: 'Tap the name on your report.', pick: 'Choose one above.', rows: ['What it means', 'Ask your doctor'],
          p: [['HbE trait', 'A healthy carrier. No treatment is needed. Small red cells can be mistaken for a shortage of iron.', 'Is my iron really low, or does HbE only make it look that way?'],
            ['HbE disease', 'E in both copies. Usually only mild anaemia, and a normal life.', 'Are you sure this is HbE disease, and not HbE beta thalassemia?'],
            ['HbE beta thalassemia', 'A form of thalassemia. It can be mild or severe, and can change over the years. Regular checks are needed even without transfusions.', 'How often should we come, and what do we do when a fever comes?'],
            ['Two different traits in a couple', 'If one partner has HbE trait and the other has beta thalassemia trait, a child can be born with HbE beta thalassemia.', 'What should we do before planning a baby?']],
          cap: 'Take all the reports together to a hematologist. Do not decide anything from the name alone.' };
    const icon = [
      `<rect x="15" y="10" width="9" height="30" rx="4" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><rect x="28" y="10" width="9" height="30" rx="4" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><text x="19.5" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="${C.amber}">E</text>`,
      `<rect x="15" y="10" width="9" height="30" rx="4" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><rect x="28" y="10" width="9" height="30" rx="4" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><text x="19.5" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="${C.amber}">E</text><text x="32.5" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="${C.amber}">E</text>`,
      `<rect x="15" y="10" width="9" height="30" rx="4" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><rect x="28" y="10" width="9" height="30" rx="4" fill="${C.roseBg}" stroke="${C.red}" stroke-width="2"/><text x="19.5" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="${C.amber}">E</text><path d="M29.5 21l6 6M35.5 21l-6 6" stroke="${C.red}" stroke-width="2" stroke-linecap="round"/>`,
      `<circle cx="18" cy="18" r="7" fill="${C.teal}"/><path d="M8 40c0-9 4-13 10-13s10 4 10 13z" fill="${C.teal}"/><circle cx="35" cy="18" r="7" fill="${C.teal2}"/><path d="M25 40c0-9 4-13 10-13s10 4 10 13z" fill="${C.teal2}"/>`,
    ];
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${icon[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl><dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd></dl></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="tr-tabs">${tabs}</div>` +
      `<div class="tr-out" aria-live="polite"><p class="tr-pick">${esc(t.pick)}</p>${panels}</div>`;
    return { cap: t.cap, cls: 'tr wg', html };
  },
  // Blood cancers: tap the signs you have noticed; the list goes to the doctor, never to a verdict. A red line for the
  // hospital signs. Nothing is stored or sent unless the reader sends it (same script as signs-check).
  'bc-signs'(l) {
    const t = l === 'bn'
      ? { h: 'ডাক্তার দেখানোর আগে', sub: 'যেগুলো না সারছে, সেগুলোয় চাপ দিন।',
          g: [['শরীর', ['ক্লান্তি আর ফ্যাকাশে ভাব, বিশ্রামেও যায় না', 'অকারণে কালশিটে বা রক্ত পড়া', 'বারবার ফিরে আসা জ্বর আর সংক্রমণ']],
            ['ডেলা আর ওজন', ['গলা, বগল বা কুঁচকিতে ব্যথাহীন ডেলা', 'রাতে ভিজে যাওয়ার মতো ঘাম', 'চেষ্টা ছাড়াই ওজন কমে যাওয়া']],
            ['হাড়', ['হাড় বা কোমরের ব্যথা, যা বেড়েই চলেছে', 'খুব জলতেষ্টা, ঘন ঘন প্রস্রাব']]],
          red: ['আজ এর কোনোটা হচ্ছে?', ['রক্ত পড়া থামছে না', 'হঠাৎ পা দুর্বল, হাঁটতে পারছেন না', 'হঠাৎ সব গুলিয়ে যাওয়া', 'হঠাৎ মুখ বা গলা ফুলে লাল']],
          none: 'এখনও কিছু বাছেননি।',
          many: 'আপনি {n}টা লক্ষণ টের পেয়েছেন। এই তালিকা দেখে রক্তের ক্যান্সার কিনা বলা যায় না, আর বেশিরভাগ সময় কারণটা অন্য কিছু। প্রথম ধাপ একটা রক্ত পরীক্ষা। তালিকাটা ডাক্তারবাবুকে দেখান।',
          warn: 'আজই হাসপাতালে যান। অ্যাপয়েন্টমেন্টের জন্য অপেক্ষা করবেন না।',
          share: 'তালিকাটা পাঠান (হোয়াটসঅ্যাপ বা অন্য কোথাও)', copied: 'তালিকা কপি হয়েছে',
          head: 'আমি যে লক্ষণগুলো টের পেয়েছি, যা সারছে না:', ask: 'ডাক্তারবাবুকে জিজ্ঞেস করব: একটা রক্ত পরীক্ষা করা যায়?',
          cap: 'তালিকাটা ডাক্তারবাবুর কাছে নিয়ে যান। আপনি নিজে না পাঠালে কিছুই কোথাও জমা থাকে না বা যায় না।' }
      : { h: 'Before you see your doctor', sub: 'Tap the ones that have not gone away.',
          g: [['Body', ['Tired and pale, and rest does not help', 'Bruises or bleeding for no reason', 'Fevers and infections that keep coming back']],
            ['Lumps and weight', ['A painless lump in the neck, armpit or groin', 'Drenching sweats at night', 'Losing weight without trying']],
            ['Bones', ['Bone or back pain that keeps getting worse', 'Very thirsty, passing urine often']]],
          red: ['Any of these today?', ['Bleeding that will not stop', 'Sudden weakness of the legs, cannot walk', 'Sudden confusion', 'Face or neck suddenly swollen and red']],
          none: 'Nothing ticked yet.',
          many: 'You have noticed {n}. A list like this cannot tell you whether you have a blood cancer, and most of the time the cause is something else. A blood count is the first step. Show this list to your doctor.',
          warn: 'Go to a hospital today. Do not wait for an appointment.',
          share: 'Send this list (WhatsApp or anywhere)', copied: 'List copied',
          head: 'Signs I have noticed that have not gone away:', ask: 'I want to ask my doctor: can we do a blood count?',
          cap: 'Take this list to your doctor. Nothing you tap is saved or sent anywhere unless you send it.' };
    const group = (k, items, red) => `<div class="chk-g${red ? ' red' : ''}"><p class="k">${esc(k)}</p><div class="chk-l">` +
      items.map((x) => btn(`chk-i${red ? ' red' : ''}`, x, ' aria-pressed="false"')).join('') + '</div></div>';
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p>` +
      t.g.map(([k, items]) => group(k, items, false)).join('') + group(t.red[0], t.red[1], true) +
      `<div class="chk-out"><p class="chk-warn" hidden>${esc(t.warn)}</p><p class="chk-msg" aria-live="polite">${esc(t.none)}</p>` +
      `${btn('chk-share', t.share, ' hidden')}</div>`;
    return { cap: t.cap, cls: 'chk', data: { none: t.none, many: t.many, head: t.head, ask: t.ask, copied: t.copied }, html };
  },
  // Blood cancers, CML: three beliefs from the stories; each card turns over to what the chapter says.
  'cml-cards'(l) {
    const ic = {
      smile: `<circle cx="20" cy="20" r="13" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><circle cx="15.5" cy="17" r="1.6" fill="${C.ink}"/><circle cx="24.5" cy="17" r="1.6" fill="${C.ink}"/><path d="M14.5 24c3 3.5 8 3.5 11 0" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      fam: `<circle cx="13" cy="13" r="5" fill="${C.teal}"/><path d="M5 30c0-7 3.5-10 8-10s8 3 8 10z" fill="${C.teal}"/><circle cx="28" cy="18" r="4" fill="${C.teal2}"/><path d="M21.5 32c0-5.5 3-8 6.5-8s6.5 2.5 6.5 8z" fill="${C.teal2}"/>`,
      pill: `<g transform="rotate(-35 20 20)"><rect x="8" y="14" width="12" height="12" rx="6" fill="${C.amberBg}"/><rect x="8" y="14" width="24" height="12" rx="6" fill="none" stroke="${C.amber}" stroke-width="2"/><path d="M20 14v12" stroke="${C.amber}" stroke-width="2"/></g>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['smile', 'ভালো আছি, তাই ট্যাবলেট বন্ধ করা যায়', 'সত্যি?', 'ভালো থাকা দিয়ে বোঝা যায় না সিএমএল আটকে আছে কিনা। সেটা শুধু পরীক্ষা বলে, আর বন্ধ করা যায় কিনা হেমাটোলজিস্ট সেই পরীক্ষা দেখে ঠিক করেন।'],
            ['pill', 'পার্শ্বপ্রতিক্রিয়া হলে ট্যাবলেট বাদ দিতেই হবে', 'সত্যি?', 'বাদ না দিয়ে হেমাটোলজিস্টকে বলুন। অনেক সময় অন্য ট্যাবলেট দিয়ে দেখা যায়।'],
            ['fam', 'সিএমএল ছেলেমেয়ের হবে', 'সত্যি?', 'সিএমএলের জিনের বদল জীবনের কোনো এক সময়ে হয়, বাবা-মা থেকে সন্তানে যায় না।']],
          cap: 'যা-ই হোক, ট্যাবলেট নিয়ে কিছু বদলানোর আগে হেমাটোলজিস্টকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['smile', 'I feel fine, so the tablets can stop', 'True?', 'Feeling fine does not show whether the CML is held back. Only the tests can, and your hematologist decides about stopping from them.'],
            ['pill', 'A side effect means I must stop the tablet', 'True?', 'Tell your hematologist instead of skipping it. A different tablet can often be tried.'],
            ['fam', 'My children will get CML from me', 'True?', 'The gene change in CML happens during a person’s life. It is not passed from parent to child.']],
          cap: 'Whatever it is, ask your hematologist before changing anything about the tablets.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Blood cancers, myeloma: three beliefs from the stories; each card turns over to what the chapter says.
  'myeloma-cards'(l) {
    const ic = {
      back: `<path d="M20 6v28" stroke="${C.muted}" stroke-width="3" stroke-linecap="round"/><path d="M14 11h12M13 18h14M14 25h12M15 32h10" stroke="${C.muted}" stroke-width="2.4" stroke-linecap="round"/><circle cx="27" cy="22" r="4" fill="${C.red}" opacity=".8"/>`,
      ca: `<circle cx="20" cy="20" r="13" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><text x="20" y="25" text-anchor="middle" font-size="12" font-weight="700" fill="#9A5A0C">Ca</text>`,
      hand: `<path d="M12 30V17a3 3 0 0 1 6 0v-5a3 3 0 0 1 6 0v6a3 3 0 0 1 6 0v12c0 4-4 6-9 6s-9-2-9-6z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['back', 'এই বয়সে কোমরে ব্যথা তো হবেই', 'সত্যি?', 'বেশিরভাগ কোমরের ব্যথা পেশি বা শিরদাঁড়া থেকে হয়। কিন্তু ব্যথা বেড়েই চললে, সঙ্গে ক্লান্তি থাকলে, ডাক্তার দেখান।'],
            ['ca', 'ক্যালসিয়াম ট্যাবলেটে হাড় শক্ত হবে', 'সত্যি?', 'মায়েলোমায় রক্তে ক্যালসিয়াম আগে থেকেই বেশি থাকতে পারে। ক্যালসিয়াম বা ভিটামিনের ট্যাবলেটের আগে হেমাটোলজিস্টকে জিজ্ঞেস করুন।'],
            ['hand', 'মায়েলোমা মানে আর কিছু করার নেই', 'সত্যি?', 'সাধারণত সারে না, কিন্তু চিকিৎসায় সামলানো যায়, আর ফিরে এলে আবার চিকিৎসা হয়।']],
          cap: 'যা-ই হোক, কোনো ওষুধ বা ট্যাবলেট শুরু বা বন্ধ করার আগে হেমাটোলজিস্টকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['back', 'Back pain at this age is only age', 'True?', 'Most back pain comes from the muscles or the spine. But pain that keeps getting worse, with tiredness, needs a doctor.'],
            ['ca', 'Calcium tablets will make the bones strong', 'True?', 'In myeloma, the calcium in the blood can already be high. Ask the hematologist before any calcium or vitamin tablet.'],
            ['hand', 'Myeloma means nothing can be done', 'True?', 'It usually cannot be cured, but it can be managed with treatment, and treated again if it comes back.']],
          cap: 'Whatever it is, ask your hematologist before starting or stopping any medicine or tablet.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Blood cancers, acute leukaemia: three beliefs from the stories; each card turns over to what the chapter says.
  'leukaemia-cards'(l) {
    const ic = {
      leg: `<path d="M17 6v16l-3 12h8l1-12 3-16z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2" stroke-linejoin="round"/>`,
      cal: `<rect x="8" y="10" width="24" height="22" rx="3" fill="#fff" stroke="${C.amber}" stroke-width="2"/><rect x="8" y="10" width="24" height="6" fill="${C.amber}"/><path d="M14 22h4M22 22h4M14 27h4" stroke="${C.amber}" stroke-width="2" stroke-linecap="round"/>`,
      therm: `<rect x="17" y="5" width="7" height="22" rx="3.5" fill="#fff" stroke="${C.red}" stroke-width="2"/><rect x="19" y="14" width="3" height="14" fill="${C.red}"/><circle cx="20.5" cy="30" r="6" fill="${C.red}"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['leg', 'কিশোরের পায়ে ব্যথা মানেই বাড়ন্ত বয়সের ব্যথা', 'সত্যি?', 'বেশিরভাগ সময় তাই। কিন্তু সঙ্গে ফ্যাকাশে ভাব, ক্লান্তি আর অকারণ কালশিটে থাকলে সেই সপ্তাহেই রক্ত পরীক্ষা।'],
            ['cal', 'বিয়ে বা পুজোর পরে চিকিৎসা শুরু করলেও চলবে', 'সত্যি?', 'অ্যাকিউট লিউকেমিয়া কয়েক সপ্তাহে বাড়ে। চিকিৎসা সাধারণত সঙ্গে সঙ্গে শুরু করতে হয়।'],
            ['therm', 'চিকিৎসার মধ্যে জ্বর এলে বাড়িতে দেখা যায়', 'সত্যি?', 'চিকিৎসার সময় শরীর সংক্রমণ সামলাতে পারে না। জ্বর এলেই সঙ্গে সঙ্গে হাসপাতালে ফোন করুন।']],
          cap: 'যা-ই হোক, হেমাটোলজিস্টের দলকে জিজ্ঞেস করুন, আর হাসপাতালের নম্বর হাতের কাছে রাখুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['leg', 'Leg pain in a teenager is always growing pains', 'True?', 'Usually it is. But with paleness, tiredness and unexplained bruises, it needs a blood count the same week.'],
            ['cal', 'Treatment can wait until after the wedding or the puja', 'True?', 'Acute leukaemia grows over weeks. Treatment usually needs to start straight away.'],
            ['therm', 'A fever during treatment can be watched at home', 'True?', 'During treatment the body fights infection poorly. Call the hospital as soon as a fever comes.']],
          cap: 'Whatever it is, ask the hematology team, and keep the hospital number close.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Blood cancers, lymphoma: three beliefs; each card turns over to what the chapter says.
  'lymphoma-cards'(l) {
    const ic = {
      lump: `<circle cx="20" cy="20" r="13" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="25" cy="16" r="5" fill="#7A5AD1"/>`,
      neck: `<circle cx="20" cy="13" r="7" fill="${C.teal}"/><path d="M10 36c0-10 4-15 10-15s10 5 10 15z" fill="${C.teal}"/><circle cx="26" cy="22" r="3.5" fill="#7A5AD1"/>`,
      hand: `<path d="M12 30V17a3 3 0 0 1 6 0v-5a3 3 0 0 1 6 0v6a3 3 0 0 1 6 0v12c0 4-4 6-9 6s-9-2-9-6z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['lump', 'ব্যথা নেই, তাই ডেলা নিয়ে ভাবার কিছু নেই', 'সত্যি?', 'লিম্ফোমার ডেলায় প্রায়ই ব্যথা থাকে না। যে ডেলা দু সপ্তাহে কমে না, সেটা ডাক্তারকে দেখান।'],
            ['neck', 'গলায় ডেলা মানেই ক্যান্সার', 'সত্যি?', 'বেশিরভাগ সময় সংক্রমণে গ্রন্থি ফোলে, আর এক-দু সপ্তাহে কমে যায়।'],
            ['hand', 'লিম্ফোমা হলে কিছু করার নেই', 'সত্যি?', 'অনেক ধরনের চিকিৎসা হয়, আর কিছু পুরোপুরি সরানোও যেতে পারে।']],
          cap: 'যা-ই হোক, ডেলা থেকে গেলে ডাক্তারবাবুকে দেখান।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['lump', 'It does not hurt, so the lump is nothing', 'True?', 'Lymphoma lumps are often painless. A lump that does not go down in two weeks needs a doctor.'],
            ['neck', 'A lump in the neck always means cancer', 'True?', 'Most of the time glands swell with an infection and go down within a week or two.'],
            ['hand', 'Nothing can be done for lymphoma', 'True?', 'Many types can be treated, and some can be removed completely.']],
          cap: 'Whatever it is, a lump that stays needs a doctor.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Blood cancers, CLL: three beliefs; each card turns over to what the chapter says.
  'cll-cards'(l) {
    const ic = {
      clock: `<circle cx="20" cy="20" r="14" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M20 11v9l6 4" stroke="${C.teal2}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      eye: `<path d="M5 20c5-8 25-8 30 0c-5 8-25 8-30 0z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="20" cy="20" r="5" fill="${C.teal}"/>`,
      therm: `<rect x="16" y="6" width="8" height="22" rx="4" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="20" cy="31" r="6" fill="${C.red}"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['clock', 'লিউকেমিয়া মানেই সঙ্গে সঙ্গে চিকিৎসা', 'সত্যি?', 'সিএলএল সাধারণত খুব ধীরে বাড়ে। অনেকের প্রথমে নিয়মিত চেকআপ হয়, দরকার হলে চিকিৎসা।'],
            ['eye', 'চিকিৎসা হচ্ছে না, মানে ডাক্তার হাল ছেড়ে দিয়েছেন', 'সত্যি?', 'নজরে রেখে অপেক্ষা একটা পরিকল্পনা। নিয়মিত পরীক্ষা হয়, আর দরকার বোঝা গেলেই চিকিৎসা শুরু হয়।'],
            ['therm', 'সিএলএল-এ বারবার জ্বর এমনিই হয়, ডাক্তারকে বলার কিছু নেই', 'সত্যি?', 'সিএলএল-এ সংক্রমণ বেশি হয়। জ্বর হলে হেমাটোলজিস্টকে জানান, খুব জ্বর বা কাঁপুনি হলে সেদিনই হাসপাতালে যান।']],
          cap: 'নতুন কোনো লক্ষণ হলে পরের চেকআপের জন্য বসে থাকবেন না।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['clock', 'Leukaemia always needs treatment at once', 'True?', 'CLL usually grows very slowly. Many people first have regular check-ups, and treatment when needed.'],
            ['eye', 'No treatment means the doctor has given up', 'True?', 'Watch and wait is a plan. Regular tests are done, and treatment starts as soon as it is needed.'],
            ['therm', 'Fevers just happen with CLL, no need to tell the doctor', 'True?', 'Infections are more common with CLL. Tell the hematologist about a fever, and go to hospital the same day for a high fever or shivering.']],
          cap: 'New signs do not need to wait for the next check-up.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // The bone marrow test: three beliefs; each card turns over to what the chapter says.
  'marrow-cards'(l) {
    const ic = {
      spine: `<rect x="16" y="4" width="8" height="7" rx="2" fill="#d8d8e0"/><rect x="16" y="14" width="8" height="7" rx="2" fill="#d8d8e0"/><rect x="16" y="24" width="8" height="7" rx="2" fill="#d8d8e0"/><path d="M6 34c4-6 10-6 12-2M34 34c-4-6-10-6-12-2" stroke="${C.teal2}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      bolt: `<path d="M22 4L10 22h9l-3 14 14-20h-9z" fill="${C.amber}" stroke="${C.teal2}" stroke-width="1.6" stroke-linejoin="round"/>`,
      drop: `<path d="M20 6c-6 9-10 15-10 20a10 10 0 0 0 20 0c0-5-4-11-10-20z" fill="${C.red}" opacity=".8"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['spine', 'এই পরীক্ষায় শিরদাঁড়া থেকে রস টেনে নেয়', 'সত্যি?', 'নমুনা নেওয়া হয় কোমরের হাড়ের পেছন দিক থেকে। শিরদাঁড়ায় হাত দেওয়া হয় না।'],
            ['bolt', 'পরীক্ষার পর মানুষ সারাজীবনের মতো দুর্বল হয়ে যায়', 'সত্যি?', 'নমুনাটা অল্প, আর শরীর নতুন মজ্জা তৈরি করতেই থাকে।'],
            ['drop', 'রক্তের রিপোর্টেই সব জানা যায়, ম্যারো পরীক্ষা বাড়তি', 'সত্যি?', 'রিপোর্টে কণিকা কম-বেশি বোঝা যায়। কেন, সেটা অনেক সময় ম্যারো পরীক্ষায় জানা যায়।']],
          cap: 'যা জানতে চান, পরীক্ষার আগে হেমাটোলজিস্টকে জিজ্ঞেস করে নিন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['spine', 'The test draws fluid out of the spine', 'True?', 'The sample is taken from the back of the hip bone. The spine is not touched.'],
            ['bolt', 'After the test a person stays weak for life', 'True?', 'The sample is small, and the body keeps making new marrow.'],
            ['drop', 'The blood report tells everything, the marrow test is extra', 'True?', 'The report shows which counts are low or high. The marrow test often shows why.']],
          cap: 'Ask the hematologist anything you want to know before the test.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Blood cancers, MDS: three beliefs; each card turns over to what the chapter says.
  'mds-cards'(l) {
    const ic = {
      tired: `<circle cx="20" cy="13" r="7" fill="${C.teal}"/><path d="M8 36c0-10 5-15 12-15s12 5 12 15z" fill="${C.teal}"/><path d="M26 6h6l-6 6h6" stroke="${C.teal2}" stroke-width="1.8" fill="none"/>`,
      pill: `<rect x="8" y="14" width="24" height="12" rx="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M20 14v12" stroke="${C.teal2}" stroke-width="2"/>`,
      cal: `<rect x="7" y="9" width="26" height="24" rx="4" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M7 16h26M14 5v8M26 5v8" stroke="${C.teal2}" stroke-width="2"/><circle cx="20" cy="24" r="3" fill="#7A5AD1"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['tired', 'এই বয়সে ক্লান্তি তো বয়সেরই দোষ', 'সত্যি?', 'ক্লান্তি যদি বাড়তেই থাকে, সঙ্গে ফ্যাকাশে ভাব বা কালশিটে, তাহলে রক্ত পরীক্ষা আর ডাক্তার দরকার।'],
            ['pill', 'আয়রন বা টনিকেই রক্ত বাড়বে', 'সত্যি?', 'এমডিএস-এ সমস্যাটা মজ্জার ভেতরে। হেমাটোলজিস্টকে না দেখিয়ে আয়রন বা টনিক শুরু করবেন না।'],
            ['cal', 'এখনই চিকিৎসা নেই, মানে কিছু করার নেই', 'সত্যি?', 'কম ঝুঁকির এমডিএস-এ প্রথমে নিয়মিত চেকআপ হয়, বাড়লে চিকিৎসা শুরু হয়।']],
          cap: 'রিপোর্ট নিয়ে প্রশ্ন থাকলে হেমাটোলজিস্টকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['tired', 'Tiredness at this age is just old age', 'True?', 'Tiredness that keeps getting worse, with paleness or bruising, needs a blood test and a doctor.'],
            ['pill', 'Iron or tonics will build up the blood', 'True?', 'In MDS the problem is in the marrow. Do not start iron or tonics without the hematologist.'],
            ['cal', 'No treatment yet means nothing can be done', 'True?', 'Low-risk MDS is often checked regularly first, and treatment starts if it gets worse.']],
          cap: 'Take any question about the report to the hematologist.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Blood cancers, MPN: three beliefs; each card turns over to what the chapter says.
  'mpn-cards'(l) {
    const ic = {
      drop: `<path d="M20 5c-7 10-11 16-11 21a11 11 0 0 0 22 0c0-5-4-11-11-21z" fill="${C.red}"/><path d="M14 27a6 6 0 0 0 6 6" stroke="#fff" stroke-width="2" fill="none"/>`,
      glass: `<path d="M11 8h18l-3 26H14z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M13 16h14" stroke="${C.teal}" stroke-width="2"/>`,
      plt: `<circle cx="14" cy="16" r="5" fill="#b9a7e8"/><circle cx="25" cy="14" r="5" fill="#b9a7e8"/><circle cx="20" cy="24" r="5" fill="#b9a7e8"/><circle cx="28" cy="26" r="4" fill="#b9a7e8"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['drop', 'রক্ত ঘন মানে শরীর ভালো', 'সত্যি?', 'ঘন রক্ত ধীরে চলে আর জমাট বাঁধার ঝুঁকি বাড়ায়।'],
            ['glass', 'জল বেশি খেলেই হিমোগ্লোবিন কমে যাবে', 'সত্যি?', 'জল কাজে লাগে শুধু শরীরে জল কম থাকলে। পলিসাইথেমিয়া ভেরায় মজ্জা নিজেই বেশি লোহিত কণিকা তৈরি করে।'],
            ['plt', 'কষ্ট না থাকলে প্লেটলেট বেশি নিয়ে ভাবার কিছু নেই', 'সত্যি?', 'বেশি প্লেটলেট দলা পাকিয়ে রক্ত জমাট বাঁধাতে পারে। বেশিই থেকে গেলে হেমাটোলজিস্ট দেখান।']],
          cap: 'রিপোর্ট দেখে নিজে কোনো ওষুধ শুরু বা বন্ধ করবেন না।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['drop', 'Thick blood means strong blood', 'True?', 'Thick blood flows slowly and raises the risk of a clot.'],
            ['glass', 'Drinking more water will bring a high hemoglobin down', 'True?', 'Water helps only when the body is short of water. In polycythaemia vera, the marrow itself makes too many red cells.'],
            ['plt', 'A high platelet count is nothing to worry about if you feel well', 'True?', 'Too many platelets can clump and cause clots. A count that stays high needs a hematologist.']],
          cap: 'Do not start or stop any medicine because of a report.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Blood cancers, infection: three beliefs; each card turns over to what the chapter says.
  'infection-cards'(l) {
    const ic = {
      moon: `<path d="M26 6a14 14 0 1 0 8 24A11 11 0 0 1 26 6z" fill="${C.amber}"/>`,
      therm: `<rect x="16" y="6" width="8" height="22" rx="4" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="20" cy="31" r="6" fill="${C.red}"/>`,
      door: `<rect x="11" y="5" width="18" height="30" rx="2" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="24" cy="21" r="1.8" fill="${C.teal2}"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['moon', 'রাতের জ্বর সকাল পর্যন্ত অপেক্ষা করতে পারে', 'সত্যি?', 'কেমোথেরাপির মধ্যে জ্বর হলে দিনে হোক বা রাতে, সঙ্গে সঙ্গে হাসপাতালে ফোন করুন।'],
            ['therm', 'জ্বরের ওষুধ খেয়ে শুয়ে থাকলেই হবে', 'সত্যি?', 'জ্বরের কোনো ওষুধ খাওয়ার আগে টিমকে জিজ্ঞেস করুন, আর হাসপাতালে ফোন করুন।'],
            ['door', 'চিকিৎসার সময় কারও আসা চলবে না', 'সত্যি?', 'সুস্থ অতিথি, যাঁরা হাত ধুয়ে নেন, আসতে পারেন। সর্দি-কাশি থাকলে ফোন করাই ভালো।']],
          cap: 'থার্মোমিটার আর হাসপাতালের নম্বর হাতের কাছে রাখুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['moon', 'A fever at night can wait until morning', 'True?', 'During chemotherapy, a fever needs a call to the hospital at once, day or night.'],
            ['therm', 'A fever tablet and rest are enough', 'True?', 'Ask the team before taking any fever medicine, and call the hospital.'],
            ['door', 'No one should visit during treatment', 'True?', 'Visitors who are well and wash their hands can come. Anyone with a cold can phone instead.']],
          cap: 'Keep a thermometer and the hospital number close.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Anaemia, aplastic: three beliefs; each card turns over to what the chapter says.
  'aplastic-cards'(l) {
    const ic = {
      pill: `<rect x="8" y="14" width="24" height="12" rx="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M20 14v12" stroke="${C.teal2}" stroke-width="2"/>`,
      three: `<circle cx="12" cy="20" r="5" fill="${C.red}"/><circle cx="20" cy="20" r="5" fill="#7A5AD1"/><circle cx="28" cy="20" r="5" fill="#b9a7e8"/>`,
      hand: `<path d="M12 30V17a3 3 0 0 1 6 0v-5a3 3 0 0 1 6 0v6a3 3 0 0 1 6 0v12c0 4-4 6-9 6s-9-2-9-6z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['pill', 'অ্যানিমিয়া মানেই আয়রন ট্যাবলেট', 'সত্যি?', 'অ্যাপ্লাস্টিক অ্যানিমিয়ায় মজ্জা নিজেই কণিকা তৈরি করতে পারে না, তাই আয়রনে সারে না।'],
            ['three', 'তিনটে কণিকাই কম মানে নিশ্চয়ই ক্যান্সার', 'সত্যি?', 'রিপোর্টে শুধু দেখা যায় কণিকা কম, কেন কম তা নয়। কারণ জানতে হেমাটোলজিস্ট ম্যারো পরীক্ষা করাতে পারেন।'],
            ['hand', 'ট্রান্সপ্লান্ট ছাড়া কোনো চিকিৎসা নেই', 'সত্যি?', 'প্রতিরোধ ক্ষমতা শান্ত করার ওষুধ আরেকটা প্রধান চিকিৎসা।']],
          cap: 'রিপোর্ট দেখে নিজে কোনো ওষুধ শুরু বা বন্ধ করবেন না।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['pill', 'Anaemia always means iron tablets', 'True?', 'In aplastic anaemia the marrow itself cannot make enough cells, so iron cannot fix it.'],
            ['three', 'All three counts low must mean cancer', 'True?', 'A report shows that the counts are low, not why. The hematologist may need a marrow test to find the cause.'],
            ['hand', 'A transplant is the only treatment', 'True?', 'Medicines that calm the defence system are the other main treatment.']],
          cap: 'Do not start or stop any medicine because of a report.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Haemophilia: three beliefs; each card turns over to what the chapter says.
  'haemophilia-cards'(l) {
    const ic = {
      girl: `<circle cx="20" cy="12" r="7" fill="${C.teal}"/><path d="M9 36l5-15h12l5 15z" fill="${C.teal}"/>`,
      ball: `<circle cx="20" cy="20" r="13" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M8 18c8 3 16 3 24 0M10 26c7 2 13 2 20 0" stroke="${C.teal2}" stroke-width="1.6" fill="none"/>`,
      vial: `<rect x="14" y="8" width="12" height="26" rx="3" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><rect x="14" y="20" width="12" height="14" rx="3" fill="${C.red}" opacity=".7"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['girl', 'মেয়েদের কখনো কিছু হয় না', 'সত্যি?', 'যে মেয়েরা জিনটা বহন করেন, তাঁদেরও লক্ষণ হতে পারে, তবে কম আর হালকা।'],
            ['ball', 'হিমোফিলিয়া থাকলে খেলাধুলো বারণ', 'সত্যি?', 'সাঁতার, সাইকেল, ব্যাডমিন্টনের মতো খেলা ভালো। ধাক্কাধাক্কির খেলার আগে টিমকে জিজ্ঞেস করুন।'],
            ['vial', 'ফ্যাক্টর নিলেই রক্তবাহিত সংক্রমণ হবে', 'সত্যি?', 'এখনকার ফ্যাক্টর খুবই নিরাপদ, আর সংক্রমণের ঝুঁকি খুব কম।']],
          cap: 'হিমোফিলিয়া টিমের ফোন নম্বর সবসময় সঙ্গে রাখুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['girl', 'Girls never have any problem', 'True?', 'Girls who carry the gene can have symptoms too, though less often and milder.'],
            ['ball', 'A child with haemophilia must not play sport', 'True?', 'Swimming, cycling and badminton are encouraged. Ask the team before contact sports.'],
            ['vial', 'Clotting factor will give you an infection from blood', 'True?', 'The factor used today is very safe, and the risk of infection is very low.']],
          cap: 'Keep the haemophilia team\'s number with you at all times.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Clots: three beliefs; each card turns over to what the chapter says.
  'clot-cards'(l) {
    const ic = {
      leg: `<path d="M15 3h9v20c0 4 2 7 6 9v4H15c-2 0-3-2-3-4V12c0-5 1-9 3-9z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="19" cy="20" r="3.5" fill="${C.red}"/>`,
      pill: `<rect x="8" y="14" width="24" height="12" rx="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M20 14v12" stroke="${C.teal2}" stroke-width="2"/>`,
      drop: `<path d="M20 6c-6 9-10 15-10 20a10 10 0 0 0 20 0c0-5-4-11-10-20z" fill="${C.red}" opacity=".8"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['leg', 'বাচ্চা হওয়ার পর পা ফোলা নিয়ে ভাবার কিছু নেই', 'সত্যি?', 'এক পায়ে ব্যথা আর ফোলা জমাট হতে পারে। তাড়াতাড়ি ডাক্তার দেখান।'],
            ['pill', 'শরীর ভালো লাগলে রক্ত পাতলা করার ওষুধ বন্ধ করা যায়', 'সত্যি?', 'শুধু ডাক্তারের পরামর্শেই বন্ধ করুন। তাড়াতাড়ি বন্ধ করলে আবার জমাট বাঁধতে পারে।'],
            ['drop', 'রক্ত পাতলা করার ওষুধ রক্তকে জলের মতো করে দেয়', 'সত্যি?', 'এরা রক্ত জমাট বাঁধার গতি কমায়। তাই রক্ত পড়াই প্রধান সাইড এফেক্ট।']],
          cap: 'অন্য যেকোনো ওষুধ খাওয়ার আগে ডাক্তার বা ফার্মাসিস্টকে জিজ্ঞেস করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['leg', 'A swollen leg after a baby is nothing to worry about', 'True?', 'Pain and swelling in one leg can be a clot. See a doctor soon.'],
            ['pill', 'Feeling well means the blood thinner can stop', 'True?', 'Only stop on your doctor\'s advice. Stopping early can let a clot form again.'],
            ['drop', 'Blood thinners make the blood watery', 'True?', 'They slow down clotting, which is why bleeding is the main side effect.']],
          cap: 'Ask your doctor or pharmacist before taking any other medicine.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  'sickle-cards'(l) {
    const ic = {
      kin: `<circle cx="13" cy="12" r="5" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="27" cy="12" r="5" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M6 32c0-7 4-11 7-11s7 4 7 11M20 32c0-7 4-11 7-11s7 4 7 11" fill="none" stroke="${C.teal2}" stroke-width="2"/>`,
      hand: `<path d="M12 34V18c0-2 3-2 3 0v-8c0-2 3-2 3 0v-2c0-2 3-2 3 0v2c0-2 3-2 3 0v4c0-2 3-2 3 0v14c0 4-3 6-7 6h-3c-3 0-5-2-5-4z" fill="${C.roseBg}" stroke="${C.red}" stroke-width="2"/>`,
      cell: `<path d="M6 24C12 10 28 10 34 24C28 17 12 17 6 24z" fill="#8b1e2d"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['kin', 'বাহক মানেই সিকল সেল ডিজিজ', 'সত্যি?', 'বাহক সাধারণত ভালো থাকেন। দুজন বাহকের বাচ্চার অসুখটা হতে পারে, তাই বিয়ের আগে পরীক্ষা কাজে লাগে।'],
            ['hand', 'বাচ্চার হাত-পা ফোলা মানে শুধু চোট', 'সত্যি?', 'ছোট বাচ্চার হাত আর পায়ের পাতা ফুলে ব্যথা সিকল সেল ডিজিজের লক্ষণ হতে পারে। হেমাটোলজিস্ট দেখান।'],
            ['cell', 'সিকল সেল ডিজিজে কিছুই করার নেই', 'সত্যি?', 'জল, গরম থাকা, টিকা, ওষুধ আর নিয়মিত চেকআপে অনেক ক্রাইসিস আর জটিলতা আটকানো যায়।']],
          cap: 'জ্বর হলে সেদিনই ডাক্তারকে ফোন করুন।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['kin', 'A carrier has sickle cell disease', 'True?', 'Carriers usually stay well. Two carriers can have a child with the disease, so a blood test before marriage helps.'],
            ['hand', 'Swollen hands and feet in a child are only an injury', 'True?', 'Painful swelling of the hands and feet in a small child can be a sign of sickle cell disease. See a hematologist.'],
            ['cell', 'Nothing can be done for sickle cell disease', 'True?', 'Water, warmth, vaccines, medicines and regular check-ups prevent many crises and complications.']],
          cap: 'Any fever needs a call to the doctor the same day.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  'pregnancy-cards'(l) {
    const ic = {
      tired: `<circle cx="20" cy="12" r="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M10 34c0-9 4-14 10-14s10 5 10 14" fill="none" stroke="${C.teal2}" stroke-width="2"/><path d="M27 6h6l-6 6h6" fill="none" stroke="${C.muted}" stroke-width="1.5"/>`,
      plt: `<circle cx="13" cy="20" r="5" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><circle cx="27" cy="14" r="4" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><circle cx="25" cy="28" r="4" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/>`,
      pill: `<rect x="8" y="14" width="24" height="12" rx="6" fill="${C.red}" opacity=".8"/><path d="M20 14v12" stroke="#fff" stroke-width="2"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['tired', 'পোয়াতি হলে সব ক্লান্তিই এমনি', 'সত্যি?', 'ক্লান্তির সঙ্গে হাঁফ ধরা, বুক ধড়ফড় বা মুখ ফ্যাকাশে হলে অ্যানিমিয়া হতে পারে। হিমোগ্লোবিন দেখান।'],
            ['plt', 'গর্ভাবস্থায় প্লেটলেট একটু কম মানেই বিপদ', 'সত্যি?', 'এটা খুব হয়, আর সাধারণত মা বা বাচ্চার ক্ষতি করে না। ডাক্তার কারণ দেখে নজর রাখেন।'],
            ['pill', 'আয়রন ট্যাবলেটে পেট খারাপ হলে চুপচাপ বন্ধ করে দিলেই হল', 'সত্যি?', 'আশাদিদি বা ডাক্তারকে বলুন। ডাক্তার অন্যভাবে আয়রন দিতে পারেন।']],
          cap: 'প্রতিটা চেকআপে যান, আর রিপোর্ট ডাক্তারকে দেখান।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['tired', 'All tiredness in pregnancy is just pregnancy', 'True?', 'Tiredness with breathlessness, a fast heartbeat or a pale face can be anaemia. Ask for your haemoglobin to be checked.'],
            ['plt', 'A slightly low platelet count in pregnancy means danger', 'True?', 'It is common and usually harmless for mother and baby. The doctor checks the cause and keeps an eye on it.'],
            ['pill', 'If iron tablets upset the stomach, quietly stop them', 'True?', 'Tell the ASHA or the doctor. The doctor can give iron another way.']],
          cap: 'Keep every check-up, and show the reports to your doctor.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  'transplant-cards'(l) {
    const ic = {
      cut: `<path d="M8 30L32 10M10 10l22 20" stroke="${C.teal2}" stroke-width="3" stroke-linecap="round"/>`,
      kin: `<circle cx="13" cy="12" r="5" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><circle cx="27" cy="14" r="4" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M6 32c0-7 4-11 7-11s7 4 7 11M21 32c0-6 3-9 6-9s6 3 6 9" fill="none" stroke="${C.teal2}" stroke-width="2"/>`,
      home: `<path d="M6 20L20 8l14 12v14H6z" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><rect x="16" y="24" width="8" height="10" fill="#fff" stroke="${C.teal2}" stroke-width="2"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['cut', 'বোন ম্যারো ট্রান্সপ্লান্ট মানে হাড় কেটে অপারেশন', 'সত্যি?', 'নতুন কোষ সরু নল দিয়ে রক্তে দেওয়া হয়, রক্ত দেওয়ার মতো। ব্যথা লাগে না।'],
            ['kin', 'বাবা-মা সবসময় সবচেয়ে ভালো দাতা', 'সত্যি?', 'সবচেয়ে ভালো মিল সাধারণত ভাই বা বোন। এইচএলএ পরীক্ষায় মিল দেখা হয়।'],
            ['home', 'ছুটি পেলেই ট্রান্সপ্লান্ট শেষ', 'সত্যি?', 'পুরো সেরে উঠতে এক বছর পর্যন্ত লাগতে পারে। চেকআপ, সংক্রমণ থেকে সাবধানতা আর ওষুধ চলতে থাকে।']],
          cap: 'ট্রান্সপ্লান্টের পর জ্বর হলে সঙ্গে সঙ্গে টিমকে জানান।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['cut', 'A bone marrow transplant is an operation on the bones', 'True?', 'The new cells are given into the blood through a thin tube, like a transfusion. It is not painful.'],
            ['kin', 'Parents are always the best donors', 'True?', 'The best match is usually a brother or sister. HLA typing checks the match.'],
            ['home', 'Going home means the transplant is over', 'True?', 'Full recovery can take up to a year, with check-ups, care against infection and medicines.']],
          cap: 'After a transplant, tell the team at once about any fever.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  'transfusion-cards'(l) {
    const ic = {
      test: `<rect x="15" y="6" width="10" height="26" rx="5" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><rect x="15" y="20" width="10" height="12" rx="5" fill="${C.red}" opacity=".8"/>`,
      shiver: `<circle cx="20" cy="13" r="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M10 34c0-9 4-14 10-14s10 5 10 14M4 16l3 3-3 3M36 16l-3 3 3 3" fill="none" stroke="${C.teal2}" stroke-width="2"/>`,
      bag: `<rect x="12" y="6" width="16" height="26" rx="5" fill="${C.roseBg}" stroke="${C.red}" stroke-width="2"/><path d="M14 30v6M26 30v6" stroke="${C.red}" stroke-width="2"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['test', 'দান করা রক্ত পরীক্ষা না করেই দেওয়া হয়', 'সত্যি?', 'প্রতিটা দান এইচআইভি, হেপাটাইটিস বি, সি আর সিফিলিসের জন্য পরীক্ষা করা উচিত, ভারতে ম্যালেরিয়ার জন্যও। সংক্রমণের সম্ভাবনা কম, তবে শূন্য নয়।'],
            ['shiver', 'রক্ত নেওয়ার সময় কাঁপুনি হলে চুপ করে থাকাই ভালো', 'সত্যি?', 'তখনই নার্সকে বলুন। রক্ত আস্তে দিলে বা থামালে সাধারণত কমে যায়।'],
            ['bag', 'অ্যানিমিয়ায় রক্ত দেওয়াই সবচেয়ে ভালো চিকিৎসা', 'সত্যি?', 'রক্ত দেওয়া জরুরি অবস্থা সামলায়, কারণ সারায় না। হিমোগ্লোবিন কেন কম, তা খুঁজে চিকিৎসা করতে হয়।']],
          cap: 'পরে জ্বর, শ্বাসকষ্ট বা গাঢ় প্রস্রাব হলে সঙ্গে সঙ্গে হাসপাতালে যান।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['test', 'Donated blood is given without testing', 'True?', 'Every donation should be screened for HIV, hepatitis B and C and syphilis, and in India for malaria too. The chance of infection is low, but not zero.'],
            ['shiver', 'Shivering during a transfusion is best kept quiet', 'True?', 'Tell the nurse at once. Slowing or stopping the transfusion usually helps.'],
            ['bag', 'A transfusion is the best treatment for anaemia', 'True?', 'A transfusion manages an emergency. It does not treat the cause. Why the haemoglobin is low needs to be found and treated.']],
          cap: 'A fever, breathing trouble or dark urine afterwards needs a hospital at once.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  'donation-cards'(l) {
    const ic = {
      weak: `<circle cx="20" cy="12" r="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M10 34c0-9 4-14 10-14s10 5 10 14" fill="none" stroke="${C.teal2}" stroke-width="2"/>`,
      needle: `<rect x="8" y="10" width="24" height="20" rx="4" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M14 20l4 4 8-8" stroke="${C.teal}" stroke-width="2.5" fill="none"/>`,
      ask: `<rect x="8" y="6" width="24" height="28" rx="3" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><path d="M13 14h14M13 20h14M13 26h9" stroke="${C.teal2}" stroke-width="2"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['weak', 'রক্ত দিলে মাসের পর মাস দুর্বল লাগে', 'সত্যি?', 'পরীক্ষায় সুস্থ দেখা গেলে তবেই রক্ত নেওয়া হয়। দেড় দিনের মধ্যে শরীর জল পূরণ করে নেয়।'],
            ['needle', 'রক্ত দিতে গিয়ে সুচ থেকে রোগ হতে পারে', 'সত্যি?', 'সুচ আর ব্যাগ জীবাণুমুক্ত প্যাকেটে আসে আর একবারই ব্যবহার হয়।'],
            ['ask', 'ব্যক্তিগত প্রশ্নের উত্তর এড়িয়ে গেলেও ক্ষতি নেই', 'সত্যি?', 'খুব সাম্প্রতিক সংক্রমণ পরীক্ষায় ধরা না-ও পড়তে পারে। সত্যি উত্তর রোগীকে বাঁচায়, আর তা গোপন থাকে।']],
          cap: 'আজ রক্ত দিতে পারবেন কিনা, ব্লাড সেন্টার বলে দেবে। রক্ত দেওয়ার পর অজ্ঞান ভাব না কাটলে, বুকে ব্যথা হলে বা রক্ত না থামলে সঙ্গে সঙ্গে হাসপাতালে যান।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['weak', 'Giving blood leaves you weak for months', 'True?', 'You give blood only if the checks show you are well. The body replaces the fluid within about a day and a half.'],
            ['needle', 'You can catch a disease from the needle when you give blood', 'True?', 'The needle and bag come in a sterile pack and are used only once.'],
            ['ask', 'Skipping the personal questions does no harm', 'True?', 'Tests may miss a very recent infection. Honest answers protect the patient, and they are kept confidential.']],
          cap: 'The blood centre tells you whether you can give blood today. Fainting that does not pass, chest pain, or bleeding that will not stop after giving blood needs a hospital at once.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  'coag-cards'(l) {
    const ic = {
      report: `<rect x="9" y="5" width="22" height="30" rx="3" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><path d="M14 13h12M14 19h12M14 25h7" stroke="${C.teal2}" stroke-width="2"/><path d="M24 25h4" stroke="${C.red}" stroke-width="3"/>`,
      pill: `<rect x="8" y="14" width="24" height="12" rx="6" fill="${C.mint}" stroke="${C.teal2}" stroke-width="2"/><path d="M20 14v12" stroke="${C.teal2}" stroke-width="2"/>`,
      drop: `<path d="M20 6c-6 9-10 15-10 20a10 10 0 0 0 20 0c0-5-4-11-10-20z" fill="${C.red}" opacity=".8"/>`,
    };
    const t = l === 'bn'
      ? { h: 'সত্যি, না ভুল ধারণা?', sub: 'কার্ডে চাপ দিলে উল্টে যাবে।', sign: 'ভুল ধারণা',
          c: [['report', 'রিপোর্টে একটা মান দাগানো মানেই রোগ', 'সত্যি?', 'একটা ফল দিয়ে রোগ ধরা যায় না। ডাক্তার রক্ত পড়ার ইতিহাস আর ওষুধ মিলিয়ে দেখেন, দরকারে আবার করান।'],
            ['pill', 'আইএনআর দেখে নিজেই ওয়ারফারিন বাড়ানো-কমানো যায়', 'সত্যি?', 'কতটা খাবেন, ঠিক করেন ডাক্তার বা ওয়ারফারিন ক্লিনিক। পরীক্ষাও বাদ দেবেন না।'],
            ['drop', 'পরীক্ষা সীমার মধ্যে এলে রক্ত পড়ার সমস্যা থাকতেই পারে না', 'সত্যি?', 'কিছু অসুখে স্ক্রিনিং পরীক্ষা সীমার মধ্যে আসে। সহজে রক্ত পড়লে ডাক্তারকে বলুন।']],
          cap: 'রক্ত না থামলে, বমি বা পায়খানায় রক্ত, হঠাৎ খুব মাথাব্যথা, শ্বাসকষ্ট, বুকে ব্যথা বা একটা পা ফুলে ব্যথা হলে সঙ্গে সঙ্গে হাসপাতালে যান।' }
      : { h: 'True, or a myth?', sub: 'Tap a card to turn it over.', sign: 'A myth',
          c: [['report', 'A value marked on the report means a disease', 'True?', 'A single result does not make a diagnosis. The doctor reads it with your bleeding history and medicines, and may repeat it.'],
            ['pill', 'You can adjust warfarin yourself from the INR', 'True?', 'The doctor or warfarin clinic decides how much. Do not skip a test either.'],
            ['drop', 'Tests within range mean there can be no bleeding problem', 'True?', 'Screening tests can be within range in some bleeding disorders. Tell the doctor if you bleed easily.']],
          cap: 'Bleeding that will not stop, blood in vomit or stools, a sudden severe headache, sudden breathlessness, chest pain or a painful swollen leg needs a hospital at once.' };
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="flips">` +
      t.c.map(([i, front, tag, back]) => `<button type="button" class="flip" aria-pressed="false">` +
        `<span class="fc front"><svg viewBox="0 0 40 40" aria-hidden="true">${ic[i]}</svg><span class="q">${esc(front)}</span><span class="tag">${esc(tag)}</span></span>` +
        `<span class="fc back"><span class="k">${esc(t.sign)}</span><span>${esc(back)}</span></span></button>`).join('') + '</div>';
    return { cap: t.cap, cls: 'flipset', html };
  },
  // Anaemia, iron: five things that happen while taking iron; tapping one shows what it means and what to ask.
  'iron-troubles'(l) {
    const t = l === 'bn'
      ? { h: 'ট্যাবলেট নিয়ে কী হচ্ছে?', sub: 'আপনার সঙ্গে যেটা মেলে, তাতে চাপ দিন।', pick: 'উপরে একটা বেছে নিন।', rows: ['এর মানে', 'ডাক্তারবাবুকে জিজ্ঞেস করুন'],
          p: [['পায়খানা কালচে', 'আয়রন ট্যাবলেটে প্রায়ই পায়খানা স্বাভাবিকের চেয়ে কালচে হয়, সাধারণত চিন্তার কিছু নেই। তবে আলকাতরার মতো কালো, বা লাল, বা রক্তমাখা পায়খানা হলে সেদিনই হাসপাতালে যান।', 'আমার পায়খানার রং কি আয়রনের জন্যই?'],
            ['পেট গোলায়', 'খাবারের সঙ্গে বা খাওয়ার একটু পরে খেলে কম হতে পারে। ট্যাবলেট চালিয়ে যান আর ডাক্তারবাবুকে জানান, আয়রন একরকমের নয়।', 'খাবারের সঙ্গে খাওয়া যায়, নাকি অন্য আয়রন দেওয়া যায়?'],
            ['কোষ্ঠকাঠিন্য', 'আয়রনে এটা হতে পারে। খাওয়া চালিয়ে যান, আর অসুবিধা হলে ডাক্তারবাবুকে বলুন।', 'কোষ্ঠকাঠিন্যের জন্য কী করতে পারি?'],
            ['চায়ের সঙ্গে খাই', 'চা, কফি আর দুধে শরীর আয়রন কম টেনে নেয়। এগুলো ট্যাবলেটের সময় থেকে সরিয়ে রাখুন।', 'আমার ট্যাবলেট খাওয়ার সবচেয়ে ভালো সময় কোনটা?'],
            ['হিমোগ্লোবিন বাড়ছে না', 'ডাক্তারবাবুর কাছে ফিরে যান। ট্যাবলেট বাদ পড়ছে, এখনও রক্ত বেরিয়ে যাচ্ছে, পেট খাবার থেকে আয়রন টানছে না, বা আয়রনের অভাবই নয়, এর কোনটা দেখতে হবে।', 'আমার হিমোগ্লোবিন বাড়ছে না কেন?']],
          cap: 'যা-ই হোক, বন্ধ না করে ডাক্তারবাবুকে জানান। প্রায়ই খাওয়ার নিয়মটা বদলে নেওয়া যায়।' }
      : { h: 'What is happening with your tablets?', sub: 'Tap the one that sounds like you.', pick: 'Choose one above.', rows: ['What it means', 'Ask your doctor'],
          p: [['Dark stools', 'Iron tablets often make stools darker than usual, and that is usually nothing to worry about. Stools that are black and tar-like, or red, or have blood in them need a hospital the same day.', 'Is the colour of my stools from the iron?'],
            ['Upset stomach', 'Taking the tablet with food, or soon after, may help. Keep taking it and tell the doctor. There is more than one kind of iron.', 'Can I take it with food, or try another kind?'],
            ['Constipation', 'Iron can cause it. Keep taking it, and tell the doctor if it troubles you.', 'What can I do about the constipation?'],
            ['Taking it with tea', 'Tea, coffee and milk make it harder for the body to take in iron. Keep them away from the tablet.', 'When is the best time for me to take the tablet?'],
            ['Hemoglobin not rising', 'Go back to the doctor. Tablets missed, blood still being lost, the gut not taking the iron in, or not iron deficiency at all: one of these needs finding.', 'Why is my hemoglobin not rising?']],
          cap: 'Whatever it is, tell your doctor instead of stopping. The plan can often be changed.' };
    const icon = [
      `<circle cx="26" cy="26" r="15" fill="${C.ink}" opacity=".75"/><path d="M26 18v10" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="33.5" r="2.2" fill="#fff"/>`,
      `<circle cx="26" cy="26" r="15" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><circle cx="21" cy="23" r="1.6" fill="${C.ink}"/><circle cx="31" cy="23" r="1.6" fill="${C.ink}"/><path d="M19 33c2-3 4 1 7-2s5 1 7-1" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<g transform="rotate(-30 26 26)"><rect x="12" y="19" width="28" height="14" rx="7" fill="#fff" stroke="${C.red}" stroke-width="2"/><rect x="12" y="19" width="14" height="14" rx="7" fill="${C.red}"/></g><path d="M34 38h8M34 42h8" stroke="${C.muted}" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M13 21h22v10a11 11 0 0 1-22 0z" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><path d="M35 24h3a4.5 4.5 0 0 1 0 9h-3" fill="none" stroke="${C.amber}" stroke-width="2"/><path d="M20 10c0 3 3 3 3 7M27 10c0 3 3 3 3 7" stroke="${C.muted}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
      `<path d="M10 40h33M10 40V11" stroke="${C.muted}" stroke-width="2"/><path d="M13 31l9-1 9 1 10-1" stroke="${C.red}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    ];
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${icon[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl><dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd></dl></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="tr-tabs">${tabs}</div>` +
      `<div class="tr-out" aria-live="polite"><p class="tr-pick">${esc(t.pick)}</p>${panels}</div>`;
    return { cap: t.cap, cls: 'tr wg', html };
  },
  // Blood report (CBC): tap a line on the report to see what it measures and what to ask the doctor.
  'cbc-reader'(l) {
    // Dr. Roy, 2026-11-22: no lists of diseases for a high or low value (readers may diagnose and treat themselves).
    // Each line shows only what it measures and what to ask the doctor.
    const t = l === 'bn'
      ? { h: 'রিপোর্টের কোন লাইন?', sub: 'যে লাইনটা নিয়ে ভাবছেন, তাতে চাপ দিন।', pick: 'উপরে একটা বেছে নিন।', rows: ['এটা কী মাপে', 'ডাক্তারবাবুকে জিজ্ঞেস করুন'],
          p: [['হিমোগ্লোবিন', 'লোহিত কণিকার সেই অংশ, যা অক্সিজেন বয়।', 'আমার হিমোগ্লোবিন কি ঠিক আছে, না আবার দেখতে হবে?'],
            ['পিসিভি (হেমাটোক্রিট)', 'রক্তের কতটা অংশ লোহিত কণিকা।', 'আমার পিসিভি নিয়ে চিন্তার কিছু আছে কি?'],
            ['এমসিভি', 'লোহিত কণিকার গড় আকার।', 'আমার এমসিভি কি ঠিক আছে? কিছু করার দরকার আছে?'],
            ['শ্বেত কণিকা (TLC)', 'সংক্রমণের সঙ্গে লড়ার কণিকা।', 'আমার শ্বেত কণিকার মাপ কি ঠিক আছে?'],
            ['প্লেটলেট', 'রক্ত পড়া বন্ধ করার ছোট্ট কণা।', 'আমার প্লেটলেট কি ঠিক আছে, না আবার দেখতে হবে?']],
          cap: 'বেশি বা কম মানে কী, সেটা ডাক্তারবাবু সব লাইন আর আপনি কেমন আছেন দেখে বলবেন। রিপোর্ট দেখে নিজে কোনো ওষুধ শুরু বা বন্ধ করবেন না।' }
      : { h: 'Which line on your report?', sub: 'Tap the line you are wondering about.', pick: 'Choose one above.', rows: ['What it measures', 'Ask your doctor'],
          p: [['Hemoglobin', 'The part of the red cells that carries oxygen.', 'Is my hemoglobin fine, or should it be checked again?'],
            ['PCV (hematocrit)', 'How much of the blood is made of red cells.', 'Is there anything to think about in my PCV?'],
            ['MCV', 'The average size of the red cells.', 'Is my MCV fine? Does anything need doing?'],
            ['White cells (TLC)', 'The cells that fight infection.', 'Is my white cell count fine?'],
            ['Platelets', 'Tiny pieces in the blood that help stop bleeding.', 'Is my platelet count fine, or should it be checked again?']],
          cap: 'Your doctor tells you what a high or low value means, from all the lines and how you are. Do not start or stop any medicine on your own because of a report.' };
    const dot = (c) => `<rect x="10" y="14" width="32" height="26" rx="5" fill="#fff" stroke="${C.mintLine}" stroke-width="2"/><path d="M15 22h14M15 28h18M15 34h10" stroke="${C.muted}" stroke-width="2" stroke-linecap="round"/><circle cx="38" cy="16" r="7" fill="${c}"/>`;
    const icon = [dot(C.red), dot(C.rose), dot(C.amber), dot(C.o2), dot('#7A5AD1')];
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${icon[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl><dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd></dl></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="tr-tabs">${tabs}</div>` +
      `<div class="tr-out" aria-live="polite"><p class="tr-pick">${esc(t.pick)}</p>${panels}</div>`;
    return { cap: t.cap, cls: 'tr wg', html };
  },
  // Anaemia, school and anganwadi test: tap what is happening at home with the school's iron; each shows what to do
  // and what to ask. Nothing tells the family to stop or start iron on their own (CLAUDE.md rule 5).
  'school-slip'(l) {
    const t = l === 'bn'
      ? { h: 'বাড়িতে কী হচ্ছে?', sub: 'আপনার সঙ্গে যেটা মেলে, তাতে চাপ দিন।', pick: 'উপরে একটা বেছে নিন।', rows: ['কী করবেন', 'জিজ্ঞেস করুন'],
          p: [['খেয়ে গা গোলায়', 'চুপচাপ বন্ধ না করে টিচার বা স্বাস্থ্যকর্মীকে জানান। প্রথম কয়েক সপ্তাহে অনেক সময় কমে আসে, আর কর্মসূচি বলে খাওয়ার পরে খেতে।', 'খাওয়ার পরে খাওয়ানো যায়?'],
            ['পায়খানা কালচে', 'আয়রনে পায়খানা কালচে হতে পারে, কর্মসূচি বলে এটা স্বাভাবিক। আলকাতরার মতো কালো, লাল বা রক্তমাখা পায়খানা হলে সেদিনই হাসপাতালে যান।', 'এই রং কি আয়রনের জন্য?'],
            ['জ্বর বা পেট খারাপ', 'পরের বার খাওয়ানোর আগে স্বাস্থ্যকর্মী বা ডাক্তারবাবুকে জিজ্ঞেস করুন। অসুখের সময় কর্মসূচি নিয়মিত আয়রন বন্ধ রাখে, তখন ডাক্তার ঠিক করেন।', 'অসুখের মধ্যে আয়রন চলবে?'],
            ['টনিকও কিনেছি', 'নিজে থেকে টনিক বা বাড়তি আয়রন যোগ করবেন না। বেশি আয়রন ছোট বাচ্চার প্রাণ নিতে পারে। দুটোই ডাক্তারবাবুকে দেখান।', 'কর্মসূচির আয়রন ছাড়া আর কিছু লাগবে?'],
            ['থ্যালাসেমিয়া মেজর আছে', 'স্কুলের স্বাস্থ্য দলকে জানান। এই বাচ্চাদের কর্মসূচির নিয়মিত আয়রন দেওয়া হয় না, আয়রনের ব্যাপারে ওদের ডাক্তারবাবুই ঠিক করেন।', 'স্বাস্থ্য দলকে কী জানাব?'],
            ['পরীক্ষার তারিখ জানি না', 'স্বাস্থ্যকর্মীর কাছে তারিখটা জেনে লিখে রাখুন। আবার পরীক্ষায় বোঝা যায় হিমোগ্লোবিন বাড়ল কিনা।', 'আবার পরীক্ষা কবে, কোথায়?']],
          cap: 'যা-ই হোক, কিছু বদলানোর আগে স্বাস্থ্যকর্মী বা ডাক্তারবাবুকে জানান। হাসপাতালে যাওয়ার লক্ষণগুলো সব সময় মনে রাখুন।' }
      : { h: 'What is happening at home?', sub: 'Tap the one that sounds like yours.', pick: 'Choose one above.', rows: ['What to do', 'Ask'],
          p: [['Feels sick after it', 'Tell the teacher or the health worker instead of quietly stopping it. It often fades in the first few weeks, and the programme suggests taking it after a meal.', 'Can my child take it after a meal?'],
            ['Stools gone dark', 'Iron can turn stools dark, and the programme says this is expected. Stools that are black and tar-like, or red, or have blood in them need a hospital the same day.', 'Is this colour from the iron?'],
            ['Fever or loose motions', 'Ask the health worker or your child’s doctor before the next dose. During an illness the programme holds back its routine iron, and a doctor decides.', 'Should the iron go on while my child is ill?'],
            ['Bought a tonic too', 'Do not add a tonic or more iron on your own. Too much iron can be fatal for a small child. Show both to the doctor.', 'Does my child need anything besides the programme’s iron?'],
            ['Has thalassemia major', 'Tell the school health team. The programme does not give its routine iron to these children, and their own doctor decides about iron.', 'What should I tell the school health team?'],
            ['Retest date not known', 'Ask the health worker for the date and write it down. The retest shows whether the hemoglobin has risen.', 'When and where is the retest?']],
          cap: 'Whatever it is, tell the health worker or your child’s doctor before changing anything. Keep the hospital signs in mind all the time.' };
    const icon = [
      `<circle cx="26" cy="26" r="15" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><circle cx="21" cy="23" r="1.6" fill="${C.ink}"/><circle cx="31" cy="23" r="1.6" fill="${C.ink}"/><path d="M19 33c2-3 4 1 7-2s5 1 7-1" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<circle cx="26" cy="26" r="15" fill="${C.ink}" opacity=".75"/><path d="M26 18v10" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="33.5" r="2.2" fill="#fff"/>`,
      `<rect x="22" y="8" width="8" height="28" rx="4" fill="#fff" stroke="${C.red}" stroke-width="2"/><circle cx="26" cy="38" r="7" fill="${C.red}"/><rect x="24.5" y="22" width="3" height="14" fill="${C.red}"/>`,
      `<rect x="17" y="14" width="18" height="28" rx="4" fill="${C.amberBg}" stroke="${C.amber}" stroke-width="2"/><rect x="20" y="9" width="12" height="6" rx="2" fill="${C.amber}"/><path d="M21 26h10M21 31h10" stroke="${C.amber}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<circle cx="20" cy="26" r="9" fill="${C.red}"/><circle cx="20" cy="26" r="4" fill="${C.rose}"/><circle cx="34" cy="24" r="7" fill="${C.rose}"/><path d="M31 37h8M35 33v8" stroke="${C.teal2}" stroke-width="2.4" stroke-linecap="round"/>`,
      `<rect x="11" y="12" width="30" height="28" rx="4" fill="#fff" stroke="${C.teal2}" stroke-width="2"/><rect x="11" y="12" width="30" height="7" rx="3" fill="${C.teal2}"/><path d="M22 27a4 4 0 1 1 5 4v3" fill="none" stroke="${C.red}" stroke-width="2.2" stroke-linecap="round"/><circle cx="27" cy="37.5" r="1.4" fill="${C.red}"/>`,
    ];
    const tabs = t.p.map((x, i) => `<button type="button" class="tr-b" aria-pressed="false" data-i="${i}"><svg viewBox="0 0 52 52" aria-hidden="true">${icon[i]}</svg><span>${esc(x[0])}</span></button>`).join('');
    const panels = t.p.map((x, i) => `<div class="tr-p" data-i="${i}" hidden><dl><dt>${esc(t.rows[0])}</dt><dd>${esc(x[1])}</dd><dt>${esc(t.rows[1])}</dt><dd>${esc(x[2])}</dd></dl></div>`).join('');
    const html = `<p class="try-h">${esc(t.h)}</p><p class="try-sub">${esc(t.sub)}</p><div class="tr-tabs">${tabs}</div>` +
      `<div class="tr-out" aria-live="polite"><p class="tr-pick">${esc(t.pick)}</p>${panels}</div>`;
    return { cap: t.cap, cls: 'tr wg', html };
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
