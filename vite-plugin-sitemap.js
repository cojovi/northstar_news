/**
 * Vite Plugin: Sitemap Generator
 * Automatically generates sitemap during build and watches for changes during dev
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export default function sitemapPlugin() {
  let isDev = false;
  let watcher = null;

  return {
    name: 'vite-plugin-sitemap',

    configResolved(config) {
      isDev = config.command === 'serve';
    },

    async buildStart() {
      console.log('\n🗺️  Generating sitemap...');
      
      try {
        const { stdout } = await execAsync('node scripts/generate-sitemap.js');
        console.log(stdout);
      } catch (error) {
        console.error('❌ Failed to generate sitemap:', error.message);
      }

      // Watch for changes in dev mode
      if (isDev) {
        const contentDir = path.resolve(process.cwd(), 'content');
        
        console.log('👀 Watching markdown files for changes...\n');
        
        let timeout;
        watcher = fs.watch(contentDir, { recursive: true }, async (eventType, filename) => {
          if (filename && filename.endsWith('.md')) {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
              console.log(`\n🔄 Markdown file changed: ${filename}`);
              try {
                const { stdout } = await execAsync('node scripts/generate-sitemap.js');
                console.log(stdout);
              } catch (error) {
                console.error('❌ Failed to regenerate sitemap:', error.message);
              }
            }, 500);
          }
        });
      }
    },

    buildEnd() {
      if (watcher) {
        watcher.close();
      }
    }
  };
}

