// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1', 
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // votre backend Express
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
