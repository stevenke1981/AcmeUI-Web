import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';
import path from 'node:path';
export default defineConfig({ root: process.cwd(), plugins: [react(), vue(), tailwind()], server: { host: '127.0.0.1', port: 4173, strictPort: true }, resolve: { alias: {
  '@acmeui/tailwind': path.resolve('packages/tailwind/src'),
} } });
