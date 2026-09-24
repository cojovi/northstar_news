import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DEFAULT_IMAGE, SITE_URL, resolveSocialImage } from '../src/lib/socialImage.js';
import { generateArticleHTML } from '../vite-plugin-prerender-og.js';

const imageCases = [
  ['root-relative hero', '/putin-g20-miami-invitation.png', `${SITE_URL}/putin-g20-miami-invitation.png`],
  ['relative hero', 'images/hero.jpg', `${SITE_URL}/images/hero.jpg`],
  ['spaces in local filename', '/images/hero photo.png', `${SITE_URL}/images/hero%20photo.png`],
  ['site image', `${SITE_URL}/hero.webp`, `${SITE_URL}/hero.webp`],
  ['external hero', 'https://images.pexels.com/photos/123/photo.jpeg?w=1200&auto=compress', 'https://images.pexels.com/photos/123/photo.jpeg?w=1200&auto=compress'],
  ['GitHub blob', 'https://github.com/cojovi/northstar_news/blob/main/public/images/hero.png?raw=true', `${SITE_URL}/images/hero.png`],
  ['GitHub raw', 'https://raw.githubusercontent.com/cojovi/northstar_news/main/public/hero.png', `${SITE_URL}/hero.png`],
  ['GitHub raw route', 'https://github.com/cojovi/northstar_news/raw/main/public/hero.png', `${SITE_URL}/hero.png`],
  ['unrelated public directory', 'https://cdn.example.com/public/hero.jpg', 'https://cdn.example.com/public/hero.jpg'],
  ['other GitHub repository', 'https://github.com/other/repo/blob/main/public/hero.png?raw=true', 'https://github.com/other/repo/blob/main/public/hero.png?raw=true'],
  ['protocol-relative URL', '//cdn.example.com/hero.png', 'https://cdn.example.com/hero.png'],
  ['HTTP URL', 'http://cdn.example.com/hero.jpg', 'http://cdn.example.com/hero.jpg'],
  ['whitespace', '  /hero.png  ', `${SITE_URL}/hero.png`],
  ['missing image', undefined, DEFAULT_IMAGE],
  ['empty image', '', DEFAULT_IMAGE],
  ['blank image', '   ', DEFAULT_IMAGE],
  ['invalid URL', 'https://[invalid', DEFAULT_IMAGE],
  ['unsafe scheme', 'javascript:alert(1)', DEFAULT_IMAGE],
];

for (const [name, input, expected] of imageCases) {
  test(`resolves ${name}`, () => assert.equal(resolveSocialImage(input), expected));
}

const baseHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const article = {
  title: `An "article" & <image> that's different`,
  dek: 'A summary & description',
  hero_image: '/putin-g20-miami-invitation.png',
};

test('crawler HTML contains the hero image and article canonical without JavaScript', () => {
  const html = generateArticleHTML(baseHtml, article, 'politics/example');
  for (const key of ['og:image', 'og:image:secure_url', 'twitter:image']) {
    const tags = html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`, 'g'));
    assert.equal(tags?.length, 1, `one ${key}`);
    assert.ok(tags[0].endsWith(`content="${SITE_URL}/putin-g20-miami-invitation.png"`));
  }
  assert.match(html, /<link rel="canonical" href="https:\/\/thenorthstarledger.com\/politics\/example"/);
  assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1);
  assert.match(html, /An &quot;article&quot; &amp; &lt;image&gt; that&#039;s different/);
  assert.doesNotMatch(html, /<meta[^>]+content="[^"\n]*\/og\/default.jpg"/);
  assert.doesNotMatch(html, /<meta[^>]+property="og:image:(?:width|height|type)"/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /<script type="module"/);
});

test('escapes external image query strings in HTML attributes', () => {
  const html = generateArticleHTML(baseHtml, { ...article, hero_image: 'https://cdn.example.com/hero.jpg?a=1&b=2' }, 'world/example');
  assert.match(html, /property="og:image" content="https:\/\/cdn.example.com\/hero.jpg\?a=1&amp;b=2"/);
});

test('does not declare an insecure image as a secure URL', () => {
  const html = generateArticleHTML(baseHtml, { ...article, hero_image: 'http://cdn.example.com/hero.jpg' }, 'world/example');
  assert.doesNotMatch(html, /<meta property="og:image:secure_url"/);
});

test('missing hero uses the site fallback', () => {
  const html = generateArticleHTML(baseHtml, { ...article, hero_image: '' }, 'world/example');
  assert.ok(html.includes(`<meta property="og:image" content="${DEFAULT_IMAGE}"`));
});

test('invalid template fails the build rather than silently shipping site metadata', () => {
  assert.throws(() => generateArticleHTML('<html></html>', article, 'world/example'), /<\/head>/);
});
