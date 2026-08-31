import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      include: ['tests/**/*.spec.ts'],
      typecheck: {
        tsconfig: './tsconfig.vitest.json',
      },
      env: {
        VITE_API_BASE: 'http://localhost:5000/api',
      },
    },
  }),
);
