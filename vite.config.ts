import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'offline.html'],
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        id: '/',
        name: 'Pennywise Fintech',
        short_name: 'Pennywise',
        description: 'Your smart finance companion',
        theme_color: '#050507',
        background_color: '#050507',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        // ✅ Temporary placeholder icons taake Chrome khush ho jaye
        icons: [
          {
            src: 'https://placehold.co/192x192/FF7F50/white/png?text=P',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/512x512/FF7F50/white/png?text=P',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/offline.html', 
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    env: {
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key'
    },
    exclude: ['node_modules', 'dist', 'coverage']
  }
});