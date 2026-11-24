# Оформление заказа в OWASP Juice Shop

**ИТМО · Тестирование ПО · ПР7 · Вариант 4 · Команда 4**

UI-автотесты на Playwright и JavaScript проверяют путь покупателя от добавления товара в корзину до появления заказа в истории.

[Открыть HTML-отчёт со скриншотами и видео](https://andrewpoarch.github.io/testirovanie-po-komanda-4/)

[![Playwright E2E](https://github.com/AndrewPoarch/testirovanie-po-komanda-4/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/AndrewPoarch/testirovanie-po-komanda-4/actions/workflows/e2e.yml)

## Что проверяем

| Группа | Тесты | Проверки |
| --- | --- | --- |
| Корзина | [CART-01–06 · 6 тестов](tests/cart.spec.js) | Один и несколько товаров, увеличение и уменьшение количества, пересчёт суммы, удаление товара, пустая корзина. |
| Авторизация | [AUTH-01–03 · 3 теста](tests/auth.spec.js) | Вход в оформление для покупателя, блокировка оформления для гостя, перенаправление на вход и возврат в корзину. |
| Оформление | [CHK-01–04 · 4 теста](tests/checkout.spec.js) | Адрес, доставка и учебная карта, расчёт итоговой суммы, валидация платёжных полей, блокировка перехода без выбора доставки. |
| После оформления | [POST-01–02 · 2 теста](tests/post-checkout.spec.js) | Очистка корзины и появление заказа с тем же ID и товаром в истории покупателя. |

В опубликованном отчёте **15 проверок прошли, одна упала**. В отдельном сценарии [BUG-01](tests/known-issue.spec.js) заказ успешно подтверждается, а экран показывает `1 days` вместо `1 day`. В карточке теста видны шаги, несовпавшие строки, скриншот и видео.

## Как запустить

Понадобятся Node.js 22 или новее и Docker с Compose v2. На Linux для установки браузера вместе с его системными библиотеками используйте `npx playwright install --with-deps chromium`.

```bash
git clone https://github.com/AndrewPoarch/testirovanie-po-komanda-4.git
cd testirovanie-po-komanda-4
docker compose up -d --wait
npm ci
npx playwright install chromium
npm test
npm run report
```

Стенд доступен по адресу `http://127.0.0.1:3000`. Docker Compose запускает зафиксированный образ Juice Shop, а Playwright создаёт для сценариев отдельные учётные записи с вымышленными данными. Оплата проходит на локальном стенде с учебной картой.

| Команда | Что откроется или запустится |
| --- | --- |
| `npm test` | 15 основных тестов |
| `npm test -- tests/cart.spec.js` | Только тесты корзины |
| `npm run test:ui` | Интерактивный режим Playwright со списком сценариев |
| `npm run test:report` | Полный прогон, включая BUG-01. При воспроизведении дефекта команда завершится с кодом 1 и сохранит отчёт |
| `npm run report` | HTML-отчёт последнего прогона |

Скриншоты и видео сохраняются в `playwright-report/`. GitHub Actions прогоняет основной набор и прикладывает HTML-отчёт к запуску. После работы стенд можно остановить командой `docker compose down`.
