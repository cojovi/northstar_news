import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadArticles,parseArticleSource} from '../scripts/lib/load-articles.js';
import {articlePath,isDiscoverable} from '../src/lib/authority.js';
import {PAGES} from '../src/lib/pages.js';
const expected=[
 ['/business/october-jobs-payrolls-involuntary-part-time','2026-11-07'],
 ['/us/counter-drone-pact-civilian-aviation-safety-test','2026-11-09'],
 ['/business/october-cpi-missing-annual-rate-household-costs','2026-11-12'],
 ['/us/faa-ground-stop-accountability-test','2026-11-14'],
 ['/us/faa-router-ground-stop-change-control-accountability','2026-11-17'],
 ['/world/shenzhen-peace-declaration-commitments','2026-11-19'],
 ['/politics/federal-contractors-congress-executive-privilege-order','2026-11-22'],
];
test('remaining seven held selections preserve original local editorial dates with complete sourced bodies and distinct contextual images',()=>{
 const articles=loadArticles();const hashes=new Set();const sourceIds=new Set();
 const existingPhotoIds=new Set(articles.filter(a=>!expected.some(([p])=>p===articlePath(a))).map(a=>a.image_source_url?.match(/\/item\/(\d+)/)?.[1]).filter(Boolean));
 for(const [path,date] of expected){
  const a=articles.find(x=>articlePath(x)===path);assert.ok(a,path);
  assert.equal(a.published,date);assert.equal(a.author_slug,'northstar-desk');assert.equal(a.content_type,'analysis');assert.ok(isDiscoverable(a));
  assert.ok(a.content.trim().split(/\s+/).length>=1200);assert.doesNotMatch(a.content,/Archival note|Originally scheduled|recovery.batch|approval.policy/i);
  const source=parseArticleSource(fs.readFileSync('content'+path+'.md','utf8'));
  const review=JSON.parse(fs.readFileSync('content/reviews'+path+'.json','utf8'));
  assert.equal(review.publication.source_sha256,createHash('sha256').update(source.content.trim()).digest('hex'));
  assert.ok(review.publication.claim_ledger.length>=3);assert.equal(a.evidence.completed_full_factcheck,false);
  assert.ok(PAGES['source-reviews'].reviews.some(x=>x.slug===a.slug));
  assert.match(a.hero_credit,/Carol M. Highsmith/);assert.match(a.hero_credit,/Archival contextual/);
  const photoId=a.image_source_url?.match(/\/item\/(\d+)/)?.[1];assert.ok(photoId);assert.ok(!existingPhotoIds.has(photoId));assert.ok(!sourceIds.has(photoId));sourceIds.add(photoId);
  const image=fs.readFileSync('public'+new URL(a.hero_image).pathname);assert.equal(image.readUInt16BE(0),0xffd8);
  const hash=createHash('sha256').update(image).digest('hex');assert.ok(!hashes.has(hash));hashes.add(hash);
 }
});
