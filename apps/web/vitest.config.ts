import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    css: false,
    exclude: ['node_modules/**', 'e2e/**', '.next/**', 'out/**'],
  },
  esbuild: {
    jsx: 'automatic',
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
