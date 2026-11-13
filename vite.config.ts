import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/country-search/',
  resolve: {
    alias: {
      '@core': new URL('src/core', import.meta.url).pathname,
      '@dom': new URL('src/ui/dom', import.meta.url).pathname,
      '@layout': new URL('src/ui/layout', import.meta.url).pathname,
    },
  },
  server: {
    open: true, // откроет браузер на dev-странице после старта
  },
  preview: {
    open: true, // Автоматически откроет браузер при `vite preview`
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
