const { defineConfig } = require('@playwright/test');

const port = process.env.JUICE_SHOP_PORT ?? '3000';
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
  throw new Error('JUICE_SHOP_PORT должен быть числом от 1 до 65535');
}

module.exports = defineConfig({
  testDir: './tests',
  forbidOnly: Boolean(process.env.CI),
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', title: 'Команда 4 · Оформление заказа', mergeFiles: true }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: 'chromium',
    screenshot: 'on',
    video: 'on',
    trace: 'retain-on-failure',
  },
});
