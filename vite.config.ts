
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpg'],
      manifest: {
        name: "AQUA CODE",
        short_name: "AQUA CODE",
        description: "Апликација за ватерполо тренинг од Владо Смилевски",
        theme_color: "#0891b2",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        // ВАЖНО: Ова ја поправа 404 грешката на мобилен
        start_url: "/AquaCode/",
        scope: "/AquaCode/",
        icons: [
          {
            src: "logo.jpg",
            sizes: "192x192",
            type: "image/jpeg"
          },
          {
            src: "logo.jpg",
            sizes: "512x512",
            type: "image/jpeg"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
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
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
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
  base: command === 'serve' ? '/' : '/AquaCode/',
  server: {
    port: 5173,
    strictPort: false,
    host: true
  }
}));
