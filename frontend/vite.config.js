import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // relative paths, works when served from a subfolder,
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      // "/api": "https://momentumtracker.onrender.com",
    }
  },
})
