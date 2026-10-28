import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseArticleSource } from './lib/load-articles.js';
import { isDiscoverable } from '../src/lib/authority.js';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownBody } from '../src/components/ArticleDocument.js';
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
  const { data, content } = parseArticleSource(source);
  if (!['published', 'withdrawn', 'review-hold'].includes(data.status)) continue;
  // YAML shape is validated by the common content loader; browser uses its JSON snapshot.

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
  assert.doesNotMatch(html, /<div id="root"><\/div>/, `${route}: no empty shell`);
  assert.match(html, /<h1\b/, `${route}: static heading`);
  const renderedBody = renderToStaticMarkup(React.createElement(MarkdownBody, {content}));
  assert.ok(renderedBody.length > 0 && html.includes(renderedBody), `${route}: complete rendered body`);
  const homeLinks = fs.readFileSync('dist/index.html', 'utf8');
  assert.equal(homeLinks.includes(`href="/${route}"`), isDiscoverable(data), `${route}: homepage discovery honors archive state`);
  const categoryLinks = fs.readFileSync(path.join('dist', file.split(path.sep)[0], 'index.html'), 'utf8');
  assert.equal(categoryLinks.includes(`href="/${route}"`), isDiscoverable(data), `${route}: category discovery honors archive state`);
  assert.deepEqual(getMeta(html, "robots"), !isDiscoverable(data) ? ["noindex,follow"] : ["index,follow,max-image-preview:large"], `${route}: archive state robots`);
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
console.log(`Verified crawler HTML for all ${count} retained article routes (including withdrawals), ${localImages.size} local hero assets, and homepage fallback.`);
