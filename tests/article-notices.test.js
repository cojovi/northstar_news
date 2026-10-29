import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadArticles, parseArticleSource } from '../scripts/lib/load-articles.js';
import { ArticleDocument } from '../src/components/ArticleDocument.js';
import { normalizeArticle } from '../src/lib/authority.js';
const articles=loadArticles();
const profile=articles.find(a=>a.slug==='cody-viveiros-dfw-business-powerhouse');
const original=parseArticleSource(JSON.parse(fs.readFileSync(new URL('./fixtures/cody-profile-original.json',import.meta.url),'utf8')).source);
const render=a=>renderToStaticMarkup(React.createElement(ArticleDocument,{article:a}));

test('requested profile restores the original exact title, dek, body, byline and image credit',()=>{
 assert.equal(profile.title,original.data.title);
 assert.equal(profile.dek,original.data.dek);
 assert.equal(profile.content,original.content);
 assert.equal(profile.author,original.data.author);
 assert.equal(profile.hero_credit,original.data.hero_credit);
 assert.equal(profile.published,original.data.published);
 assert.equal(profile.hero_image,'https://thenorthstarledger.com/codybiz.jpeg');
 assert.equal(profile.editorial_notices,false);
 assert.equal(profile.evidence.completed_full_factcheck,false);
 assert.equal(profile.affiliated,true);
});

test('profile omits assistant-added affiliation, evidence, correction and credibility notices',()=>{
 const html=render(profile);
 for(const text of ['Affiliated coverage','Evidence and limits','Partial source review','not independently verified','Corrections and review notes','Links present in the source record','Standards','Report a correction','Ownership and conflicts','Historical image credit:','Our retention commitment']) assert.ok(!html.includes(text),text);
 assert.ok(html.includes(original.data.hero_credit));
 assert.ok(html.includes('A Rising Icon in the Making'));
 assert.ok(html.includes('Continue reading'));
});

test('other published articles retain existing notice rendering by default',()=>{
 const article=normalizeArticle({title:'Affiliated example',slug:'affiliated-example',published:'2026-01-01',status:'published'},'Cody Viveiros example.','business');
 const html=render(article);
 assert.ok(html.includes('Affiliated coverage'));
 assert.ok(html.includes('Evidence and limits'));
 assert.ok(html.includes('Corrections and review notes'));
});

test('presentation preference cannot hide withdrawal or classification notices',()=>{
 for(const status of ['withdrawn','review-hold']){
  const a=normalizeArticle({title:'Archive example',slug:'archive-example',published:'2026-01-01',status,editorial_notices:false},'Original retained notice.','business');
  const html=render(a);
  assert.ok(html.includes(status==='withdrawn'?'Withdrawal notice':'Archive classification notice'));
  assert.ok(html.includes('Evidence and limits'));
 }
});
