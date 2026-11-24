const { test, expect } = require('@playwright/test');
const {
  addProduct,
  button,
  logIn,
  openBasket,
  openCatalog,
  openCheckout,
  product,
  registerAndLogIn,
  registerCustomer,
  rowWith,
} = require('./shop-ui');

async function tryToCheckoutAsGuest(page) {
  await addProduct(page);
  await openBasket(page);
  await expect(rowWith(page, product)).toBeVisible();
  await button(page, 'Checkout').click();
}

test.describe('Авторизация при оформлении заказа', () => {
  test('AUTH-01. Авторизованный пользователь открывает оформление заказа', async ({ page }) => {
    await registerAndLogIn(page);
    await openCheckout(page);

    await expect(button(page, 'Add New Address')).toBeEnabled();
  });

  test('AUTH-02. Гость не попадает к выбору адреса после попытки оформить заказ', async ({ page }) => {
    await openCatalog(page);
    await tryToCheckoutAsGuest(page);

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Select an address' })).toHaveCount(0);
  });

  test('AUTH-03. После входа гость возвращается в корзину', async ({ page }) => {
    const customer = await registerCustomer(page);
    await button(page, 'Back to homepage').click();
    await tryToCheckoutAsGuest(page);
    await expect(page).toHaveURL(/#\/login\?redirectUrl=%2Fbasket$/);

    await logIn(page, customer);
    await expect(page).toHaveURL(/#\/basket$/);
    await expect(page.getByRole('heading', { name: /Your Basket/ })).toBeVisible();
  });
});
