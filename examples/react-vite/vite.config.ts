import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { buildWarningConfig } from '../../scripts/build-warnings.mjs';
export default defineConfig(env => ({ ...buildWarningConfig(env), plugins: [react()] }));
