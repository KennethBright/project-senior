// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist' // This is default, but we declare it for clarity
  },
  base: "./" // Ensures paths are relative, required for Vercel
});
