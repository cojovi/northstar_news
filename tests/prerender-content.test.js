import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generateArticleHTML, generateListingHTML } from '../vite-plugin-prerender-og.js';
const base = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const article = { title: 'Crawler test', dek: 'Summary', category: 'tech', slug: 'crawler-test', author: 'Test Author', published: '2026-10-15T12:00:00Z', content: '## Section\n\nFirst paragraph with **bold**.\n\n[Source](https://example.com/source)\n\nFinal paragraph.', hero_image: '/hero.png' };
test('full article including ending, sources and byline is present without JavaScript', () => {
 const html = generateArticleHTML(base, article, 'tech/crawler-test');
 for (const fragment of ['<h2>Section</h2>', '<strong>bold</strong>', 'Final paragraph.', 'https://example.com/source', 'Test Author', 'datetime="2026-10-15T12:00:00Z"']) assert.ok(html.includes(fragment), fragment);
 const schema = JSON.parse(html.match(/id="prerender-article-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.equal(schema['@type'], 'NewsArticle');
 assert.equal(schema.headline, article.title);
 assert.equal((html.match(/name="description"/g) || []).length, 1);
});
test('homepage and categories expose real article anchors', () => {
 for (const category of ['', 'tech']) {
  const html = generateListingHTML(base, [article], category);
  assert.ok(html.includes('<a href="/tech/crawler-test">Crawler test</a>'));
  assert.doesNotMatch(html, /<div id="root"><\/div>/);
 }
});
test('markdown and JSON cannot escape into executable HTML', () => {
 const html = generateArticleHTML(base, { ...article, title: '</script><script>alert(1)</script>', content: '<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))' }, 'tech/crawler-test');
 assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
 assert.doesNotMatch(html, /href="javascript:/);
});
test('missing React mount fails closed', () => {
 assert.throws(() => generateListingHTML('<html><head></head><body></body></html>', []), /React root/);
});
