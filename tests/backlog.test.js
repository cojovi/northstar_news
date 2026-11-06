import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadArticles,parseArticleSource} from '../scripts/lib/load-articles.js';
import {isDiscoverable,articlePath} from '../src/lib/authority.js';
import {PAGES} from '../src/lib/pages.js';
const expected=JSON.parse(fs.readFileSync('tests/fixtures/backlog-recovery-20261105.json','utf8'));
const articles=loadArticles();
test('approved recovered backlog has original dates, organizational bylines, bound evidence records, distinct credited photos and live discovery metadata',()=>{
 assert.equal(expected.length,8);
 const images=new Set();
 for(const item of expected){
  const a=articles.find(a=>articlePath(a)===item.path);assert.ok(a,item.path);
  assert.equal(a.published.slice(0,10),item.date);assert.ok(Date.parse(a.updated)>=Date.parse(a.published));assert.equal(isDiscoverable(a),true);
  assert.equal(a.author,'The Northstar Ledger Desk');assert.equal(a.author_slug,'northstar-desk');
  assert.doesNotMatch(a.content,/Archival note:|Originally scheduled/);
  const source=parseArticleSource(fs.readFileSync('content'+item.path+'.md','utf8'));
  const review=JSON.parse(fs.readFileSync('content/reviews'+item.path+'.json','utf8'));
  assert.equal(review.publication.status,'ready');assert.equal(review.publication.source_sha256,createHash('sha256').update(source.content.trim()).digest('hex'));assert.ok(review.publication.claim_ledger.length);
  assert.equal(a.evidence.completed_full_factcheck,false);assert.ok(PAGES['source-reviews'].reviews.some(r=>r.slug===a.slug));
  assert.match(a.hero_credit,/Library of Congress/);assert.match(a.hero_credit,/Archival/);
  assert.ok(!images.has(a.hero_image));images.add(a.hero_image);
  const bytes=fs.readFileSync('public'+new URL(a.hero_image).pathname);assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);
 }
});
