import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:5173",
  },
  // ES module は file:// では読めないため、簡易HTTPサーバー経由で配信してテストする
  webServer: {
    command: "npx http-server . -p 5173 -c-1 -s",
    url: "http://localhost:5173/demo/login/",
    reuseExistingServer: !process.env.CI,
  },
});
