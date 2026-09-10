#!/usr/bin/env node
// Regenerates briefs.json from the HTML files in briefs/.
// Every brief is a self-contained page; this just reads the bits the
// dashboard needs to list it. Run `npm run index` after dropping a new file in.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const briefsDir = join(root, 'briefs');

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', middot: '·', bull: '•', hellip: '…',
  lsquo: '\u2018', rsquo: '\u2019', ldquo: '\u201C', rdquo: '\u201D',
  deg: '°', times: '×', minus: '\u2212', rarr: '\u2192', larr: '\u2190',
};

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);

const strip = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const first = (html, re) => {
  const m = html.match(re);
  return m ? strip(m[1]) : '';
};

const files = (await readdir(briefsDir))
  .filter((f) => f.endsWith('.html'))
  .sort()
  .reverse(); // newest first

const briefs = [];
for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  const date = (slug.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || '';
  if (!date) {
    console.warn(`skipping ${file}: expected a YYYY-MM-DD- filename prefix`);
    continue;
  }
  const html = await readFile(join(briefsDir, file), 'utf8');
  const body = html.replace(/<style[\s\S]*?<\/style>/gi, '');

  briefs.push({
    slug,
    date,
    path: `briefs/${file}`,
    title: first(html, /<title>([\s\S]*?)<\/title>/i) || slug,
    dateline: first(body, /<p class="daydate"[^>]*>([\s\S]*?)<\/p>/i),
    lede: first(body, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    sections: [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((m) => strip(m[1]))
      .filter(Boolean),
  });
}

await writeFile(
  join(root, 'briefs.json'),
  JSON.stringify({ generated: new Date().toISOString(), briefs }, null, 2) + '\n',
);
console.log(`briefs.json: ${briefs.length} brief(s)`);
