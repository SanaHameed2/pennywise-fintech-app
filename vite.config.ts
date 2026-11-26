import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'offline.html', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Pennywise',
        short_name: 'Pennywise',
        description: 'A sandbox digital wallet: safe transfers, real insights, English and Urdu. All money is simulated.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#050507',
        background_color: '#050507',
        categories: ['finance'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache the app shell only. Account data is never cached: API calls always go to the network.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // Fonts (many unicode-range subsets) are cached when first used instead of all being precached.
        runtimeCaching: [
          { urlPattern: /\.woff2$/, handler: 'CacheFirst', options: { cacheName: 'fonts', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
        ],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    })
  ],
  
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: cached across deploys and fetched in parallel.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/recharts|d3-|victory-vendor|internmap|decimal\.js-light|lodash/.test(id)) return 'vendor-charts';
          if (/@supabase|@supabase\/|isows|ws\//.test(id)) return 'vendor-supabase';
          if (/i18next|react-i18next/.test(id)) return 'vendor-i18n';
          if (/react-router|@remix-run/.test(id)) return 'vendor-router';
          if (/[\\/]react-dom[\\/]|[\\/]react[\\/]|scheduler/.test(id)) return 'vendor-react';
          if (/@tanstack/.test(id)) return 'vendor-query';
          return undefined;
        },
      },
    },
    cssCodeSplit: true,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    testTimeout: 10000, 
    env: {
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key'
    },
    
    exclude: ['node_modules', 'dist', 'coverage', 'tests/**'],
  }
});