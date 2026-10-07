import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    // Process `*.css?raw` imports (component stylesheets) instead of stubbing them
    css: { include: [/src\/components\/.+\.css/] },
  },
});
