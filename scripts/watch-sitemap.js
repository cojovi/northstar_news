#!/usr/bin/env node
/**
 * Sitemap Watcher
 * Watches for changes in markdown files and regenerates sitemap automatically
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../content');

let timeout;
let isGenerating = false;

/**
 * Regenerate sitemap with debouncing
 */
function regenerateSitemap() {
  clearTimeout(timeout);
  
  timeout = setTimeout(() => {
    if (isGenerating) return;
    
    isGenerating = true;
    console.log('\n🔄 Markdown file changed, regenerating sitemap...');
    
    exec('node scripts/generate-sitemap.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error generating sitemap:', error.message);
      } else {
        console.log(stdout);
      }
      isGenerating = false;
    });
  }, 500); // Wait 500ms after last change
}

/**
 * Watch directory recursively
 */
function watchDirectory(dir) {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      regenerateSitemap();
    }
  });
}

console.log('👀 Watching for markdown file changes...');
console.log(`📂 Directory: ${CONTENT_DIR}\n`);

// Initial generation
regenerateSitemap();

// Start watching
watchDirectory(CONTENT_DIR);

console.log('✅ Watcher started. Press Ctrl+C to stop.\n');

