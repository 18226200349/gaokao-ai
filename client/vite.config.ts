import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 4001,
    host: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
  },
})
