import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Separate Vite build for the content script.
 * Chrome content scripts cannot use ES module imports, so this builds
 * as a single self-contained IIFE bundle with all dependencies inlined.
 */
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'content-script': resolve(__dirname, 'src/content-scripts/index.ts'),
      },
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
        inlineDynamicImports: true,
      },
    },
  },
});
