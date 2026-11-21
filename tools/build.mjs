#!/usr/bin/env node
// Builds the chapter pages, the chapter cards on the home page, sitemap.xml and robots.txt
// from chapters/list.json and the chapters/<id>.<lang>.txt files.
//
// Run: node tools/build.mjs
// It runs by itself on GitHub after every change (see .github/workflows/build.yml),
// so a chapter edited on the phone appears on its own page a few minutes later.
//
// Chapter text format (chapters/<id>.bn.txt and chapters/<id>.en.txt):
//   a blank line starts a new paragraph
//   "# Heading"      a section heading
//   "## Heading"     a smaller heading inside a section
//   "- item"         a bullet point (several in a row make a list)
//   "[figure: name]"  a moving illustration from tools/figures.mjs, with its caption, on a line of its own
//   "[video: name]"   a short video from assets/video/ (listed in tools/figures.mjs), on a line of its own
//
// How the page is dressed, with nothing extra to type:
//   - Everything before the first "# Heading" is the opening story. It is set in the serif
//     story type, and a short first line becomes the big headline line of the chapter.
//     The line on the chapter's card on the home page comes from "card_bn" / "card_en" in
//     chapters/list.json: a line in the reader's own words (their symptom, their report, their worry).
//     If that is empty, the card falls back to the first sentence of the story.
//   - A section whose heading says "Go to a hospital ..." becomes the red warning box.
//   - A section whose heading has "questions" and "doctor" becomes the green checklist.
//   - A section headed "Common questions" becomes tap-to-open questions ("## " lines are the questions).
//   - A section headed "The main points" becomes a pale yellow box.
//   (The Bengali headings are recognised too. See kind() below.)
//
// Chapters and parts: a line in chapters/list.json with "parent": "thalassemia" is a PART of the
// Thalassemia chapter. It gets the address /thalassemia/<rest of its id>/ (thalassemia-inheritance
// becomes /thalassemia/inheritance/), it is not shown on the home page, and it is listed under
// "In this chapter" on the chapter's own page and on every part's page. Its text files keep their
// names (chapters/thalassemia-inheritance.en.txt). The old flat address redirects to the new one.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, rmdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figure, video } from './figures.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kolkatahematologyinstitute.com';
const AUTHOR = { bn: 'ডাঃ সুদীপ রায়', en: 'Dr. Sudip Roy' };
const CRED = { bn: 'এমবিবিএস, এমডি, ডিএম (ক্লিনিক্যাল হেমাটোলজি)', en: 'MBBS, MD, DM (Clinical Hematology)' };
const SITE_NAME = { bn: 'কলকাতা হেমাটোলজি ইনস্টিটিউট', en: 'Kolkata Hematology Institute' };
const LANGS = ['bn', 'en'];
// One identity for the site, the author and the publisher, so search engines and AI systems
// can tie every page to the same person. The home page carries the full records; chapter pages point to them by @id.
// The publisher stays a MedicalOrganization, and no chamber name goes on the site (Dr. Roy, 2026-11-21).
const ID = { org: `${SITE}/#org`, author: `${SITE}/#author`, site: `${SITE}/#website` };
// Same words as the home page's meta description.
const SITE_DESC = 'Blood diseases explained in plain words, in Bengali and English, by a clinical hematologist.';
const AREA = { '@type': 'City', name: 'Kolkata' };
// Paste profile links here when they exist (Google Business Profile, LinkedIn, YouTube...).
// They go into the schema as sameAs, which lets search engines and AI systems confirm the author is a real doctor.
const SAME_AS = [];

const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const RIGHT = `<svg viewBox="0 0 16 16" ${STROKE}><path d="M3 8h10M9 4l4 4-4 4"/></svg>`;
const LEFT = `<svg viewBox="0 0 16 16" ${STROKE}><path d="M13 8H3M7 4L3 8l4 4"/></svg>`;
const LOGO = '<svg viewBox="0 0 200 240" aria-hidden="true"><path d="M100 10 C100 10 30 104 30 160 A70 70 0 0 0 170 160 C170 104 100 10 100 10 Z" fill="#FFF1F3" stroke="#0F2A4A" stroke-width="10" stroke-linejoin="round"/><circle cx="78" cy="172" r="28" fill="#B0182F"/><circle cx="78" cy="172" r="11" fill="#E46A7B"/><circle cx="124" cy="128" r="24" fill="#B9A3D9"/><circle cx="120" cy="128" r="10" fill="#5B3F8C"/><circle cx="134" cy="184" r="9" fill="#8B6BB5"/></svg>';
const AVATAR = '<svg class="av" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="26" fill="#CFE6DF"/><circle cx="26" cy="20" r="8" fill="#0B3F3D"/><path d="M10 44c2-10 9-14 16-14s14 4 16 14" fill="#0B3F3D"/></svg>';
const ICON = {
  warn: `<svg viewBox="0 0 30 30" ${STROKE}><path d="M15 4.5 27 25.5H3z"/><path d="M15 12.5v6"/><path d="M15 22v.4"/></svg>`,
  ask: `<svg viewBox="0 0 30 30" ${STROKE}><rect x="6" y="5" width="18" height="21" rx="3"/><path d="M11 5V3.5h8V5"/><path d="m10.5 13 2 2 3.5-3.5M10.5 20.5l2 2 3.5-3.5M19.5 13.5H21M19.5 21H21"/></svg>`,
  key: `<svg viewBox="0 0 30 30" ${STROKE}><path d="M15 4a8 8 0 0 0-4.5 14.6V21h9v-2.4A8 8 0 0 0 15 4z"/><path d="M11.5 25h7"/></svg>`,
};

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ic = (art, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 52 52" aria-hidden="true">${art}</svg>`;
const PATHS = {}; // chapter id -> address on the site, filled in once chapters/list.json is read
const url = (id, l) => (l === 'en' ? `/en/${PATHS[id] || id}/` : `/${PATHS[id] || id}/`);
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const bnNum = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);

