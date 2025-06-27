import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user': 'http://127.0.0.1:5000',
      '/video': 'http://127.0.0.1:5000',
      '/comment': 'http://127.0.0.1:5000',
      '/Api': 'http://127.0.0.1:5000',
    }
  }
})
