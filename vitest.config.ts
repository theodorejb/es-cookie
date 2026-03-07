import { defineConfig } from 'vitest/config'
import { preview } from '@vitest/browser-preview'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: preview(),
      instances: [
        { browser: 'firefox' },
      ],
    },
  },
})
