// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-xpath'
// Angular при каждом старте вызывает GET /api/users/me чтобы проверить сессию.
// Без куки бэкенд отвечает 401 → Angular бросает HttpErrorResponse →
// Cypress перехватывает как uncaught:exception и роняет тест.
// Это ожидаемое поведение для неавторизованного пользователя — игнорируем.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('401') || err.message.includes('Unauthorized')) {
    return false;
  }
  return true;
});
 