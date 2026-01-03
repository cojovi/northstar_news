import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prerenderOG from './vite-plugin-prerender-og.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    prerenderOG()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
