import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El proxy permite consumir /api en desarrollo sin problemas de CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
