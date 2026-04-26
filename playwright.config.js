import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Use node to run Vite so we do not depend on a +x shebang in node_modules/.bin
    command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173',
    env: {
      // Isolated e2e: do not use a live backend; keeps the Devices simulator enabled
      VITE_WS_URL: 'ws://127.0.0.1:59999/ws',
      // Short buzzer delay so the alert e2e does not wait 60s
      VITE_BUZZER_THRESHOLD: '3',
    },
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
})
