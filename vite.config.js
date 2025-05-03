import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': 'http://localhost:3001'
      // Se o backend estiver em outro IP, use:
      // '/api': 'http://168.231.99.143:3001'
    }
  }
})