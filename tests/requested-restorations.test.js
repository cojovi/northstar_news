import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadArticles,parseArticleSource } from '../scripts/lib/load-articles.js';
import { articlePath,isDiscoverable,articleSchema } from '../src/lib/authority.js';
import { routeInventory,routeArticles } from '../src/lib/routes.js';
import { ArticleDocument } from '../src/components/ArticleDocument.js';
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/publisher-restorations.json',import.meta.url),'utf8'));
const articles=loadArticles();
const selected=fixture.map(f=>({f,original:parseArticleSource(f.source),article:articles.find(a=>articlePath(a)===new URL(f.url).pathname)}));

test('all eight publisher-selected Northstar articles restore exact original title, dek, body and dates',()=>{
 assert.equal(selected.length,8);
 for(const {f,original,article:a} of selected){assert.ok(a,f.url);assert.equal(a.title,original.data.title,f.url+' title');assert.equal(a.dek,original.data.dek||original.data.excerpt,f.url+' dek');assert.equal(a.content,original.content,f.url+' complete exact body');assert.equal(a.author,original.data.author);assert.equal(a.published,original.data.published);assert.deepEqual(a.tags,original.data.tags);}
});
test('all selected originals are published, indexable and present in ordinary section discovery and sitemap',()=>{
 const inventory=routeInventory(articles);const xml=fs.readFileSync('public/post-sitemap.xml','utf8');
 for(const {article:a} of selected){assert.equal(a.status,'published',a.slug);assert.equal(a.indexable,true,a.slug);assert.equal(a.is_satire,false,a.slug);assert.equal(isDiscoverable(a),true);assert.equal(inventory[articlePath(a)].indexable,true);assert.ok(routeArticles(inventory['/'+a.categoryPath],articles).some(x=>articlePath(x)===articlePath(a)));assert.ok(xml.includes('https://thenorthstarledger.com'+articlePath(a)),a.slug+' sitemap');}
});
test('restored originals omit assistant-added classification and credibility overlays without false fact-check labels',()=>{
 for(const {article:a} of selected){assert.equal(a.editorial_notices,false,a.slug);assert.equal(a.evidence.completed_full_factcheck,false);const html=renderToStaticMarkup(React.createElement(ArticleDocument,{article:a}));assert.doesNotMatch(html,/aria-label="Archive classification notice"|aria-label="Evidence and limits"|aria-label="Affiliation disclosure"|aria-label="Corrections and review notes"|SATIRE \/ FICTION|PUBLICATION REVIEW HOLD/);}
});
test('opinion restoration preserves original fictional qualifiers rather than fabricating factual authentication',()=>{
 for(const {article:a} of selected.filter(x=>/macrohard-wants|cojoverse-unveiled/.test(x.article.slug))){assert.equal(a.content_type,'opinion');assert.equal(articleSchema(a)['@type'],'Article');}
 const coj=selected.find(x=>x.article.slug.startsWith('the-cojoverse')).article;
 assert.match(coj.content,/fictional former classmate/);assert.match(coj.content,/imaginary former colleague/);assert.match(coj.content,/satirical canon/);
});
test('actual loader enforces the three requested original-copy locks and rejects missing or modified protected articles',()=>{
 const protectedFixtures=fixture.filter(f=>f.protected);assert.equal(protectedFixtures.length,3);
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'northstar-original-locks-'));
 try{
  fs.mkdirSync(path.join(root,'content'),{recursive:true});
  fs.copyFileSync('content/editorial-locks.json',path.join(root,'content/editorial-locks.json'));
  for(const f of protectedFixtures){fs.mkdirSync(path.dirname(path.join(root,f.path)),{recursive:true});fs.copyFileSync(f.path,path.join(root,f.path));}
  assert.equal(loadArticles(root).length,3);
  const target=path.join(root,protectedFixtures[0].path);const saved=fs.readFileSync(target,'utf8');
  fs.writeFileSync(target,saved+'\nAccidental editorial rewrite.\n');assert.throws(()=>loadArticles(root),/Editorial copy lock/);
  fs.writeFileSync(target,saved.replace(/^status: published$/m,'status: draft'));assert.throws(()=>loadArticles(root),/Editorial copy lock/);
  fs.writeFileSync(target,saved.replace(/^title:.*$/m,'title: Unapproved replacement'));assert.throws(()=>loadArticles(root),/Editorial copy lock/);
  fs.unlinkSync(target);assert.throws(()=>loadArticles(root),/Editorial copy lock/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
