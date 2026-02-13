import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/AI_stuff_web/',
  build: {
    outDir: 'dist',
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        vlm: resolve(__dirname, 'src/pages/vlm.html'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
});
