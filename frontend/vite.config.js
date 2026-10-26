import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// During development the React dev server proxies API calls to Flask.
// In production Flask serves the built dist at the same origin.
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
    allowedHosts: [
      "jakcpc"
    ]
  },
})
