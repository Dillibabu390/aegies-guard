import { defineConfig } from 'vite';

export default defineConfig({
  root: 'simulator',
  base: '/simulator/',
  publicDir: '../public',
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
});
