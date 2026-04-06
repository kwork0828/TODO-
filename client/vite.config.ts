import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ── Dev server proxy ────────────────────────────────────────────────────────
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // ── Production build optimisations ─────────────────────────────────────────
  build: {
    target: 'es2015',
    sourcemap: false,
    // Chunk size warning threshold (kB)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual code splitting: vendor libs into separate cacheable chunks
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Calendar (largest dependency)
          'vendor-calendar': [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
          ],
          // Utilities
          'vendor-utils': ['axios', 'date-fns', 'lucide-react'],
        },
        // Deterministic filenames with content hash for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
