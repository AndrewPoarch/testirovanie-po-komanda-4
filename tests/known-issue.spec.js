const { test, expect } = require('@playwright/test');
const { placeOrder, registerAndLogIn } = require('./shop-ui');

test.describe('Известный дефект', () => {
  test('BUG-01. Подтверждение заказа корректно показывает доставку за один день',
    { tag: '@known-issue' }, async ({ page }) => {
      await registerAndLogIn(page);
      await placeOrder(page);

      await test.step('Проверить формулировку срока доставки', async () => {
        const deliveryMessage = page.getByText(/^Your order will be delivered in /);
        await expect(deliveryMessage).toHaveText('Your order will be delivered in 1 day.');
      });
    });
});
