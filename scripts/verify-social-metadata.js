import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { SITE_URL, resolveSocialImage } from '../src/lib/socialImage.js';

const decode = value => value.replace(/&quot;/g, '"').replace(/&#039;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const getMeta = (html, key) => [...html.matchAll(
  new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`, 'g')
)].map(match => decode(match[1]));

let count = 0;
const localImages = new Set();
for (const file of fs.readdirSync('content', { recursive: true })) {
  if (!file.endsWith('.md')) continue;
  const source = fs.readFileSync(path.join('content', file), 'utf8');
  const { data } = matter(source);
  if (data.status !== 'published') continue;
  // The browser's frontmatter reader expects inline arrays. A block-style tag
  // list breaks related-article loading before client-side metadata is updated.
  assert.match(source, /^tags:\s*\[[^\n]*\]\s*$/m, `${file}: tags must be an inline array`);

  const route = `${file.split(path.sep)[0]}/${data.slug || path.basename(file, '.md')}`;
  const html = fs.readFileSync(path.join('dist', route, 'index.html'), 'utf8');
  const image = resolveSocialImage(data.hero_image);
  for (const key of ['og:image', 'twitter:image']) {
    assert.deepEqual(getMeta(html, key), [image], `${route}: ${key}`);
  }
  assert.deepEqual(getMeta(html, 'og:title'), [data.title], `${route}: title`);
  assert.deepEqual(getMeta(html, 'og:type'), ['article'], `${route}: type`);
  assert.deepEqual(getMeta(html, 'og:url'), [`${SITE_URL}/${route}`], `${route}: URL`);
  const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map(m => decode(m[1]));
  assert.deepEqual(canonical, [`${SITE_URL}/${route}`], `${route}: canonical`);
  assert.match(html, /<div id="root"><\/div>/, `${route}: app root`);
  assert.match(html, /<script[^>]*type="module"[^>]*src="\/assets\//, `${route}: app bundle`);
  assert.doesNotMatch(html, /<meta[^>]+property="og:image:(?:width|height|type)"/, `${route}: no invented dimensions or MIME type`);

  const url = new URL(image);
  if (url.origin === SITE_URL) {
    const asset = path.join('dist', decodeURIComponent(url.pathname));
    assert.ok(fs.existsSync(asset), `${route}: missing image ${asset}`);
    assert.ok(fs.statSync(asset).size > 0, `${route}: empty image`);
    localImages.add(asset);
  }
  count++;
}

assert.ok(count > 0, 'must verify published articles');
const home = fs.readFileSync('dist/index.html', 'utf8');
assert.deepEqual(getMeta(home, 'og:image'), [`${SITE_URL}/og/default.jpg`]);
assert.deepEqual(getMeta(home, 'og:type'), ['website']);
console.log(`Verified crawler HTML for all ${count} published articles, ${localImages.size} local hero assets, and homepage fallback.`);
