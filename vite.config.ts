import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'database': ['dexie', 'dexie-react-hooks'],
          'utils': ['date-fns', 'fuse.js', 'lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
