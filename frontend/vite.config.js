import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxied server-side (inside the `dev` container), so the browser only ever
    // sees same-origin requests — reaches the backend by its docker-compose service name.
    proxy: {
      '/api': {
        target: 'http://backend-dev:8000',
        changeOrigin: true,
      },
    },
  },
})
