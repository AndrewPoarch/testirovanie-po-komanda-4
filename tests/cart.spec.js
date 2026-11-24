const { test, expect } = require('@playwright/test');
const {
  button,
  rowWith,
  product,
  registerAndLogIn,
  addProduct,
  openBasket,
} = require('./shop-ui');

const secondProduct = 'Apple Pomace';

async function addProductAndOpenBasket(page, productName = product) {
  await addProduct(page, productName);
  await openBasket(page);
}

async function increaseQuantity(page) {
  const productRow = rowWith(page, product);
  await productRow.getByRole('button')
    .filter({ has: page.locator('svg[data-icon="plus-square"]') })
    .click();
  return productRow;
}

test.describe('Корзина', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogIn(page);
  });

  test('CART-01. Добавление одного товара в корзину', async ({ page }) => {
    await addProductAndOpenBasket(page);

    const productRow = rowWith(page, product);
    await expect(productRow).toHaveCount(1);
    await expect(productRow.getByText('1', { exact: true })).toBeVisible();
    await expect(productRow).toContainText('1.99¤');
    await expect(page.getByText('Total Price: 1.99¤', { exact: true })).toBeVisible();
  });

  test('CART-02. Добавление нескольких разных товаров в корзину', async ({ page }) => {
    await addProduct(page, product);
    await addProduct(page, secondProduct);
    await openBasket(page);

    await expect(rowWith(page, product)).toBeVisible();
    await expect(rowWith(page, secondProduct)).toBeVisible();
    await expect(page.getByText('Total Price: 2.88¤', { exact: true })).toBeVisible();
  });

  test('CART-03. Изменение количества товара в корзине', async ({ page }) => {
    await addProductAndOpenBasket(page);
    const productRow = await increaseQuantity(page);

    await expect(productRow.getByText('2', { exact: true })).toBeVisible();

    await productRow.getByRole('button')
      .filter({ has: page.locator('svg[data-icon="minus-square"]') })
      .click();
    await expect(productRow.getByText('1', { exact: true })).toBeVisible();
  });

  test('CART-04. Пересчёт итоговой стоимости при изменении количества', async ({ page }) => {
    await addProductAndOpenBasket(page);
    await expect(page.getByText('Total Price: 1.99¤', { exact: true })).toBeVisible();

    await increaseQuantity(page);

    await expect(page.getByText('Total Price: 3.98¤', { exact: true })).toBeVisible();
  });

  test('CART-05. Удаление товара из корзины', async ({ page }) => {
    await addProductAndOpenBasket(page);
    const productRow = rowWith(page, product);

    await productRow.getByRole('button')
      .filter({ has: page.locator('svg[data-icon="trash-alt"]') })
      .click();

    await expect(productRow).toHaveCount(0);
    await expect(page.getByText('Total Price: 0¤', { exact: true })).toBeVisible();
  });

  test('CART-06. Переход к оформлению заказа с пустой корзиной', async ({ page }) => {
    await openBasket(page);

    await expect(rowWith(page, product)).toHaveCount(0);
    await expect(button(page, 'Checkout')).toBeDisabled();
  });
});
