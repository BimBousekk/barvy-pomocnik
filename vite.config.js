import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      // Auto-update SW v produkci. Při změně buildu si browser vezme novou verzi.
      registerType: 'autoUpdate',
      // Auto-injektuje <script> tag pro registraci SW do index.html
      injectRegister: 'auto',
      // Manifest máme vlastní v public/manifest.json
      manifest: false,

      workbox: {
        // Precache: zabalí všechny static buildem vygenerované soubory
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // Tesseract worker + core jsou velké (~3MB jeden ze souborů)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        runtimeCaching: [
          {
            // Tesseract.js core + worker z jsdelivr CDN
            // Pattern matchuje cokoli s "tesseract" v cestě na jsdelivr
            urlPattern: ({ url }) =>
              url.origin === 'https://cdn.jsdelivr.net' &&
              url.pathname.includes('tesseract'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tesseract-runtime',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 rok
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Jazykové modely Tesseractu — cs.traineddata, eng.traineddata
            urlPattern: ({ url }) =>
              url.origin === 'https://tessdata.projectnaptha.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'tesseract-lang',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // MyMemory translation API — krátkodobá cache (1 hodina)
            // NetworkFirst: vždy zkus online, fallback na cache když offline
            urlPattern: ({ url }) =>
              url.origin === 'https://api.mymemory.translated.net',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mymemory-translations',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1h
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Když SW vidí navigation request (uživatel napíše URL), použij index.html
        // To je klíčové pro SPA — všechny URL "uvnitř scope" servíruj jako index.html
        navigateFallback: '/index.html',

        // Cleanup starých cache verzí při aktivaci nového SW
        cleanupOutdatedCaches: true,
      },

      // Service worker je aktivní jen v produkci (build).
      // V dev módu by jen pletl při debugging.
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
