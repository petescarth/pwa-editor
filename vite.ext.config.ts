import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({ disable: true })
  ],
  build: {
    outDir: 'dist-ext',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
