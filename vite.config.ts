import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/pwa-editor/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon-96x96.png'],
      manifest: {
        name: 'PWA Editor',
        short_name: 'PWA Editor',
        description: 'A powerful offline-capable text editor with syntax highlighting',
        theme_color: '#1e1e1e',
        background_color: '#1e1e1e',
        display: 'standalone',
        orientation: 'any',
        start_url: '/pwa-editor/',
        scope: '/pwa-editor/',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        file_handlers: [
          {
            action: '/pwa-editor/',
            accept: {
              'text/plain': ['.txt', '.text', '.log', '.cfg', '.ini', '.env'],
              'text/javascript': ['.js', '.mjs', '.cjs'],
              'text/typescript': ['.ts', '.mts', '.cts'],
              'text/jsx': ['.jsx'],
              'text/tsx': ['.tsx'],
              'text/x-python': ['.py', '.pyw', '.pyi'],
              'text/html': ['.html', '.htm'],
              'text/css': ['.css'],
              'application/json': ['.json', '.jsonc'],
              'text/markdown': ['.md', '.markdown'],
              'text/x-sql': ['.sql'],
              'text/yaml': ['.yaml', '.yml'],
              'text/xml': ['.xml', '.svg', '.xsd', '.xsl'],
              'text/x-rust': ['.rs'],
              'text/x-c++src': ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
              'text/x-csrc': ['.c'],
              'text/x-go': ['.go'],
              'text/x-sh': ['.sh', '.bash', '.zsh'],
              'text/x-toml': ['.toml']
            }
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
