import { renameSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { englishListsPlugin } from './scripts/englishLists';

/** The v2 UI (src/v2): its own entry (v2.html) and its own single-file build → dist-v2/index.html. */
function asIndex(outDir: string): Plugin {
  return {
    name: 'v2-as-index',
    closeBundle() {
      const from = resolve(outDir, 'v2.html');
      if (existsSync(from)) renameSync(from, resolve(outDir, 'index.html'));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), englishListsPlugin(), viteSingleFile(), asIndex('dist-v2')],
  build: { outDir: 'dist-v2', emptyOutDir: true, assetsInlineLimit: 100000000, rollupOptions: { input: 'v2.html' } },
});
