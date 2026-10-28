import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadArticles, parseArticleSource } from '../scripts/lib/load-articles.js';
import { normalizeArticle, registry, canonicalUrl, articleSchema } from '../src/lib/authority.js';
import { routeInventory, routeArticles } from '../src/lib/routes.js';
import { PAGES } from '../src/lib/pages.js';
import { rssFeed, atomFeed } from '../src/lib/discovery.js';
import { ArticleDocument, MarkdownBody } from '../src/components/ArticleDocument.js';
import { generateArticleHTML, generatePageHTML } from '../vite-plugin-prerender-og.js';
import { bodySimilarity } from '../scripts/lib/duplicate-content.js';
const articles = loadArticles();
const get = slug => { const a = articles.find(a => a.slug === slug); assert.ok(a, slug); return a; };
const base = fs.readFileSync('index.html', 'utf8');
const originalDates = {
  "cmac-roofing-earns-top-texas-honor-and-charts-a-bigger-future-in-housing-and-construction-tech": "2025-12-19T03:33:03.711571+00:00",
  "cody-viveiros-dfw-business-powerhouse": "2025-12-10T00:00:00Z",
  "new-cancer-screening-guidelines-emphasize-earlier-detection": "2025-09-14T09:32:43.272Z",
  "ilhan-omar-home-search-immigration-investigation": "2026-10-12T14:11:24.619042+00:00",
  "ilhan-omar-investigation-evidence-citizenship-search-dispute": "2026-10-19T04:05:06.461116+00:00",
  "the-three-day-fable-how-anthropics-most-powerful-public-model-vanished": "2026-06-14T01:44:48+00:00",
  "what-happens-after-you-swipe-right-on-tinder": "2026-10-22T05:40:47.848248+00:00",
  "fbi-foils-mall-of-america-isis-terror-plot": "2026-10-08T12:20:00.000000+00:00",
  "social-security-record-cleanup-benefits-evidence": "2026-10-21T00:50:06.174275+00:00",
  "oliver-tree-rio-crash-claim-what-is-confirmed-and-what-isnt": "2026-06-14T20:57:52+00:00"
};

