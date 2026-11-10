import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { buildWarningConfig } from '../../scripts/build-warnings.mjs';
export default defineConfig(env => ({ ...buildWarningConfig(env), plugins: [vue()] }));
