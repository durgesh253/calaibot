import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/web-call': {
        target: 'http://51.16.27.23:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/web-call/, '/web-call')
      },
      '/api': {
        target: 'http://51.16.27.23:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

