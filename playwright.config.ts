import { defineConfig, devices } from "@playwright/test";

const testPort = process.env.WB_E2E_PORT ?? "8765";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:" + testPort,
    trace: "off",
  },
  webServer: {
    command: "pnpm run build && node scripts/serve-homepage.mjs --port=" + testPort,
    url: "http://127.0.0.1:" + testPort,
    reuseExistingServer: !process.env.WB_E2E_PORT,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
      },
    },
  ],
});
