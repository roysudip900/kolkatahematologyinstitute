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
//
// How the page is dressed, with nothing extra to type:
//   - Everything before the first "# Heading" is the opening story. It is set in the serif
//     story type, and a short first line becomes the big headline line of the chapter.
//     That same first sentence is the teaser on the chapter's card on the home page.
//   - A section whose heading says "Go to a hospital ..." becomes the red warning box.
//   - A section whose heading has "questions" and "doctor" becomes the green checklist.
//   - A section headed "Common questions" becomes tap-to-open questions ("## " lines are the questions).
//   - A section headed "The main points" becomes a pale yellow box.
//   (The Bengali headings are recognised too. See kind() below.)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kolkatahematologyinstitute.com';
const AUTHOR = { bn: 'ডাঃ সুদীপ রায়', en: 'Dr. Sudip Roy' };
const CRED = { bn: 'এমবিবিএস, এমডি, ডিএম (ক্লিনিক্যাল হেমাটোলজি)', en: 'MBBS, MD, DM (Clinical Hematology)' };
const SITE_NAME = { bn: 'কলকাতা হেমাটোলজি ইনস্টিটিউট', en: 'Kolkata Hematology Institute' };
const LANGS = ['bn', 'en'];

const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const RIGHT = `<svg viewBox="0 0 16 16" ${STROKE}><path d="M3 8h10M9 4l4 4-4 4"/></svg>`;
const LEFT = `<svg viewBox="0 0 16 16" ${STROKE}><path d="M13 8H3M7 4L3 8l4 4"/></svg>`;
const LOGO = '<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="17" fill="#D8323F"/><circle cx="17" cy="17" r="8" fill="#F08A93"/></svg>';
const AVATAR = '<svg class="av" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="26" fill="#CFE6DF"/><circle cx="26" cy="20" r="8" fill="#0B3F3D"/><path d="M10 44c2-10 9-14 16-14s14 4 16 14" fill="#0B3F3D"/></svg>';
const ICON = {
  warn: `<svg viewBox="0 0 30 30" ${STROKE}><path d="M15 4.5 27 25.5H3z"/><path d="M15 12.5v6"/><path d="M15 22v.4"/></svg>`,
  ask: `<svg viewBox="0 0 30 30" ${STROKE}><rect x="6" y="5" width="18" height="21" rx="3"/><path d="M11 5V3.5h8V5"/><path d="m10.5 13 2 2 3.5-3.5M10.5 20.5l2 2 3.5-3.5M19.5 13.5H21M19.5 21H21"/></svg>`,
  key: `<svg viewBox="0 0 30 30" ${STROKE}><path d="M15 4a8 8 0 0 0-4.5 14.6V21h9v-2.4A8 8 0 0 0 15 4z"/><path d="M11.5 25h7"/></svg>`,
};

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ic = (art, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 52 52" aria-hidden="true">${art}</svg>`;
const url = (id, l) => (l === 'en' ? `/en/${id}/` : `/${id}/`);
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
      if (/^##\s/.test(line)) { flushP(); flushL(); out.push({ t: 'h3', text: line.replace(/^##\s*/, '') }); }
      else if (/^#\s/.test(line)) { flushP(); flushL(); out.push({ t: 'h2', text: line.replace(/^#\s*/, '') }); }
      else if (/^[-•]\s/.test(line)) { flushP(); list.push(line.replace(/^[-•]\s*/, '')); }
      else { flushL(); para.push(line); }
    }
    flushP(); flushL();
  }
  return out;
}
function html(tk, firstClass = '') {
  let first = true;
  return tk.map((x) => {
    if (x.t === 'p') { const c = first && firstClass ? ` class="${firstClass}"` : ''; first = false; return `<p${c}>${x.lines.map(esc).join('<br>')}</p>`; }
    first = false;
    if (x.t === 'ul') return `<ul>${x.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (x.t === 'h3') return `<h3>${esc(x.text)}</h3>`;
    return `<h2>${esc(x.text)}</h2>`;
  }).join('');
}
const textOf = (tk) => tk.map((x) => (x.t === 'p' ? x.lines.join(' ') : x.t === 'ul' ? x.items.join(' ') : x.text)).join(' ');

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
  return txt.replace(/\r/g, '').split('\n').filter((l) => l.trim() && !/^#/.test(l.trim())).map((l) => l.replace(/^[-•]\s*/, '').trim()).join(' ');
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
  return l === 'bn' ? `পড়তে ${bnNum(n)} মিনিট` : `${n} min read`;
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

const pages = [];
const info = {};
for (const c of chapters) {
  const text = {}, has = {};
  for (const l of LANGS) {
    const f = `chapters/${c.id}.${l}.txt`;
    text[l] = existsSync(join(ROOT, f)) ? read(f).trim() : '';
    has[l] = !!text[l];
  }
  info[c.id] = { text, has };
  for (const l of LANGS) {
    const other = l === 'bn' ? 'en' : 'bn';
    const title = c[l];
    const live = has[l];
    const desc = (c[`desc_${l}`] || '').trim() || (live ? summary(text[l]) : '');
    const date = live ? reviewed(`chapters/${c.id}.${l}.txt`) : '';
    const canonical = SITE + url(c.id, l);
    let body, kick = '', schema = '';
    if (live) {
      const b = chapterBody(text[l]);
      kick = readTime(text[l], l);
      body = `<div class="by">${AVATAR}<div><b>${l === 'bn' ? `লিখেছেন ${AUTHOR.bn}` : `By ${AUTHOR.en}`}</b>${CRED[l]}<br>${l === 'bn' ? `শেষ বদল ${niceDate(date, 'bn')}` : `Last updated ${niceDate(date, 'en')}`}</div></div>` +
        `<article>${b.html}</article>` +
        `<aside class="endcard">${AVATAR}<div><div class="k">${l === 'bn' ? 'লেখক' : 'Author'}</div><div class="who">${AUTHOR[l]}</div><div class="cred">${CRED[l]}</div></div></aside>` +
        `<a class="allbtn" href="/#library">${LEFT}${l === 'bn' ? 'সব অধ্যায়' : 'All chapters'}</a>`;
      schema = ld({
        '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: title, description: desc, inLanguage: l,
        url: canonical, dateModified: date, about: { '@type': 'MedicalCondition', name: c.en.split(':')[0] },
        author: { '@type': 'Person', name: AUTHOR.en, jobTitle: 'Clinical Hematologist', honorificSuffix: CRED.en },
        publisher: { '@type': 'MedicalOrganization', name: SITE_NAME.en, url: SITE + '/' },
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
${live ? alt + (has.bn ? `\n<link rel="alternate" hreflang="x-default" href="${SITE + url(c.id, 'bn')}">` : '') : ''}
<meta property="og:title" content="${esc(title)}">
${desc ? `<meta property="og:description" content="${esc(desc)}">` : ''}
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
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
<a class="back" href="/#library">${LEFT}${l === 'bn' ? 'সব অধ্যায়' : 'All chapters'}</a>
<div class="chead">${ic(c.art, 'big')}${kick ? `<span class="kick">${kick}</span>` : ''}<h1>${esc(title)}</h1></div>
${body}
</main>

${footer}

<script>
(function(){
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
if(!calm&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.box,.faq,.endcard').forEach(function(el){el.classList.add('rv');io.observe(el);});
}
})();
</script>
</body>
</html>
`;
    const out = l === 'en' ? `en/${c.id}/index.html` : `${c.id}/index.html`;
    mkdirSync(join(ROOT, dirname(out)), { recursive: true });
    writeFileSync(join(ROOT, out), page.replace(/^\s*\n/gm, ''));
    if (live) pages.push({ loc: canonical, lastmod: date, alts: LANGS.filter((x) => has[x]).map((x) => [x, SITE + url(c.id, x)]) });
  }
}

// Home page. A chapter with words gets a story card (its first line is the teaser).
// A chapter with no words yet is listed quietly under "Coming soon" and is not a link.
let grid = '', chips = { bn: '', en: '' };
for (const c of chapters) {
  const { text, has } = info[c.id];
  for (const l of LANGS) {
    const other = l === 'bn' ? 'en' : 'bn';
    if (!has.bn && !has.en) { chips[l] += `<span class="chip" lang="${l}">${ic(c.art)}${esc(c[l])}</span>`; continue; }
    const hook = has[l] ? `“${esc(teaser(text[l]))}”` : (l === 'bn' ? 'এই অধ্যায়টি এখন শুধু ইংরেজিতে আছে।' : 'This chapter is in Bengali for now.');
    const meta = has[l] ? readTime(text[l], l) : readTime(text[other], other);
    grid += `<a class="card" lang="${l}" href="${url(c.id, l)}">${ic(c.art, 'deco')}<span class="top">${ic(c.art)}<h3>${esc(c[l])}</h3></span>` +
      `<span class="hook">${hook}</span><span class="meta"><span>${meta}</span><span class="go">${RIGHT}</span></span></a>\n`;
  }
}
const soon = chips.bn ? `    <div class="soon"><div class="k"><span lang="bn">শীঘ্রই আসছে</span><span lang="en">Coming soon</span></div><div class="chips">${chips.bn}${chips.en}</div></div>\n` : '';
let home = index.replace(/(<!-- grid:start[^>]*-->\n)[\s\S]*?(<!-- grid:end -->)/, (m, a, b) => a + grid + b)
  .replace(/(<!-- soon:start[^>]*-->\n)[\s\S]*?(<!-- soon:end -->)/, (m, a, b) => a + soon + b)
  .replace(/\/\*ids:start\*\/[\s\S]*?\/\*ids:end\*\//, `/*ids:start*/${JSON.stringify(chapters.map((c) => c.id))}/*ids:end*/`);
if (!/rel="canonical"/.test(home)) home = home.replace('</title>', `</title>\n<link rel="canonical" href="${SITE}/">`);
writeFileSync(join(ROOT, 'index.html'), home);

// sitemap.xml: the home page plus every chapter page that has words in it.
const today = new Date().toISOString().slice(0, 10);
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${SITE}/</loc></url>
${pages.map((p) => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod>${p.alts.length > 1 ? p.alts.map(([x, h]) => `<xhtml:link rel="alternate" hreflang="${x}" href="${h}"/>`).join('') : ''}</url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), sm);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`built ${chapters.length * 2} chapter pages, ${pages.length} in the sitemap (${today})`);