// The chapter text, broken into pieces: headings, paragraphs and lists.
function tokens(txt) {
  const out = [];
  for (const block of txt.replace(/\r/g, '').split(/\n\s*\n/)) {
    let para = [], list = [];
    const flushP = () => { if (para.length) { out.push({ t: 'p', lines: para }); para = []; } };
    const flushL = () => { if (list.length) { out.push({ t: 'ul', items: list }); list = []; } };
    for (let line of block.split('\n')) {
      line = line.trim();
      if (!line) continue;
      const fig = line.match(/^\[\s*(figure|video)\s*:\s*([a-z0-9-]+)\s*\]$/i);
      if (fig) { flushP(); flushL(); out.push({ t: fig[1].toLowerCase() === 'video' ? 'vid' : 'fig', name: fig[2].toLowerCase() }); }
      else if (/^##\s/.test(line)) { flushP(); flushL(); out.push({ t: 'h3', text: line.replace(/^##\s*/, '') }); }
      else if (/^#\s/.test(line)) { flushP(); flushL(); out.push({ t: 'h2', text: line.replace(/^#\s*/, '') }); }
      else if (/^[-•]\s/.test(line)) { flushP(); list.push(line.replace(/^[-•]\s*/, '')); }
      else { flushL(); para.push(line); }
    }
    flushP(); flushL();
  }
  return out;
}
let LANG = 'en'; // the language of the page being built, for figures
function html(tk, firstClass = '') {
  let first = true;
  return tk.map((x) => {
    if (x.t === 'fig') return figure(x.name, LANG);
    if (x.t === 'vid') return video(x.name, LANG);
    if (x.t === 'p') { const c = first && firstClass ? ` class="${firstClass}"` : ''; first = false; return `<p${c}>${x.lines.map(esc).join('<br>')}</p>`; }
    first = false;
    if (x.t === 'ul') return `<ul>${x.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (x.t === 'h3') return `<h3>${esc(x.text)}</h3>`;
    return `<h2>${esc(x.text)}</h2>`;
  }).join('');
}
const textOf = (tk) => tk.filter((x) => x.t !== 'fig' && x.t !== 'vid').map((x) => (x.t === 'p' ? x.lines.join(' ') : x.t === 'ul' ? x.items.join(' ') : x.text)).join(' ');

// Which special dress a section gets, from the words in its heading.
function kind(title) {
  if (/go to (a |the )?hospital/i.test(title) || /হাসপাতালে যান/.test(title)) return 'warn';
  if (/common questions/i.test(title) || /জানতে চান/.test(title)) return 'faq';
  if (/question|ask your doctor/i.test(title) || /প্রশ্ন|জিজ্ঞেস/.test(title)) return 'ask';
  if (/main points/i.test(title) || /মূল কথা/.test(title)) return 'key';
  return '';
}

function chapterBody(txt) {
  const tk = tokens(txt);
  const firstH = tk.findIndex((x) => x.t === 'h2');
  const opening = firstH === -1 ? tk : tk.slice(0, firstH);
  const rest = firstH === -1 ? [] : tk.slice(firstH);
  const sections = [];
  for (const x of rest) { if (x.t === 'h2') sections.push({ title: x.text, tk: [] }); else sections[sections.length - 1].tk.push(x); }

  let out = '';
  if (opening.length) {
    const p0 = opening[0].t === 'p' ? opening[0].lines.join(' ') : '';
    const cls = p0 && p0.length <= 110 && opening.length > 1 ? 'hookline' : 'lede';
    out += `<div class="story">${html(opening, cls)}</div>`;
    if (sections.length) out += '<div class="sep" aria-hidden="true"><i></i><i></i><i></i></div>';
  }
  const faq = [];
  out += '<div class="prose">';
  for (const s of sections) {
    const k = kind(s.title);
    if (k === 'faq') {
      const pre = []; const items = [];
      for (const x of s.tk) { if (x.t === 'h3') items.push({ q: x.text, tk: [] }); else if (items.length) items[items.length - 1].tk.push(x); else pre.push(x); }
      out += `<section class="faq"><h2>${esc(s.title)}</h2>${html(pre)}` +
        items.map((it) => `<details><summary>${esc(it.q)}</summary><div>${html(it.tk)}</div></details>`).join('') + '</section>';
      for (const it of items) faq.push({ q: it.q, a: textOf(it.tk) });
    } else if (k) {
      out += `<section class="box ${k}"><h2>${ICON[k]}<span>${esc(s.title)}</span></h2>${html(s.tk)}</section>`;
    } else {
      out += `<h2>${esc(s.title)}</h2>${html(s.tk)}`;
    }
  }
  out += '</div>';
  return { html: out, faq };
}

function plain(txt) {
  return txt.replace(/\r/g, '').split('\n').filter((l) => l.trim() && !/^#/.test(l.trim()) && !/^\[\s*(figure|video)\s*:/i.test(l.trim())).map((l) => l.replace(/^[-•]\s*/, '').trim()).join(' ');
}
function summary(txt, max = 155) {
  const t = plain(txt);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('। '));
  return (i > 60 ? cut.slice(0, i + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…');
}
// The first sentence of the chapter: the line on its home page card.
function teaser(txt, max = 130) {
  const first = (tokens(txt).find((x) => x.t === 'p') || { lines: [''] }).lines.join(' ');
  const m = first.match(/^.*?[.!?।](?=\s|$)/);
  let s = (m ? m[0] : first).trim();
  if (s.length > max) s = s.slice(0, s.lastIndexOf(' ', max)) + '…';
  return s;
}
function readTime(txt, l) {
  const n = Math.max(1, Math.round(plain(txt).split(/\s+/).length / 200));
  return l === 'bn' ? `${bnNum(n)} মিনিটে পড়ুন` : `${n} min read`;
}
function reviewed(file) {
  try {
    // A file changed but not yet committed counts as changed today.
    const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (dirty) return new Date().toISOString().slice(0, 10);
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (d) return d;
  } catch {}
  return new Date().toISOString().slice(0, 10);
}
function niceDate(iso, l) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(l === 'bn' ? 'bn-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

const index = read('index.html');
const style = index.match(/<style>[\s\S]*?<\/style>/)[0];
const fonts = index.match(/<link rel="preconnect"[\s\S]*?rel="stylesheet">/)[0];
const footer = index.match(/<footer>[\s\S]*?<\/footer>/)[0];
const chapters = JSON.parse(read('chapters/list.json'));
const byId = Object.fromEntries(chapters.map((c) => [c.id, c]));
for (const c of chapters) {
  if (c.parent && !byId[c.parent]) throw new Error(`${c.id}: parent "${c.parent}" is not in chapters/list.json`);
  PATHS[c.id] = c.parent ? `${c.parent}/${c.slug || c.id.replace(new RegExp(`^${c.parent}-`), '')}` : c.id;
}
const kids = (id) => chapters.filter((x) => x.parent === id);
const short = (c, l) => c[l].split(/[:：]/)[0].trim();
// A part's own name without the chapter's name in front: "Thalassemia: how it runs in families" -> "How it runs in families".
function partTitle(c, l) {
  const p = byId[c.parent];
  let t = c[l];
  if (p) { const pre = short(p, l); if (t.startsWith(pre)) t = t.slice(pre.length).replace(/^\s*[:：]\s*/, ''); }
  return l === 'en' ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

const info = {};
for (const c of chapters) {
  const text = {}, has = {};
  for (const l of LANGS) {
    const f = `chapters/${c.id}.${l}.txt`;
    text[l] = existsSync(join(ROOT, f)) ? read(f).trim() : '';
    has[l] = !!text[l];
  }
  info[c.id] = { text, has };
}

// "In this chapter": the chapter itself (the basics) and every part, in list order.
function partsNav(c, l) {
  const root = c.parent ? byId[c.parent] : c;
  const ks = kids(root.id).filter((x) => info[x.id].has[l]);
  if (!ks.length) return '';
  const rows = [root, ...ks].map((x, i) => {
    const label = i === 0 ? (l === 'bn' ? 'গোড়ার কথা' : 'The basics') : partTitle(x, l);
    const n = `<span class="n">${l === 'bn' ? bnNum(i + 1) : i + 1}</span>`;
    if (x.id === c.id) return `<li aria-current="page"><span class="row">${n}<span>${esc(label)}</span></span></li>`;
    return `<li><a class="row" href="${url(x.id, l)}">${n}<span>${esc(label)}</span></a></li>`;
  }).join('');
  return `<nav class="parts" aria-label="${l === 'bn' ? 'এই অধ্যায়ে যা আছে' : 'In this chapter'}"><div class="k">${l === 'bn' ? `${esc(short(root, l))}: এই অধ্যায়ে যা আছে` : `${esc(short(root, l))}: in this chapter`}</div><ol>${rows}</ol></nav>`;
}
// The next written part after this one, for the card at the end of the page.
function nextPart(c, l) {
  const root = c.parent ? byId[c.parent] : c;
  const all = [root, ...kids(root.id)];
  const i = all.findIndex((x) => x.id === c.id);
  const nx = all.slice(i + 1).find((x) => info[x.id].has[l]);
  if (!nx) return '';
  return `<a class="nextpart" href="${url(nx.id, l)}"><span><span class="k">${l === 'bn' ? `${esc(short(root, l))}: এরপর পড়ুন` : `Next in ${esc(short(root, l))}`}</span><span class="t">${esc(partTitle(nx, l))}</span></span><span class="go">${RIGHT}</span></a>`;
}
// The old flat address of a part (/thalassemia-inheritance/) sends readers on to the new one.
function redirectPage(to) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex">
<link rel="canonical" href="${SITE + to}"><meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)}+location.hash);</script></head>
<body><p><a href="${to}">${to}</a></p></body></html>
`;
}

// Remove a page this script made earlier, for a chapter or part that has no words yet.
function removeGenerated(rel) {
  const f = join(ROOT, rel);
  if (!existsSync(f) || !/Written by tools\/build\.mjs|<title>Moved<\/title>/.test(read(rel))) return;
  rmSync(f);
  let d = dirname(f);
  while (d !== ROOT && existsSync(d) && readdirSync(d).length === 0) { rmdirSync(d); d = dirname(d); }
}

const pages = [];
for (const c of chapters) {
  const { text, has } = info[c.id];
  // Nothing written yet in either language: no page, no card, no link anywhere (Dr. Roy, 2026-11-18).
  if (!has.bn && !has.en) {
    for (const p of [PATHS[c.id], c.id]) { removeGenerated(`${p}/index.html`); removeGenerated(`en/${p}/index.html`); }
    continue;
  }
  const root = c.parent ? byId[c.parent] : null;
  for (const l of LANGS) {
    const other = l === 'bn' ? 'en' : 'bn';
    const title = c[l];
    const live = has[l];
    const desc = (c[`desc_${l}`] || '').trim() || (live ? summary(text[l]) : '');
    const date = live ? reviewed(`chapters/${c.id}.${l}.txt`) : '';
    const canonical = SITE + url(c.id, l);
    let body, kick = '', schema = '';
    if (live) {
      LANG = l;
      const b = chapterBody(text[l]);
      kick = root ? `${esc(short(root, l))} · ${readTime(text[l], l)}` : readTime(text[l], l);
      body = `<div class="by">${AVATAR}<div><b>${l === 'bn' ? `লিখেছেন ${AUTHOR.bn}` : `By ${AUTHOR.en}`}</b>${CRED[l]}<br>${l === 'bn' ? `শেষ আপডেট ${niceDate(date, 'bn')}` : `Last updated ${niceDate(date, 'en')}`}</div></div>` +
        partsNav(c, l) +
        `<article>${b.html}</article>` + nextPart(c, l) +
        `<aside class="endcard">${AVATAR}<div><div class="k">${l === 'bn' ? 'লেখক' : 'Author'}</div><div class="who">${AUTHOR[l]}</div><div class="cred">${CRED[l]}</div></div></aside>` +
        `<a class="allbtn" href="/#library">${LEFT}${l === 'bn' ? 'সব অধ্যায়' : 'All chapters'}</a>`;
      schema = ld({
        '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: title, description: desc, inLanguage: l,
        url: canonical, dateModified: date, about: { '@type': 'MedicalCondition', name: c.en.split(':')[0] },
        audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
        author: { '@type': 'Person', '@id': ID.author, name: AUTHOR.en, jobTitle: 'Clinical Hematologist', honorificSuffix: CRED.en },
        publisher: { '@type': 'MedicalOrganization', '@id': ID.org, name: SITE_NAME.en, url: SITE + '/' },
        isPartOf: { '@id': ID.site },
        ...(root ? { isPartOf: { '@type': 'MedicalWebPage', name: root[l], url: SITE + url(root.id, l) } } : {}),
      });
      if (b.faq.length) schema += '\n' + ld({
        '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: l,
        mainEntity: b.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      });
    } else if (has[other]) {
      body = `<div class="slot"><p>${l === 'bn'
        ? `এই অধ্যায়টি এখন শুধু ইংরেজিতে আছে। <a href="${url(c.id, 'en')}"><u>ইংরেজিতে পড়ুন</u></a>।`
        : `This chapter is available in Bengali for now. <a href="${url(c.id, 'bn')}"><u>Read it in Bengali</u></a>.`}</p></div>`;
    } else {
      body = `<div class="slot"><span class="note">${l === 'bn' ? 'এই অধ্যায়ের লেখা এখানে বসবে' : 'The script for this chapter goes here'}</span>` +
        '<div class="sk" style="width:96%"></div><div class="sk" style="width:88%"></div><div class="sk" style="width:92%"></div><div class="sk" style="width:60%"></div>' +
        '<div class="sk h"></div><div class="sk" style="width:94%"></div><div class="sk" style="width:86%"></div><div class="sk" style="width:72%"></div></div>';
    }
    const alt = LANGS.filter((x) => has[x]).map((x) => `<link rel="alternate" hreflang="${x}" href="${SITE + url(c.id, x)}">`).join('\n');
    const page = `<!DOCTYPE html>
<!-- Written by tools/build.mjs from chapters/${c.id}.${l}.txt. Do not edit this file: edit the .txt file instead. -->
<html lang="${l}" data-lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#FAF5EC">
<title>${esc(title)} | ${SITE_NAME[l]}</title>
${desc ? `<meta name="description" content="${esc(desc)}">` : ''}
${live ? '' : '<meta name="robots" content="noindex">'}
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${live ? alt + (has.bn ? `\n<link rel="alternate" hreflang="x-default" href="${SITE + url(c.id, 'bn')}">` : '') : ''}
<meta property="og:title" content="${esc(title)}">
${desc ? `<meta property="og:description" content="${esc(desc)}">` : ''}
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/assets/logo-mark.png">
<meta name="twitter:card" content="summary">
${fonts}
${style}
${schema}
</head>
<body>
<div class="progress" aria-hidden="true"></div>

<header><div class="wrap bar">
  <a class="brand" href="/">${LOGO}<span class="nm">${SITE_NAME[l]}</span></a>
  <div class="right">
    <a class="nav" href="/#about">${l === 'bn' ? 'পরিচিতি' : 'About'}</a>
    <div class="lang" role="group" aria-label="Language">
      <a href="${url(c.id, 'bn')}" hreflang="bn" ${l === 'bn' ? 'aria-current="true"' : ''} data-l="bn">বাং</a>
      <a href="${url(c.id, 'en')}" hreflang="en" ${l === 'en' ? 'aria-current="true"' : ''} data-l="en">EN</a>
    </div>
  </div>
</div></header>

<main class="read">
${root ? `<a class="back" href="${url(root.id, l)}">${LEFT}${esc(short(root, l))}</a>` : `<a class="back" href="/#library">${LEFT}${l === 'bn' ? 'সব অধ্যায়' : 'All chapters'}</a>`}
<div class="chead">${ic(c.art, 'big')}${kick ? `<span class="kick">${kick}</span>` : ''}<h1>${esc(root ? partTitle(c, l) : title)}</h1></div>
${body}
</main>

${footer}

<script>
(function(){
document.documentElement.classList.add('js');
/* Remember the language this reader chose, so the home page opens in it next time. */
try{localStorage.setItem('khi-lang','${l}');}catch(e){}
document.querySelectorAll('.lang a').forEach(function(a){a.addEventListener('click',function(){try{localStorage.setItem('khi-lang',a.getAttribute('data-l'));}catch(e){}});});
/* The thin line at the top grows as the reader moves down the chapter. */
var bar=document.querySelector('.progress'),art=document.querySelector('article');
function grow(){if(!art)return;var r=art.getBoundingClientRect(),total=r.height-window.innerHeight*0.6;
  var p=total>0?Math.min(1,Math.max(0,-r.top/total)):0;bar.style.setProperty('--p',p.toFixed(3));}
window.addEventListener('scroll',grow,{passive:true});window.addEventListener('resize',grow);grow();
/* Sections fade up as they come into view. */
var calm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Dr. Roy's videos: no download menu, start muted when scrolled into view, pause when scrolled away. */
document.querySelectorAll('figure.vid').forEach(function(fig){
  var v=fig.querySelector('video'),pp=fig.querySelector('.vplay'),snd=fig.querySelector('.vsnd'),bar=fig.querySelector('.vbar i');
  if(!v)return;
  v.muted=true;v.controls=false;
  fig.addEventListener('contextmenu',function(e){e.preventDefault();});
  function sync(){fig.classList.toggle('playing',!v.paused);fig.classList.toggle('sound',!v.muted);
    pp.setAttribute('aria-label',v.paused?fig.dataset.lPlay:fig.dataset.lPause);
    snd.setAttribute('aria-label',v.muted?fig.dataset.lOn:fig.dataset.lOff);}
  ['play','pause','volumechange'].forEach(function(ev){v.addEventListener(ev,sync);});
  v.addEventListener('ended',function(){fig.classList.add('ended');sync();});
  v.addEventListener('timeupdate',function(){if(v.duration)bar.style.width=(100*v.currentTime/v.duration)+'%';});
  function toggle(){if(v.paused){fig.classList.remove('ended');fig.removeAttribute('data-held');v.play().catch(function(){});}
    else{v.pause();fig.setAttribute('data-held','1');}}
  pp.addEventListener('click',toggle);v.addEventListener('click',toggle);
  snd.addEventListener('click',function(){v.muted=!v.muted;if(!v.muted&&v.paused){fig.classList.remove('ended');fig.removeAttribute('data-held');v.play().catch(function(){});}sync();});
  var saver=navigator.connection&&navigator.connection.saveData;
  if(!calm&&!saver&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting&&e.intersectionRatio>=0.6){if(v.paused&&!fig.classList.contains('ended')&&!fig.hasAttribute('data-held'))v.play().catch(function(){});}
      else if(!v.paused)v.pause();
    });},{threshold:[0,0.6]}).observe(fig);
  }
  sync();
});
/* Figures the reader can touch (tools/figures.mjs). Each one shows a small demonstration once when it
   first comes into view, unless the reader has asked for less motion or has already touched it. */
var bnd='০১২৩৪৫৬৭৮৯',isbn=document.documentElement.lang==='bn';
function num(n){var x=String(n);return isbn?x.replace(/\\d/g,function(d){return bnd[+d];}):x;}
function onView(el,ratio,fn){if(calm||!('IntersectionObserver' in window))return;
  var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=ratio){o.disconnect();fn();}});},{threshold:[ratio]});o.observe(el);}
document.querySelectorAll('.try.hp').forEach(function(f){
  var r=f.querySelector('input'),say=f.querySelector('.hp-say'),S=JSON.parse(f.getAttribute('data-s')),cells=f.querySelectorAll('.hp-c'),touched=false;
  function set(i){var s=S[i];f.style.setProperty('--beat',s.b+'s');f.style.setProperty('--flow',s.f+'s');
    cells.forEach(function(c){c.style.opacity=+c.getAttribute('data-r')<s.n?1:0;});say.textContent=s.t;r.setAttribute('aria-valuetext',s.v);f.classList.toggle('hp-alarm',i===S.length-1);}
  r.addEventListener('input',function(){touched=true;set(+r.value);});set(+r.value);
  onView(f,0.6,function(){var seq=[1,2,3,0],k=0;(function step(){if(touched||k>=seq.length)return;r.value=seq[k];set(seq[k]);k++;setTimeout(step,1700);})();});
});
document.querySelectorAll('.try.chk').forEach(function(f){
  var bs=f.querySelectorAll('.chk-i'),msg=f.querySelector('.chk-msg'),warn=f.querySelector('.chk-warn'),sh=f.querySelector('.chk-share'),D=f.dataset,on=[],label=sh.textContent;
  function upd(){on=[];var red=false;bs.forEach(function(b){if(b.getAttribute('aria-pressed')==='true'){on.push(b.textContent);if(b.classList.contains('red'))red=true;}});
    warn.hidden=!red;sh.hidden=!on.length;sh.textContent=label;msg.textContent=on.length?D.many.replace('{n}',num(on.length)):D.none;}
  bs.forEach(function(b){b.addEventListener('click',function(){b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true');upd();});});
  sh.addEventListener('click',function(){var t=D.head+'\\n'+on.map(function(x){return '- '+x;}).join('\\n')+'\\n\\n'+D.ask+'\\n'+location.href.split('#')[0];
    if(navigator.share){navigator.share({text:t}).catch(function(){});}
    else if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){sh.textContent=D.copied;}).catch(function(){});}});
  upd();
});
document.querySelectorAll('.try.flipset').forEach(function(f){
  var cs=f.querySelectorAll('.flip'),touched=false;
  cs.forEach(function(c){c.addEventListener('click',function(){touched=true;c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')==='true'?'false':'true');});});
  onView(f,0.5,function(){setTimeout(function(){if(touched)return;cs[0].setAttribute('aria-pressed','true');
    setTimeout(function(){if(!touched)cs[0].setAttribute('aria-pressed','false');},2800);},900);});
});
document.querySelectorAll('.try.gap').forEach(function(f){
  var bs=f.querySelectorAll('.gap-b'),touched=false;
  function pick(m){f.setAttribute('data-mode',m);bs.forEach(function(x){x.setAttribute('aria-pressed',x.getAttribute('data-m')===m?'true':'false');});}
  bs.forEach(function(b){b.addEventListener('click',function(){touched=true;pick(b.getAttribute('data-m'));});});
  onView(f,0.6,function(){setTimeout(function(){if(!touched)pick('food');setTimeout(function(){if(!touched)pick('milk');},2600);},3000);});
});
document.querySelectorAll('.try.baby').forEach(function(f){
  var go=f.querySelector('.bc-go'),again=f.querySelector('.bc-again'),say=f.querySelector('.bc-say'),dots=f.querySelector('.bc-dots'),
    ms=f.querySelectorAll('.bc-m'),D=f.dataset,kids=[],busy=false,touched=false;
  function clear(){['data-pm','data-pf','data-cl','data-cr','data-kid'].forEach(function(a){f.removeAttribute(a);});}
  function tally(){var n={ok:0,car:0,maj:0};kids.forEach(function(k){n[k]++;});
    f.querySelectorAll('.bc-legs b').forEach(function(b){b.textContent=num(n[b.getAttribute('data-k')]);});
    dots.innerHTML=kids.slice(-30).map(function(k){return '<i class="'+k+'"></i>';}).join('');}
  function reset(){kids=[];clear();tally();say.textContent=D.start;}
  function baby(){if(busy)return;busy=true;clear();void f.getBoundingClientRect();
    var pm=Math.random()<0.5?0:1,pf=Math.random()<0.5?0:1,both=f.getAttribute('data-mode')==='both';
    var fm=pm===1,ff=both&&pf===1,k=fm&&ff?'maj':(fm||ff?'car':'ok');
    f.setAttribute('data-pm',pm);f.setAttribute('data-pf',pf);
    setTimeout(function(){f.setAttribute('data-cl',fm?'beta':'ok');f.setAttribute('data-cr',ff?'beta':'ok');f.setAttribute('data-kid',k);
      kids.push(k);tally();say.textContent=D[k];busy=false;},calm?0:950);}
  go.addEventListener('click',function(){touched=true;baby();});
  again.addEventListener('click',function(){touched=true;reset();});
  ms.forEach(function(b){b.addEventListener('click',function(){touched=true;f.setAttribute('data-mode',b.getAttribute('data-m'));
    ms.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});reset();});});
  onView(f,0.5,function(){setTimeout(function(){if(!touched)baby();},800);});
});
document.querySelectorAll('.try.tr').forEach(function(f){
  var bs=f.querySelectorAll('.tr-b'),ps=f.querySelectorAll('.tr-p'),out=f.querySelector('.tr-out'),touched=false;
  function show(i){out.classList.add('has');bs.forEach(function(b,k){b.setAttribute('aria-pressed',k===i?'true':'false');});ps.forEach(function(x,k){x.hidden=k!==i;});}
  bs.forEach(function(b,i){b.addEventListener('click',function(){touched=true;show(i);});});
  onView(f,0.5,function(){var k=0;(function step(){if(touched||k>2)return;show(k);k++;setTimeout(step,3200);})();});
});
document.querySelectorAll('.try.tm').forEach(function(f){
  var cards=f.querySelectorAll('.tm-card'),dots=f.querySelectorAll('.tm-dots i'),end=f.querySelector('.tm-end'),D=f.dataset,k=0,cur=0;
  function go(i){cur=i;cards.forEach(function(c,j){c.hidden=j!==i;});dots.forEach(function(d,j){d.classList.toggle('now',j===i&&!d.className.match(/ok|no/));});}
  cards.forEach(function(c,i){
    var bs=c.querySelectorAll('.tm-ch button'),fb=c.querySelector('.tm-fb'),v=c.querySelector('.tm-v');
    bs.forEach(function(b){b.addEventListener('click',function(){if(!fb.hidden)return;var ok=b.getAttribute('data-c')===c.getAttribute('data-ans');
      if(ok)k++;bs.forEach(function(x){x.disabled=true;x.classList.toggle('picked',x.getAttribute('data-c')===c.getAttribute('data-ans'));});
      v.className='tm-v '+(ok?'ok':'no');v.textContent=ok?D.right:D.wrong+' '+D[c.getAttribute('data-ans')];
      dots[i].className=ok?'ok':'no';fb.hidden=false;});});
    c.querySelector('.tm-next').addEventListener('click',function(){if(i+1<cards.length)go(i+1);else{c.hidden=true;end.hidden=false;
      end.querySelector('.tm-score').textContent=D.end.replace('{k}',num(k)).replace('{n}',D.n);}});
  });
  end.querySelector('.tm-again').addEventListener('click',function(){k=0;end.hidden=true;dots.forEach(function(d){d.className='';});
    cards.forEach(function(c){c.querySelector('.tm-fb').hidden=true;c.querySelectorAll('.tm-ch button').forEach(function(x){x.disabled=false;x.classList.remove('picked');});});go(0);});
  go(0);
});
document.querySelectorAll('.try.kd').forEach(function(f){
  var cards=f.querySelectorAll('.tm-card'),end=f.querySelector('.tm-end'),D=f.dataset,st=0,pushes=0,SP=['6s','2.4s','0.9s'],DR=['22px','58px','90px'];
  function setS(x){st=x;f.setAttribute('data-s',x);f.style.setProperty('--spin',SP[x]);f.style.setProperty('--drop',DR[x]);}
  function go(i){cards.forEach(function(c,j){c.hidden=j!==i;});}
  cards.forEach(function(c,i){var bs=c.querySelectorAll('.tm-ch button'),fb=c.querySelector('.tm-fb'),why=c.querySelector('.tm-why');
    bs.forEach(function(b){b.addEventListener('click',function(){if(!fb.hidden)return;
      if(b.getAttribute('data-c')==='push'){pushes++;setS(Math.min(st+1,2));}else setS(0);
      bs.forEach(function(x){x.disabled=true;x.classList.toggle('picked',x===b);});why.textContent=D['s'+st];fb.hidden=false;});});
    c.querySelector('.tm-next').addEventListener('click',function(){if(i+1<cards.length)go(i+1);
      else{c.hidden=true;end.hidden=false;end.querySelector('.tm-score').textContent=pushes?D.some:D.none;}});});
  end.querySelector('.tm-again').addEventListener('click',function(){pushes=0;setS(0);end.hidden=true;
    cards.forEach(function(c){c.querySelector('.tm-fb').hidden=true;c.querySelectorAll('.tm-ch button').forEach(function(x){x.disabled=false;x.classList.remove('picked');});});go(0);});
  setS(0);go(0);
});
if(!calm&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.box,.faq,.endcard').forEach(function(el){el.classList.add('rv');io.observe(el);});
}
})();
</script>
</body>
</html>
`;
    const out = l === 'en' ? `en/${PATHS[c.id]}/index.html` : `${PATHS[c.id]}/index.html`;
    // A part that used to live at a flat address keeps a redirect there, so old links still work.
    const old = l === 'en' ? `en/${c.id}/index.html` : `${c.id}/index.html`;
    if (PATHS[c.id] !== c.id && existsSync(join(ROOT, old))) writeFileSync(join(ROOT, old), redirectPage(url(c.id, l)));
    mkdirSync(join(ROOT, dirname(out)), { recursive: true });
    writeFileSync(join(ROOT, out), page.replace(/^\s*\n/gm, ''));
    if (live) pages.push({ loc: canonical, lastmod: date, alts: LANGS.filter((x) => has[x]).map((x) => [x, SITE + url(c.id, x)]) });
  }
}

// Home page: chapters only. Parts live inside their chapter.
// A chapter with words gets a card with its card line (or, failing that, its first sentence).
// A chapter with no words yet is not shown.
let grid = '';
for (const c of chapters) {
  if (c.parent) continue;
  const { text, has } = info[c.id];
  for (const l of LANGS) {
    const other = l === 'bn' ? 'en' : 'bn';
    if (!has.bn && !has.en) continue; // not written yet: not shown
    const own = (c[`card_${l}`] || '').trim();
    const hook = !has[l] ? (l === 'bn' ? 'এই অধ্যায়টি এখন শুধু ইংরেজিতে আছে।' : 'This chapter is in Bengali for now.')
      : own ? esc(own) : `“${esc(teaser(text[l]))}”`;
    const parts = 1 + kids(c.id).filter((x) => info[x.id].has[l]).length;
    const meta = parts > 1 ? (l === 'bn' ? `${bnNum(parts)}টি পর্ব` : `${parts} parts`)
      : has[l] ? readTime(text[l], l) : readTime(text[other], other);
    grid += `<a class="card" lang="${l}" href="${url(c.id, l)}">${ic(c.art, 'deco')}<span class="top">${ic(c.art)}<h2>${esc(c[l])}</h2></span>` +
      `<span class="hook">${hook}</span><span class="meta"><span>${meta}</span><span class="go">${RIGHT}</span></span></a>\n`;
  }
}
const soon = ''; // Chapters with no words yet are not shown at all (Dr. Roy, 2026-11-18), so there is no "Coming soon" list.
let home = index.replace(/(<!-- grid:start[^>]*-->\n)[\s\S]*?(<!-- grid:end -->)/, (m, a, b) => a + grid + b)
  .replace(/(<!-- soon:start[^>]*-->\n)[\s\S]*?(<!-- soon:end -->)/, (m, a, b) => a + soon + b)
  .replace(/\/\*ids:start\*\/[\s\S]*?\/\*ids:end\*\//, `/*ids:start*/${JSON.stringify(chapters.filter((c) => !c.parent && (info[c.id].has.bn || info[c.id].has.en)).map((c) => c.id))}/*ids:end*/`);
if (!/rel="canonical"/.test(home)) home = home.replace('</title>', `</title>\n<link rel="canonical" href="${SITE}/">`);
const homeHead = `<!-- site:start (written by tools/build.mjs) -->
<meta property="og:title" content="${SITE_NAME.en}">
<meta property="og:description" content="${esc(SITE_DESC)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/">
<meta name="twitter:card" content="summary">
${ld({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'MedicalOrganization', '@id': ID.org, name: SITE_NAME.en, alternateName: SITE_NAME.bn, url: SITE + '/',
      logo: `${SITE}/assets/logo-mark.png`, description: SITE_DESC, medicalSpecialty: 'Hematologic', areaServed: AREA,
      founder: { '@id': ID.author }, member: { '@id': ID.author }, ...(SAME_AS.length ? { sameAs: SAME_AS } : {}) },
    { '@type': 'Person', '@id': ID.author, name: AUTHOR.en, alternateName: AUTHOR.bn, honorificSuffix: CRED.en,
      jobTitle: 'Clinical Hematologist', url: `${SITE}/#about`, workLocation: AREA, worksFor: { '@id': ID.org },
      hasOccupation: { '@type': 'Occupation', name: 'Clinical Hematologist', occupationLocation: AREA },
      knowsAbout: ['Hematology', 'Anaemia', 'Iron deficiency', 'Vitamin B12 deficiency', 'Thalassemia', 'HbE', 'Blood transfusion', 'Iron chelation'],
      ...(SAME_AS.length ? { sameAs: SAME_AS } : {}) },
    { '@type': 'WebSite', '@id': ID.site, url: SITE + '/', name: SITE_NAME.en, alternateName: SITE_NAME.bn,
      description: SITE_DESC, inLanguage: LANGS, publisher: { '@id': ID.org } },
  ],
})}
<!-- site:end -->`;
home = /<!-- site:start[\s\S]*?<!-- site:end -->/.test(home)
  ? home.replace(/<!-- site:start[\s\S]*?<!-- site:end -->/, () => homeHead)
  : home.replace('</head>', () => homeHead + '\n</head>');
writeFileSync(join(ROOT, 'index.html'), home);

// sitemap.xml: the home page plus every chapter page that has words in it.
const today = new Date().toISOString().slice(0, 10);
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${SITE}/</loc>${pages.length ? `<lastmod>${pages.map((p) => p.lastmod).sort().pop()}</lastmod>` : ''}</url>
${pages.map((p) => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod>${p.alts.length > 1 ? p.alts.map(([x, h]) => `<xhtml:link rel="alternate" hreflang="${x}" href="${h}"/>`).join('') : ''}</url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), sm);
// llms.txt: a plain map of the site for AI systems (llmstxt.org), English first, then Bengali.
const liveIn = (l) => (c) => info[c.id].has[l];
const llmsList = (l) => chapters.filter((c) => !c.parent && liveIn(l)(c)).map((c) =>
  [`- [${c[l]}](${SITE + url(c.id, l)})${c[`desc_${l}`] ? `: ${c[`desc_${l}`].trim()}` : ''}`,
    ...kids(c.id).filter(liveIn(l)).map((k) => `  - [${partTitle(k, l)}](${SITE + url(k.id, l)})${k[`desc_${l}`] ? `: ${k[`desc_${l}`].trim()}` : ''}`)].join('\n')).join('\n');
writeFileSync(join(ROOT, 'llms.txt'), `# ${SITE_NAME.en} (${SITE_NAME.bn})

> ${SITE_DESC}

Author: ${AUTHOR.en}, ${CRED.en}, clinical hematologist in Kolkata. Every chapter exists in Bengali and in English, and each one ends with when to go to hospital and which questions to take to a doctor.

## Chapters (English)
${llmsList('en')}

## অধ্যায় (বাংলা)
${llmsList('bn')}
`);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`built ${2 * chapters.filter((c) => info[c.id].has.bn || info[c.id].has.en).length} chapter pages, ${pages.length} in the sitemap (${today})`);
