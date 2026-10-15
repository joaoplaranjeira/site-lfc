import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5004',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 8081
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
