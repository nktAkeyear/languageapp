import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { englishListsPlugin } from './scripts/englishLists';

// Relative base + single-file output: dist/index.html can be opened by double-click (file://).
export default defineConfig({
  base: './',
  plugins: [react(), englishListsPlugin(), viteSingleFile()],
  build: { outDir: 'dist', assetsInlineLimit: 100000000 },
  test: { include: ['src/**/*.test.ts'] },
} as never);
