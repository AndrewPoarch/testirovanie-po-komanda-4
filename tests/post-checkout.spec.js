const { test, expect } = require('@playwright/test');
const { button, openBasket, placeOrder, product, registerAndLogIn, rowWith } = require('./shop-ui');

test.beforeEach(async ({ page }) => {
  await registerAndLogIn(page);
});

test.describe('После оформления заказа', () => {
  test('POST-01. После успешного оформления корзина очищается', async ({ page }) => {
    await placeOrder(page);
    await expect(button(page, 'Show the shopping cart')).toHaveText(/0\s*$/);

    await openBasket(page);
    await expect(rowWith(page, product)).toHaveCount(0);
    await expect(button(page, 'Checkout')).toBeDisabled();
  });

  test('POST-02. Оформленный заказ виден в истории пользователя', async ({ page }) => {
    await placeOrder(page);

    const tracking = page.getByRole('link', { name: 'Track Orders' });
    await expect(tracking).toHaveAttribute('href', /[?&]id=[^&]+/);
    const trackingHref = await tracking.getAttribute('href');
    const orderId = new URLSearchParams(trackingHref.split('?')[1]).get('id');
    expect(orderId).toBeTruthy();

    await button(page, 'Show/hide account menu').click();
    await page.getByRole('menuitem', { name: 'Show Orders and Payment Menu' }).click();
    await page.getByRole('menuitem', { name: 'Go to order history page' }).click();

    await expect(page).toHaveURL(/#\/order-history$/);
    await expect(page.getByText(`#${orderId}`, { exact: true })).toBeVisible();
    await expect(rowWith(page, product)).toBeVisible();
  });
});
