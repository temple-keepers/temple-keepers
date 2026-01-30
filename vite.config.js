import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'icons/*.png'],
      manifest: false, // We use our own manifest.json in public folder
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Disable in dev to avoid issues
      }
    })
  ],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    minify: 'terser',
    modulePreload: false,
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimize asset naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '') : 'chunk'
          return `assets/${facadeModuleId}-[hash].js`
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/img/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
        manualChunks(id) {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core'
          }
          // React Router
          if (id.includes('node_modules/react-router-dom')) {
            return 'react-router'
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
          // Lucide icons - split separately as they're large
          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }
          // Stripe
          if (id.includes('node_modules/@stripe')) {
            return 'stripe'
          }
          // Google AI
          if (id.includes('node_modules/@google/generative-ai')) {
            return 'google-ai'
          }
          // Admin pages - lazy loaded
          if (id.includes('/pages/admin/')) {
            return 'admin'
          }
          // Community pages including sub-components
          if (id.includes('/pages/Community') || id.includes('/pages/PodDetail') || id.includes('/pages/MembersDirectory') || id.includes('/components/community/')) {
            return 'community'
          }
          // Challenge pages
          if (id.includes('/pages/Challenge')) {
            return 'challenges'
          }
          // Recipe/nutrition related pages
          if (id.includes('/pages/Recipe') || id.includes('/pages/Meal')) {
            return 'nutrition'
          }
          // Group large user feature pages
          if (id.includes('/pages/Goals') || id.includes('/pages/Habits') || id.includes('/pages/DailyLog')) {
            return 'user-features'
          }
          // Other vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console logs in production
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
