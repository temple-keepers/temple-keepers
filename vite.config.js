import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React + Router — cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase client — separate chunk
          'vendor-supabase': ['@supabase/supabase-js'],
          // Gemini AI — only loaded when recipe generator is used
          'vendor-ai': ['@google/generative-ai'],
          // Icons — separate chunk (large)
          'vendor-icons': ['lucide-react'],
        }
      }
    },
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk warning limit
    chunkSizeWarningLimit: 600,
  }
})
