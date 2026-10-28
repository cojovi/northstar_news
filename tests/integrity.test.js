import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadArticles, parseArticleSource } from '../scripts/lib/load-articles.js';
import { articlePath, articleSchema, isDiscoverable } from '../src/lib/authority.js';
import { routeInventory, routeArticles } from '../src/lib/routes.js';
import { PAGES } from '../src/lib/pages.js';
import { rssFeed, atomFeed } from '../src/lib/discovery.js';
import { ArticleDocument } from '../src/components/ArticleDocument.js';
const proof = JSON.parse(fs.readFileSync('tests/fixtures/integrity/template-proof.json'));
const publicRecord = JSON.parse(fs.readFileSync('src/data/archive-integrity.json'));
const dates = JSON.parse(fs.readFileSync('tests/fixtures/integrity/original-dates.json'));
const articles = loadArticles();
const fiction = ['the-cojoverse-unveiled-a-deep-dive-into-the-groundbreaking-bunker', 'macrohard-wants-to-replace-the-whole-software-industrythen-it-gave-developer-of-the-month-to-a-human-in-texas'];
const holds = ['cody-viveiros-forbes-cover-moment-inside-the-highest-paid-entertainers-machineand-the-new-economics-of-being-believed', 'cody-viveiros-crowns-gqs-the-disruptor-list-as-the-technological-visionary-turning-ai-ambition-into-a-lifestyle-movement', '100m-roofing-empire-toyota-camry-servant-leadership'];
test('all 69 exact provenance matches retain dates and URLs as withdrawals, with complete public links', () => {
 assert.equal(proof.records.length, 69);
 assert.equal(articles.length, 136);
 for (const a of articles) assert.equal(a.published, dates[articlePath(a)]);
 for (const record of proof.records) {
  const a = articles.find(a => articlePath(a) === record.path);
  assert.ok(a, record.path); assert.equal(a.status, 'withdrawn');
  assert.equal(a.indexable, false); assert.match(a.title, /^Withdrawn:/);
  assert.match(a.dek, /withdraw/i); assert.match(a.excerpt, /withdraw/i);
  assert.match(a.content, /mock.*template|template.*mock/i);
  assert.ok(a.corrections.some(c => c.date === '2026-10-28'));
  assert.ok(PAGES['archive-integrity'].body.includes(`](${record.path})`));
  assert.ok(PAGES['archive-integrity'].body.includes(record.title));
  const original = parseArticleSource(execFileSync('git', ['show', `${proof.revision}:content${record.path}.md`], {encoding:'utf8'}));
  assert.equal(createHash('sha256').update(original.content).digest('hex'), record.original_body_sha256);
 }
 assert.equal(articles.filter(a => a.status === 'withdrawn').length, 70);
 assert.equal(articles.filter(a => a.evidence.status === 'partial').length, 10);
 assert.deepEqual(publicRecord.records,proof.records);
 for (const a of articles.filter(a => a.evidence.status === 'partial')) assert.equal(a.review_kind,'documentary-source-review');
 assert.ok(PAGES['source-reviews'].reviews.every(r=>r.kind==='documentary-source-review'));
 assert.equal(articles.filter(a=>a.review_kind==='template-provenance').length,68);
 assert.equal(articles.filter(a => a.evidence.completed_full_factcheck).length, 0);
 assert.match(PAGES['archive-integrity'].body, /not.*subject.matter|not.*fact.check/i);
});
test('fiction and publication holds are conspicuous, affiliated, retained and excluded from all promotion', () => {
 const inventory = routeInventory(articles);
 for (const slug of [...fiction,...holds]) {
  const a=articles.find(a => a.slug === slug); assert.ok(a,slug);
  assert.equal(a.indexable,false); assert.equal(isDiscoverable(a),false);
  assert.equal(a.affiliated,true);
  assert.ok(a.corrections.some(c => c.date === '2026-10-28'));
  const html=renderToStaticMarkup(React.createElement(ArticleDocument,{article:a}));
  const record=publicRecord.classifications.find(r => r.path===articlePath(a));
  assert.equal(a.review_kind,record.kind);
  const original=parseArticleSource(execFileSync('git',['show',`${proof.revision}:content${record.path}.md`],{encoding:'utf8'}));
  assert.ok(a.content.endsWith(original.content), 'complete original body retained');
  assert.equal(createHash('sha256').update(original.content).digest('hex'),record.original_body_sha256);
  if (fiction.includes(slug)) {
   assert.equal(a.content_type,'satire'); assert.equal(a.is_satire,true);
   assert.equal(articleSchema(a)['@type'],'BlogPosting');
   assert.match(a.title,/^Satire\/Fiction:/); assert.match(a.dek,/fiction/i);
   assert.match(a.content.slice(0,800),/fiction/i); assert.match(html,/SATIRE \/ FICTION/);
  } else {
   assert.equal(a.status,'review-hold'); assert.match(a.title,/^Publication review hold:/);
   assert.match(a.content.slice(0,1000),/publication review hold/i);
   assert.match(html,/PUBLICATION REVIEW HOLD/);
  }
 }
 for (const a of articles.filter(a => !isDiscoverable(a))) {
  assert.equal(inventory[articlePath(a)].indexable,false);
  for (const r of Object.values(inventory).filter(r => r.type !== 'article'))
   assert.ok(!routeArticles(r,articles).includes(a));
  for (const xml of [rssFeed(articles),atomFeed(articles)]) assert.ok(!xml.includes(articlePath(a)));
 }
 assert.equal(articles.filter(isDiscoverable).length,61);
});
test('hardening preserves every original source template literal as evidence', () => {
 const original=execFileSync('git',['show',`${proof.revision}:scripts/generate-mock-content.js`],{encoding:'utf8'});
 const current=fs.readFileSync('scripts/generate-mock-content.js','utf8');
 const templates=source=>source.slice(source.indexOf('const articleTemplates = ')+25,source.indexOf('\n\nfunction slugify')).replace(/;\s*$/,'');
 assert.equal(JSON.stringify(vm.runInNewContext('('+templates(original)+')')),JSON.stringify(vm.runInNewContext('('+templates(current)+')')));
 const paragraphs=source=>{const start=source.indexOf('const paragraphs = [')+19;return source.slice(start,source.indexOf('\n  ];',start)+4);};
 for(const category of ['health','us','tech']) assert.equal(JSON.stringify(vm.runInNewContext(paragraphs(original),{category})),JSON.stringify(vm.runInNewContext(paragraphs(current),{category})));
 assert.equal(createHash('sha256').update(original).digest('hex'),publicRecord.original_generator_sha256);
});
test('mock generator import/default invocation cannot write and production, traversal, symlinks and overwrites are refused', async () => {
 const dir=fs.mkdtempSync(path.resolve('tests/fixtures/integrity/sandbox-'));
 const script=path.resolve('scripts/generate-mock-content.js');
 const before=fs.readFileSync('content/health/new-cancer-screening-guidelines-emphasize-earlier-detection.md');
 try {
  // Copy the script's entire dependency surface into isolation: an unsafe
  // historical version must never get a chance to resolve real content/.
  for (const sub of ['scripts','src/data','content']) fs.mkdirSync(path.join(dir,sub),{recursive:true});
  const isolated=path.join(dir,'scripts/generate-mock-content.js');
  fs.copyFileSync(script,isolated);
  fs.copyFileSync('src/data/authors.json',path.join(dir,'src/data/authors.json'));
  fs.writeFileSync(path.join(dir,'content/sentinel'),'untouched');
  const baseline=fs.readdirSync(dir,{recursive:true}).sort();
  const result=spawnSync(process.execPath,[isolated],{cwd:dir,encoding:'utf8'});
  assert.notEqual(result.status,0); assert.deepEqual(fs.readdirSync(dir,{recursive:true}).sort(),baseline);
  execFileSync(process.execPath,['--input-type=module','-e',`await import(${JSON.stringify('file://'+isolated)})`],{cwd:dir});
  assert.deepEqual(fs.readdirSync(dir,{recursive:true}).sort(),baseline);
  assert.equal(fs.readFileSync(path.join(dir,'content/sentinel'),'utf8'),'untouched');
  fs.symlinkSync(path.resolve('content'),path.join(dir,'escape'));
  for(const target of [path.resolve('content'),path.resolve('content/health'),`${dir}/../bad`,path.join(dir,'escape/output')]) {
   assert.notEqual(spawnSync(process.execPath,[script,'--fixtures-dir',target],{encoding:'utf8'}).status,0,target);
  }
  const out=path.join(dir,'output');
  execFileSync(process.execPath,[script,'--fixtures-dir',out]);
  const files=fs.readdirSync(out,{recursive:true}).filter(f=>f.endsWith('.md'));
  assert.ok(files.length > 69);
  for(const f of files){const {data,content}=parseArticleSource(fs.readFileSync(path.join(out,f),'utf8'));assert.equal(data.status,'draft');assert.match(data.title,/MOCK/);assert.match(content,/MOCK/);assert.equal(data.author_slug,'northstar-desk');}
  const snapshot=fs.readFileSync(path.join(out,files[0]));
  assert.notEqual(spawnSync(process.execPath,[script,'--fixtures-dir',out]).status,0);
  assert.deepEqual(fs.readFileSync(path.join(out,files[0])),snapshot);
  assert.deepEqual(fs.readFileSync('content/health/new-cancer-screening-guidelines-emphasize-earlier-detection.md'),before);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('publishing loader rejects exact legacy templates and their unsupported interview paragraph without keyword censorship', async () => {
 const {generateArticleContent}=await import('../scripts/generate-mock-content.js');
 const {assertNoMockTemplate}=await import('../scripts/lib/mock-template-gate.js');
 const literal=generateArticleContent({},'health',6);
 for(const count of [4,5,6]) assert.throws(()=>assertNoMockTemplate(generateArticleContent({},'health',count),'published'),/mock template/i);
 assert.throws(()=>assertNoMockTemplate('Other text.\n\n'+literal.split('\n\n')[1],'published'),/mock template/i);
 assert.doesNotThrow(()=>assertNoMockTemplate('Experts interviewed policymakers about mock trials and cancer screening.','published'));
 assert.doesNotThrow(()=>assertNoMockTemplate(literal,'withdrawn'));
 for(const a of articles) assert.ok(!a.content.includes(literal.split('\n\n')[1]),a.slug);
 const dir=fs.mkdtempSync(path.resolve('tests/fixtures/integrity/sandbox-'));
 try {
  fs.mkdirSync(path.join(dir,'content/health'),{recursive:true});
  fs.writeFileSync(path.join(dir,'content/health/legacy.md'),`---\ntitle: Legacy\nslug: legacy\npublished: 2025-01-01\nstatus: published\n---\n\n${literal}`);
  assert.throws(()=>loadArticles(dir),/mock template/i);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('browser search, home, tags, authors, trending, related and feed APIs share discovery policy', async () => {
 const ts=await import('typescript');
 const compile=file=>ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
 const dataModule=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
 let contentCode=compile('src/lib/content.ts');
 contentCode=contentCode.replace('"./authority.js"',JSON.stringify(new URL('../src/lib/authority.js',import.meta.url).href))
  .replace('from "../data/articles.json";',`from ${JSON.stringify(new URL('../src/data/articles.json',import.meta.url).href)} with {type:'json'};`);
 const contentURL=dataModule(contentCode), client=await import(contentURL);
 let feedCode=compile('src/lib/feeds.ts').replace('"./content"',JSON.stringify(contentURL));
 for(const name of ['authority','discovery','routes','socialImage']) feedCode=feedCode.replace(`"./${name}.js"`,JSON.stringify(new URL(`../src/lib/${name}.js`,import.meta.url).href));
 const feed=await import(dataModule(feedCode));
 assert.equal(client.getAllArticles().length,136);
 for(const a of articles.filter(a=>!isDiscoverable(a))) {
  for(const list of [client.getDiscoverableArticles(),client.searchArticles(a.slug),client.searchArticles(a.title),client.getTrendingArticles(200),client.getArticlesByCategory(a.categoryPath),client.getArticlesByAuthor(a.author_slug),...a.tags.map(tag=>client.getArticlesByTag(tag)),...articles.filter(isDiscoverable).map(other=>client.getRelatedArticles(other,200))])
   assert.ok(!list.some(item=>articlePath(item)===articlePath(a)),a.slug);
  for(const xml of [await feed.generateRSSFeed(),await feed.generateAtomFeed(),await feed.generateNewsSitemap()]) assert.ok(!xml.includes(articlePath(a)));
 }
 const xml=await feed.generateSitemap();
 const actual=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&')).sort();
 const expected=Object.values(routeInventory(articles)).filter(r=>r.indexable).map(r=>'https://thenorthstarledger.com'+r.path).sort();
 assert.deepEqual(actual,expected);
 assert.equal(routeInventory(articles)['/lifestyle'].indexable,false);
 assert.ok(!client.getDiscoverableArticles().some(a=>a.categoryPath==='lifestyle'));
});
