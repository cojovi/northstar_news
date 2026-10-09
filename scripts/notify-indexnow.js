#!/usr/bin/env node
/**
 * Notify IndexNow (Bing, DuckDuckGo, Yandex, Yahoo) of new/updated URLs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'thenorthstarledger.com';
const INDEXNOW_KEY = '77f03d3c7a8573e6c5fc3413efbae282';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const CONTENT_DIR = path.join(__dirname, '../content');

function getLatestArticles(limit = 1) {
  const articles = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        scan(full);
      } else if (ent.isFile() && ent.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(full, 'utf-8');
          const { data } = matter(content);
          if (data && data.status === 'published') {
            const rel = path.relative(CONTENT_DIR, full);
            const cat = rel.split(path.sep)[0];
            const slug = data.slug || path.basename(full, '.md');
            const pub = data.published || '';
            articles.push({ pub, url: `https://${HOST}/${cat}/${slug}` });
          }
        } catch (e) {
          // ignore malformed
        }
      }
    }
  }
  scan(CONTENT_DIR);
  articles.sort((a, b) => new Date(b.pub) - new Date(a.pub));
  return articles.slice(0, limit).map(a => a.url);
}

async function notifyIndexNow(urls) {
  if (!urls || urls.length === 0) {
    console.log('⚠️ No URLs to submit to IndexNow.');
    return;
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  console.log(`🌐 Submitting ${urls.length} URL(s) to IndexNow...`);
  try {
    const resp = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (resp.status === 200 || resp.status === 202) {
      console.log(`  ✅ [${resp.status} OK] Submitted to IndexNow successfully.`);
      urls.forEach(u => console.log(`     - ${u}`));
    } else {
      const text = await resp.text();
      console.log(`  ⚠️ [${resp.status}] Response: ${text}`);
    }
  } catch (err) {
    console.error(`  ❌ Error notifying IndexNow: ${err.message}`);
  }
}

const args = process.argv.slice(2);
let targetUrls = [];

if (args.length > 0 && !args[0].startsWith('--')) {
  targetUrls = args;
} else {
  let count = 1;
  const recentIdx = args.indexOf('--recent');
  if (recentIdx !== -1 && args[recentIdx + 1]) {
    count = parseInt(args[recentIdx + 1], 10) || 1;
  }
  targetUrls = getLatestArticles(count);
}

notifyIndexNow(targetUrls);
