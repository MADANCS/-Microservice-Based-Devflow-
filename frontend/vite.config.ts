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
  // Fix: sockjs-client uses Node's `global` — shim it for browser
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs'],
  },
  server: {
    port: 4000,
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      // Proxy all API calls to the Spring Cloud Gateway
      '/api': {
        target: 'http://localhost:9080',
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket connections to the realtime service
      '/ws': {
        target: 'http://localhost:9091',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
})
