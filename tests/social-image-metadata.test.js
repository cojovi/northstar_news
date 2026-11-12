import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decodeImageMetadata, readSocialImageMetadata } from '../scripts/lib/social-image-metadata.js';
import { generateArticleHTML, generatePageHTML } from '../vite-plugin-prerender-og.js';
import { SITE_URL, DEFAULT_IMAGE } from '../src/lib/socialImage.js';

const png = fs.readFileSync(new URL('../public/nvidia-founder-board-accountability.png', import.meta.url));
const jpeg = fs.readFileSync(new URL('../public/og/default.jpg', import.meta.url));
const base = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const meta = (html, key) => [...html.matchAll(new RegExp(`<meta property="${key}" content="([^"]*)"`, 'g'))].map(x => x[1]);

test('real NVIDIA PNG publishes its own measured 1536x1024 dimensions and MIME', () => {
  assert.deepEqual(decodeImageMetadata(png), {width:1536, height:1024, type:'image/png'});
  const html = generateArticleHTML(base, {title:'NVIDIA metadata regression', dek:'Article image, not site image', hero_image:'/nvidia-founder-board-accountability.png', hero_width:999, hero_height:999}, 'business/nvidia-metadata-test');
  assert.deepEqual(meta(html,'og:image'),[SITE_URL+'/nvidia-founder-board-accountability.png']);
  assert.deepEqual(meta(html,'og:image:width'),['1536']);
  assert.deepEqual(meta(html,'og:image:height'),['1024']);
  assert.deepEqual(meta(html,'og:image:type'),['image/png']);
});

test('homepage JPEG fallback has dimensions measured from its own bytes', () => {
  const measured = decodeImageMetadata(jpeg);assert.equal(measured.type,'image/jpeg');assert.ok(measured.width>0&&measured.height>0);
  const html = generatePageHTML(base,{type:'home',title:'Home',description:'News'},'/',[]);
  assert.deepEqual(meta(html,'og:image'),[DEFAULT_IMAGE]);
  for(const field of ['width','height','type'])assert.deepEqual(meta(html,'og:image:'+field),[String(measured[field])]);
});

test('external or missing assets never get invented dimensions or MIME', () => {
  for(const hero_image of ['https://cdn.example.com/image.png','/this-file-does-not-exist.png']){
    assert.equal(readSocialImageMetadata(hero_image),null);
    const html=generateArticleHTML(base,{title:'External',dek:'Unknown dimensions',hero_image},'tech/external');
    for(const field of ['width','height','type'])assert.deepEqual(meta(html,'og:image:'+field),[]);
  }
});

test('metadata is based on the signature, not filename; encoded filenames and query strings resolve correctly', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'nsl-socialmeta-'));
  try{
    fs.writeFileSync(path.join(root,'jpeg-disguised.png'),jpeg);
    assert.deepEqual(readSocialImageMetadata('/jpeg-disguised.png',{publicDir:root}),decodeImageMetadata(jpeg));
    fs.writeFileSync(path.join(root,'a photo & two.png'),png);
    assert.deepEqual(readSocialImageMetadata(SITE_URL+'/a%20photo%20%26%20two.png?v=2&x=3',{publicDir:root}),{width:1536,height:1024,type:'image/png'});
    assert.equal(readSocialImageMetadata('/bad%ZZ.png',{publicDir:root}),null);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('encoded traversal and symlink escapes cannot expose files outside public', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'nsl-socialmeta-')),pub=path.join(root,'public');fs.mkdirSync(pub);
  try{
    fs.writeFileSync(path.join(root,'outside.png'),png);fs.symlinkSync('../outside.png',path.join(pub,'escape.png'));
    assert.throws(()=>readSocialImageMetadata('/..%2Foutside.png',{publicDir:pub}),/unsafe|escapes/);
    assert.throws(()=>readSocialImageMetadata('/escape.png',{publicDir:pub}),/symlink escapes/);
    assert.equal(readSocialImageMetadata('/outside.png',{publicDir:pub}),null);
    assert.equal(readSocialImageMetadata('https://attacker.invalid/outside.png',{publicDir:pub}),null);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('truncated, unsupported and zero-dimension headers fail closed', () => {
  for(const bytes of [Buffer.alloc(0),Buffer.from('not a real image'),png.subarray(0,20),jpeg.subarray(0,10)])assert.equal(decodeImageMetadata(bytes),null);
  const invalid=Buffer.from(png);invalid.writeUInt32BE(0,16);assert.equal(decodeImageMetadata(invalid),null);
  const jpegSof=Buffer.from([0xff,0xd8,0xff,0xc0,0,17,8,0,31,0,59,3,1,0x11,0,2,0x11,0,3,0x11,0,0xff,0xd9]);
  assert.deepEqual(decodeImageMetadata(jpegSof),{width:59,height:31,type:'image/jpeg'});
  const malformed=Buffer.from(jpegSof);malformed.writeUInt16BE(65535,4);assert.equal(decodeImageMetadata(malformed),null);
});
