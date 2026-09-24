import { defineConfig } from 'vitest/config';

// base './' keeps every asset path relative, so the site works from any Pages path
// (and keeps working if the repository is renamed).
export default defineConfig({
  base: './',
  build: { target: 'es2022', outDir: 'dist', assetsInlineLimit: 0 },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
