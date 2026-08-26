import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Test config, kept out of `vite.config.ts` so the dev server never has to
//resolve `vitest`. Vitest reads this file in preference to the Vite one.
export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
