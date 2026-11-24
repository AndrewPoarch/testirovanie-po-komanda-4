const { test, expect } = require('@playwright/test');
const {
  button,
  chooseDelivery,
  deliveryCity,
  fillCardDetails,
  openDelivery,
  openOrderReview,
  placeOrder,
  product,
  registerAndLogIn,
  rowWith,
  testCardNumber,
  textbox,
} = require('./shop-ui');

test.beforeEach(async ({ page }) => {
  await registerAndLogIn(page);
});

test.describe('Процесс оформления', () => {
  test('CHK-01. Заказ успешно оформляется после выбора адреса, доставки и карты', async ({ page }) => {
    await placeOrder(page);

    await test.step('Проверить подтверждение заказа', async () => {
      await expect(page.getByText(/Your order has been placed and is being processed/)).toBeVisible();
      await expect(page.getByRole('link', { name: 'Track Orders' })).toHaveAttribute('href', /[?&]id=[^&]+/);
    });
  });

  test('CHK-02. Итог перед подтверждением включает стоимость товара и доставки', async ({ page }) => {
    await openOrderReview(page);

    await expect(rowWith(page, product)).toContainText('1.99¤');
    await expect(page.getByText(deliveryCity, { exact: false })).toBeVisible();
    await expect(page.getByText('Card ending in 1111', { exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: /^Items 1\.99¤$/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /^Delivery 0\.99¤$/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /^Promotion 0\.00¤$/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /^Total Price 2\.98¤$/ })).toBeVisible();
  });

  test('CHK-03. Номер карты и имя держателя проходят валидацию при заполнении', async ({ page }) => {
    await openDelivery(page);
    await chooseDelivery(page, 'Standard Delivery');
    await fillCardDetails(page, '1234');

    const submit = button(page, 'Submit');
    await expect(submit).toBeDisabled();

    const holder = textbox(page, 'Name');
    const holderName = await holder.inputValue();
    await holder.clear();
    await page.getByRole('spinbutton', { name: 'Card Number' }).fill(testCardNumber);
    await expect(submit).toBeDisabled();

    await holder.fill(holderName);
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(rowWith(page, /1111.*Workshop Tester/)).toBeVisible();
  });

  test('CHK-04. Без выбранного способа доставки нельзя перейти к оплате', async ({ page }) => {
    await openDelivery(page);

    const options = page.getByRole('radio');
    await expect(options).toHaveCount(3);
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
    await expect(button(page, 'Proceed to delivery method selection')).toBeDisabled();

    await chooseDelivery(page, 'Standard Delivery');
    await expect(button(page, 'Pay 1.99¤')).toBeVisible();
  });
});
