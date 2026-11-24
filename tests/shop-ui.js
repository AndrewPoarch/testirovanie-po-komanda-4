const { randomUUID } = require('node:crypto');
const { test, expect } = require('@playwright/test');

const product = 'Apple Juice (1000ml)';
const recipient = 'Workshop Tester';
const deliveryCity = 'Sample City';
const testCardNumber = '4111111111111111'; // Учебный номер для локального симулятора.

const button = (page, name) => page.getByRole('button', { name, exact: true });
const textbox = (page, name) => page.getByRole('textbox', { name, exact: true });
const rowWith = (page, text) => page.getByRole('row').filter({ hasText: text });

async function openShop(page, route) {
  await page.goto(route);
  await button(page, 'Close Welcome Banner').click();
  await button(page, 'dismiss cookie message').click();
}

async function openCatalog(page) {
  await openShop(page, '/');
  await expect(page.getByText('All Products', { exact: true })).toBeVisible();
}

async function registerCustomer(page) {
  const email = `workshop-${randomUUID()}@example.test`;
  const password = 'Local-workshop-73!';

  await openShop(page, '/#/register');
  await textbox(page, 'Email address field').fill(email);
  await textbox(page, 'Field for the password').fill(password);
  await textbox(page, 'Field to confirm the password').fill(password);
  await page.getByRole('combobox', { name: 'Selection list for the security question' }).click();
  await page.getByRole('option', { name: 'Your favorite book?' }).click();
  await textbox(page, 'Field for the answer to the security question').fill('Workshop Sample');
  await button(page, 'Button to complete the registration').click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

  return { email, password };
}

async function logIn(page, { email, password }) {
  await textbox(page, 'Text field for the login email').fill(email);
  await textbox(page, 'Text field for the login password').fill(password);
  await button(page, 'Login').click();
}

async function registerAndLogIn(page) {
  await test.step('Создать тестового покупателя и войти', async () => {
    const customer = await registerCustomer(page);
    await logIn(page, customer);
    await expect(page.getByText('All Products', { exact: true })).toBeVisible();
  });
}

async function addProduct(page, name = product) {
  const productCard = page.getByRole('article').filter({ hasText: name });
  await productCard.getByRole('button', { name: 'Add to Basket' }).click();
  await expect(page.getByText(`Placed ${name} into basket.`, { exact: true })).toBeVisible();
}

async function openBasket(page) {
  await button(page, 'Show the shopping cart').click();
  await expect(page.getByRole('heading', { name: /Your Basket/ })).toBeVisible();
}

async function openCheckout(page) {
  await addProduct(page);
  await openBasket(page);
  await expect(rowWith(page, product)).toBeVisible();
  await button(page, 'Checkout').click();
  await expect(page.getByRole('heading', { name: 'Select an address' })).toBeVisible();
}

async function openDelivery(page) {
  await openCheckout(page);
  await button(page, 'Add New Address').click();
  await textbox(page, 'Name').fill(recipient);
  await textbox(page, 'Country').fill('United States');
  await page.getByRole('spinbutton', { name: 'Mobile Number' }).fill('2025550147');
  await textbox(page, 'ZIP Code').fill('00000');
  await textbox(page, 'Address').fill('1 Example Street');
  await textbox(page, 'City').fill(deliveryCity);
  await button(page, 'Submit').click();

  await rowWith(page, deliveryCity).getByRole('radio').check();
  await button(page, 'Continue').click();
  await expect(page.getByRole('heading', { name: 'Choose a delivery speed' })).toBeVisible();
}

async function chooseDelivery(page, method) {
  await rowWith(page, method).getByRole('radio').check();
  await button(page, 'Proceed to delivery method selection').click();
  await expect(page.getByRole('heading', { name: 'My Payment Options' })).toBeVisible();
}

const addCardButton = (page) => button(page, 'Add new card Add a credit or debit card');

async function fillCardDetails(page, number = testCardNumber) {
  await addCardButton(page).click();
  await textbox(page, 'Name').fill(recipient);
  await page.getByRole('spinbutton', { name: 'Card Number' }).fill(number);
  await page.getByRole('combobox', { name: 'Expiry Month' }).selectOption({ label: '12' });
  await page.getByRole('combobox', { name: 'Expiry Year' }).selectOption({ label: '2089' });
}

async function chooseCard(page) {
  await fillCardDetails(page);
  await button(page, 'Submit').click();

  const savedCard = rowWith(page, /1111.*Workshop Tester/);
  await expect(savedCard).toBeVisible();
  await addCardButton(page).click();
  await savedCard.getByRole('radio').check();
}

async function openOrderReview(page) {
  await test.step('Указать адрес и выбрать доставку за один день', async () => {
    await openDelivery(page);
    await chooseDelivery(page, 'One Day Delivery');
  });

  await test.step('Выбрать учебную карту и открыть сводку заказа', async () => {
    await chooseCard(page);
    await button(page, 'Proceed to review').click();
    await expect(page.getByText('Order Summary', { exact: true })).toBeVisible();
  });
}

async function placeOrder(page) {
  await openOrderReview(page);
  await test.step('Подтвердить заказ на 2.98¤', async () => {
    await expect(page.getByRole('row', { name: /^Total Price 2\.98¤$/ })).toBeVisible();
    await button(page, 'Complete your purchase').click();
    await expect(page.getByRole('heading', { name: 'Thank you for your purchase!' })).toBeVisible();
  });
}

module.exports = {
  addProduct,
  button,
  chooseDelivery,
  deliveryCity,
  fillCardDetails,
  logIn,
  openBasket,
  openCatalog,
  openCheckout,
  openDelivery,
  openOrderReview,
  placeOrder,
  product,
  registerAndLogIn,
  registerCustomer,
  rowWith,
  testCardNumber,
  textbox,
};