const withdrawnSlugs = ['new-cancer-screening-guidelines-emphasize-earlier-detection', 'cmac-roofing-earns-top-texas-honor-and-charts-a-bigger-future-in-housing-and-construction-tech'];
test('withdrawals retain complete notices and canonical routes, with noindex and no promotional discovery', () => {
 const inventory = routeInventory(articles);
 for (const slug of withdrawnSlugs) {
  const a = get(slug);
  assert.equal(a.status, 'withdrawn'); assert.equal(a.indexable, false);
  assert.equal(inventory[new URL(canonicalUrl(a)).pathname].type, 'article');
  const html = generateArticleHTML(base, a, `${a.categoryPath}/${a.slug}`, articles);
  assert.match(html, /name="robots" content="noindex/);
  assert.ok(html.includes(renderToStaticMarkup(React.createElement(MarkdownBody, {content:a.content}))));
  assert.match(html, /Withdrawn/); assert.match(html, /2026-10-28/);
  for (const r of Object.values(inventory).filter(r => r.type !== 'article'))
   assert.ok(!routeArticles(r, articles).some(x => x.slug === slug), `${r.path}: ${slug}`);
  for (const xml of [rssFeed(articles), atomFeed(articles)]) assert.ok(!xml.includes(canonicalUrl(a)));
 }
 const medical = get(withdrawnSlugs[0]);
 assert.doesNotMatch(medical.content, /we interviewed|experts say|new guidelines recommend/i);
 assert.match(medical.content, /resource only/i);
 assert.match(get(withdrawnSlugs[1]).content, /does not establish that.*false/s);
});
test('ownership names PROTOCOL SENTINEL and preserves the NewsPredator historical credit', () => {
 const publicCopy = JSON.stringify(PAGES) + JSON.stringify(registry);
 assert.match(publicCopy, /PROTOCOL SENTINEL/); assert.match(publicCopy, /https:\/\/protocolsentinel.com/);
 assert.doesNotMatch(publicCopy, /owns[^.]*News Predator|publisher[^.]*News Predator/i);
 assert.equal(registry.newspredator.kind, 'legacy');
 assert.match(PAGES.corrections.body, /https:\/\/github.com\/cojovi\/northstar_news\/issues\/new/);
 assert.match(PAGES.contact.body, /confidential/i);
 assert.doesNotMatch(publicCopy, /we do not invent one|availability was checked during this implementation/i);
});
test('ten public targeted source reviews have explicit scope, limits, dates and usable links', () => {
 const reviewed = articles.filter(a => a.evidence.status === 'partial'); assert.equal(reviewed.length, 10);
 for (const a of reviewed) {
  assert.equal(a.evidence.completed_full_factcheck, false);
  assert.equal(a.evidence.reviewed_at, '2026-10-28');
  assert.ok(a.evidence.summary.length > 60); assert.ok(a.evidence.limits.length > 60);
  assert.ok(a.evidence.sources.length); assert.match(a.evidence.record_url, /\/source-reviews#/);
  assert.ok(PAGES['source-reviews'].body.includes(a.slug));
  const review = PAGES['source-reviews'].reviews.find(r => r.slug === a.slug);
  assert.equal(review.summary, a.evidence.summary); assert.equal(review.limits, a.evidence.limits);
  assert.equal(review.completed_full_factcheck, false);
  const html = renderToStaticMarkup(React.createElement(ArticleDocument, {article:a}));
  for (const c of a.corrections) assert.ok(html.includes(renderToStaticMarkup(React.createElement(React.Fragment, null, c.note))), 'complete visible correction');
  assert.match(html, /Partial source review/); assert.match(html, /2026-10-28/);
  assert.ok(a.corrections.some(c => c.date === '2026-10-28' && c.note.length > 40));
 }
 const malformed = normalizeArticle({title:'x',slug:'x',published:'2026-01-01',status:'published'}, 'Text', 'tech', {evidence:{status:'partial'}});
 assert.equal(malformed.evidence.status, 'pending');
});
test('specific corrections replace unsupported claims without changing historical publication dates', () => {
 const fbi = get('fbi-foils-mall-of-america-isis-terror-plot');
 assert.match(fbi.content, /Sheikhdoon Abdullahi Mohamud/);
 assert.match(fbi.content, /knowingly receiving a firearm and ammunition/);
 assert.match(fbi.content, /presumed innocent/);
 assert.doesNotMatch(fbi.content, /Sheikhdoun|Abdulhani|jumpsuit|incontrovertible|charged with providing material support/i);
 assert.match(fbi.corrections[0].note, /name.*charge/i);
 const cody = get('cody-viveiros-dfw-business-powerhouse');
 assert.match(cody.content, /affiliated publisher information/i);
 assert.doesNotMatch(cody.content, /Harvard refined|MIT supercharged|revenue.*climbed|GQphotographer/i);
 assert.match(cody.corrections[0].note, /pending.*records/i);
 const fable = get('the-three-day-fable-how-anthropics-most-powerful-public-model-vanished');
 assert.match(fable.content, /July 1/); assert.match(fable.content, /https:\/\/www.anthropic.com\/news\/redeploying-fable-5/);
 for (const a of articles.filter(a => a.evidence.status === 'partial')) {
  const source = parseArticleSource(fs.readFileSync(`content/${a.categoryPath}/${a.slug}.md`, 'utf8'));
  assert.equal(a.published, source.data.published);
  assert.equal(a.published, originalDates[a.slug], 'exact historical timestamp');
  assert.ok(Date.parse(a.published) < Date.parse('2026-10-28'));
 }
});
test('Tinder consumer analysis differs substantially from the actual sister source and preserves provenance', () => {
 const a = get('what-happens-after-you-swipe-right-on-tinder');
 const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/protocol-sentinel-tinder.json', import.meta.url), 'utf8'));
 assert.equal(fixture.sourcePath, 'blog/source/_posts/2026-10-22-what-happens-after-you-swipe-right-on-tinder.md');
 assert.match(fixture.repository, /cojovi\/projectsentinal/);
 assert.equal(fixture.snapshots.length, 2);
 for (const snapshot of fixture.snapshots) {
  assert.match(snapshot.gitRevision, /^[a-f0-9]{40}$/);
  assert.equal(createHash('sha256').update(snapshot.source).digest('hex'), snapshot.sourceSha256);
  const ps = parseArticleSource(snapshot.source).content;
  assert.ok(ps.split(/\s+/).length > 900, 'actual substantial sister body');
  assert.ok(bodySimilarity(a.content, ps) < 0.2, `${snapshot.version}: substantial structural and textual distinction`);
 }
 assert.equal(fixture.snapshots[0].worktreeModified, false);
 assert.equal(fixture.snapshots[1].worktreeModified, true);
 const words = a.content.split(/\s+/).length;
 assert.ok(words >= 900 && words <= 1400, `${words} words`);
 assert.equal(a.affiliated, false, 'shared research disclosure does not make Tinder owner-profile coverage');
 assert.match(a.content, /shared research/i); assert.match(a.content, /not independent corroboration/i);
 assert.ok(a.content.includes('(https://protocolsentinel.com/post/2026-10-22-what-happens-after-you-swipe-right-on-tinder)'));
 assert.doesNotMatch(a.content, /2026-10-22-what-happens-after-you-swipe-right-on-tinder\.html/);
 assert.match(a.content, /AI-assisted speech extraction/);
 assert.match(a.hero_credit, /PxHere \/ Wikimedia Commons, CC0/);
 assert.match(a.content, /not.*(?:replicated|replicate)/i);
});
test('client metadata sets noindex on a withdrawal and removes it when leaving', async () => {
 const ts = await import('typescript');
 let code = ts.transpileModule(fs.readFileSync('src/lib/metadata.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
 for (const path of ['authority.js', 'socialImage.js', 'routes.js']) code = code.replace(`"./${path}"`, JSON.stringify(new URL(`../src/lib/${path}`, import.meta.url).href));
 const {updateMetadata} = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
 const nodes = [];
 const prior = globalThis.document;
 globalThis.document = {
  title:'', createElement:tag => ({tag, attrs:{}, dataset:{}, setAttribute(k,v){this.attrs[k]=v;}, remove(){nodes.splice(nodes.indexOf(this),1);}}),
  head:{querySelectorAll:() => [...nodes], appendChild:el => nodes.push(el)}
 };
 try {
  const inventory = routeInventory(articles);
  const regular = get('fbi-foils-mall-of-america-isis-terror-plot');
  const withdrawal = get(withdrawnSlugs[0]);
  const excluded = [
   inventory[new URL(canonicalUrl(withdrawal)).pathname],
   ...articles.filter(a => a.status === 'review-hold' || a.is_satire).map(a => inventory[new URL(canonicalUrl(a)).pathname]),
   inventory['/lifestyle'],
   inventory['/tag/privacy'], inventory['/author/newspredator'], inventory['/search'],
   {type:'notFound',title:'Missing',description:'Missing'}
  ];
  for (const route of excluded) {
   updateMetadata(route, route.path || '/missing', route.type === 'article' ? get(route.slug) : null);
   assert.deepEqual(nodes.filter(n => n.attrs.name === 'robots').map(n => n.content), ['noindex,follow']);
   const articleRoute = inventory[new URL(canonicalUrl(regular)).pathname];
   updateMetadata(articleRoute, articleRoute.path, regular);
   assert.deepEqual(nodes.filter(n => n.attrs.name === 'robots').map(n => n.content), ['index,follow,max-image-preview:large']);
  }
  for (const path of ['/standards','/topics','/topics/public-spending','/author/cody-viveiros','/author/northstar-desk','/tech']) {
   updateMetadata(inventory[path], path);
   assert.deepEqual(nodes.filter(n => n.attrs.name === 'robots').map(n => n.content), ['index,follow,max-image-preview:large'], path);
   assert.ok(!nodes.some(n => n.tag === 'script'));
  }
 } finally {globalThis.document=prior;}
});

test('uncurated taxonomy, search and legacy identities are noindex while supported routes stay indexable', () => {
 const inventory = routeInventory(articles);
 for (const [path, route] of Object.entries(inventory)) {
  const expected = route.type === 'article' ? get(route.slug).indexable
   : route.type === 'tag' || route.type === 'search' ? false
   : route.type === 'author' ? route.profile.kind !== 'legacy'
   : route.type === 'category' ? routeArticles(route, articles).length > 0 : true;
  assert.equal(route.indexable, expected, path);
  const html = route.type === 'article'
   ? generateArticleHTML(base, get(route.slug), path.slice(1), articles)
   : generatePageHTML(base, route, path, articles);
  assert.deepEqual([...html.matchAll(/name="robots" content="([^"]*)"/g)].map(m => m[1]),
   [expected ? 'index,follow,max-image-preview:large' : 'noindex,follow'], path);
  assert.ok(html.includes(`rel="canonical" href="https://thenorthstarledger.com${path.replaceAll('&','&amp;')}"`), path);
  assert.match(html, /<h1/);
 }
 // Volume and unsourced legacy attribution never confer curation.
 const many = Array.from({length:30}, (_,i) => normalizeArticle({title:'Unsourced',slug:`unsourced-${i}`,published:'2025-01-01',tags:['Popular'],author:'Unknown',author_slug:'unknown'}, 'Body.', 'tech'));
 const synthetic = routeInventory(many);
 assert.equal(synthetic['/tag/popular'].indexable, false);
 assert.equal(synthetic['/author/unknown'].indexable, false);
 assert.equal(synthetic['/world'].indexable, false, 'empty category excluded');
 assert.equal(synthetic['/tech'].indexable, true);
 assert.equal(synthetic['/author/cody-viveiros'].indexable, true, 'registered owner identity is a supported standalone profile');
 const withdrawn = normalizeArticle({title:'Withdrawn',slug:'withdrawn',published:'2025-01-01',status:'withdrawn',tags:['Empty'],author:'Gone',author_slug:'gone'}, 'Notice.', 'world');
 const empty = routeInventory([withdrawn]);
 for (const path of ['/world','/tag/empty','/author/gone','/world/withdrawn']) assert.equal(empty[path].indexable, false, path);
});

test('recorded article primary image dimensions match actual bytes without relabeling smaller or unknown assets', () => {
 let measured = 0;
 for (const a of articles) {
  assert.equal(articleSchema(a).image, a.hero_image);
  if (a.hero_width === undefined) { assert.equal(a.hero_height, undefined); continue; }
  const bytes = fs.readFileSync(`public${decodeURIComponent(new URL(a.hero_image).pathname)}`);
  assert.deepEqual([...bytes.subarray(0,8)], [137,80,78,71,13,10,26,10]);
  assert.equal(a.hero_width, bytes.readUInt32BE(16));
  assert.equal(a.hero_height, bytes.readUInt32BE(20));
  assert.ok(a.hero_width > 0 && a.hero_height > 0);
  measured++;
 }
 assert.ok(measured > 0);
});

test('all sitemap URLs exactly match the shared indexable route inventory and manifest', () => {
 const inventory = routeInventory(articles);
 const manifest = JSON.parse(fs.readFileSync('public/route-manifest.json', 'utf8'));
 assert.deepEqual(Object.keys(manifest).sort(), Object.keys(inventory).sort());
 const expected = [];
 for (const [path, route] of Object.entries(inventory)) {
  assert.equal(manifest[path].indexable, route.indexable, path);
  if (route.indexable) expected.push(`https://thenorthstarledger.com${path}`);
 }
 const urls = ['post','section','page'].flatMap(name =>
  [...fs.readFileSync(`public/${name}-sitemap.xml`, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)]
   .map(m => m[1].replaceAll('&amp;', '&')));
 assert.equal(urls.length, new Set(urls).size, 'no duplicate sitemap URLs');
 assert.deepEqual(urls.sort(), expected.sort());
 assert.ok(!urls.some(url => url.includes('/tag/') || url.endsWith('/search')));
});
