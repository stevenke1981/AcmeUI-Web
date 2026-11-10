import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWarningConfig } from '../../scripts/build-warnings.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export default defineConfig(env => ({
  ...buildWarningConfig(env),
  plugins: [react()],
  publicDir: path.join(root, 'previews'),
  build: { rollupOptions: { input: {
    main: path.join(root, 'apps/gallery/index.html'),
    static: path.join(root, 'apps/gallery/static.html'),
  } } },
  server: { fs: { allow: [root] } },
}));
