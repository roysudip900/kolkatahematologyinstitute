#!/usr/bin/env node
// Builds the chapter pages, the home page grid, sitemap.xml and robots.txt
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

const RIGHT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const LEFT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>';
const LOGO = '<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="17" fill="#D93A4A"/><circle cx="17" cy="17" r="8" fill="#F08A93"/></svg>';

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const two = (bn, en) => `<span lang="bn">${bn}</span><span lang="en">${en}</span>`;
const ic = (art, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 52 52" aria-hidden="true">${art}</svg>`;
const url = (id, l) => (l === 'en' ? `/en/${id}/` : `/${id}/`);
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function render(txt) {
  let out = '';
  for (const block of txt.replace(/\r/g, '').split(/\n\s*\n/)) {
    let para = [], list = [];
    const flushP = () => { if (para.length) { out += `<p>${para.join('<br>')}</p>`; para = []; } };
    const flushL = () => { if (list.length) { out += `<ul>${list.map((i) => `<li>${i}</li>`).join('')}</ul>`; list = []; } };
    for (let line of block.split('\n')) {
      line = line.trim();
      if (!line) continue;
      if (/^##\s/.test(line)) { flushP(); flushL(); out += `<h3>${esc(line.replace(/^##\s*/, ''))}</h3>`; }
      else if (/^#\s/.test(line)) { flushP(); flushL(); out += `<h2>${esc(line.replace(/^#\s*/, ''))}</h2>`; }
      else if (/^[-•]\s/.test(line)) { flushP(); list.push(esc(line.replace(/^[-•]\s*/, ''))); }
      else { flushL(); para.push(esc(line)); }
    }
    flushP(); flushL();
  }
  return out;
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
function reviewed(file) {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (d) return d;
  } catch {}
  return new Date().toISOString().slice(0, 10);
}
function niceDate(iso, l) {
  const [y, m, d] = iso.split('-').map(Number);
  const s = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(l === 'bn' ? 'bn-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return s;
}

const index = read('index.html');
const style = index.match(/<style>[\s\S]*?<\/style>/)[0];
const fonts = index.match(/<link rel="preconnect"[\s\S]*?rel="stylesheet">/)[0];
const footer = index.match(/<footer>[\s\S]*?<\/footer>/)[0];
const chapters = JSON.parse(read('chapters/list.json'));

const pages = [];
for (const c of chapters) {
  const text = {}, has = {};
  for (const l of LANGS) {
    const f = `chapters/${c.id}.${l}.txt`;
    text[l] = existsSync(join(ROOT, f)) ? read(f).trim() : '';
    has[l] = !!text[l];
  }
  for (const l of LANGS) {
    const other = l === 'bn' ? 'en' : 'bn';
    const title = c[l];
    const live = has[l];
    const desc = (c[`desc_${l}`] || '').trim() || (live ? summary(text[l]) : '');
    const date = live ? reviewed(`chapters/${c.id}.${l}.txt`) : '';
    const canonical = SITE + url(c.id, l);
    let body;
    if (live) {
      body = `<div class="slot"><div class="prose">${render(text[l])}</div></div>` +
        `<p class="byline">${l === 'bn'
          ? `লিখেছেন ও দেখে দিয়েছেন ${AUTHOR.bn}, ${CRED.bn}। শেষ দেখা হয়েছে ${niceDate(date, 'bn')}।`
          : `Reviewed by ${AUTHOR.en}, ${CRED.en}. Last reviewed ${niceDate(date, 'en')}.`}</p>`;
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
    const ld = live ? `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: title, description: desc, inLanguage: l,
      url: canonical, lastReviewed: date, about: { '@type': 'MedicalCondition', name: c.en.split(':')[0] },
      reviewedBy: { '@type': 'Person', name: AUTHOR.en, jobTitle: 'Clinical Hematologist', honorificSuffix: CRED.en },
      publisher: { '@type': 'MedicalOrganization', name: SITE_NAME.en, url: SITE + '/' },
    }).replace(/</g, '\\u003c')}</script>` : '';
    const html = `<!DOCTYPE html>
<!-- Written by tools/build.mjs from chapters/${c.id}.${l}.txt. Do not edit this file: edit the .txt file instead. -->
<html lang="${l}" data-lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
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
${ld}
</head>
<body>

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

<main><div class="wrap" style="padding-block:18px 0">
<a class="back" href="/#library">${LEFT}${l === 'bn' ? 'সব অধ্যায়' : 'All chapters'}</a>
<div class="chead">${ic(c.art)}<div><h1>${esc(title)}</h1></div></div>
${body}
</div></main>

${footer}

<script>
(function(){
/* Remember the language this reader chose, so the home page opens in it next time. */
try{localStorage.setItem('khi-lang','${l}');}catch(e){}
document.querySelectorAll('.lang a').forEach(function(a){a.addEventListener('click',function(){try{localStorage.setItem('khi-lang',a.getAttribute('data-l'));}catch(e){}});});
})();
</script>
</body>
</html>
`.replace(/\n{3,}/g, '\n\n').replace(/^\n/gm, (m) => m);
    const out = l === 'en' ? `en/${c.id}/index.html` : `${c.id}/index.html`;
    mkdirSync(join(ROOT, dirname(out)), { recursive: true });
    writeFileSync(join(ROOT, out), html.replace(/^\s*\n/gm, ''));
    if (live) pages.push({ loc: canonical, lastmod: date, alts: LANGS.filter((x) => has[x]).map((x) => [x, SITE + url(c.id, x)]) });
  }
}

// Home page grid: one card per chapter per language, as real links Google can follow.
let grid = '';
for (const c of chapters) {
  for (const l of LANGS) {
    grid += `<a class="card" lang="${l}" href="${url(c.id, l)}">${ic(c.art)}<span class="t"><h3>${esc(c[l])}</h3></span><span class="go">${RIGHT}</span></a>\n`;
  }
}
let home = index.replace(/(<!-- grid:start[^>]*-->\n)[\s\S]*?(<!-- grid:end -->)/, `$1${grid}$2`)
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
