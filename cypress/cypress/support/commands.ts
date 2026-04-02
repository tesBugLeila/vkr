// Глобальные команды и хелперы — доступны во всех тестах через cy.*


declare global {
  namespace Cypress {
    interface Chainable {
      loginAsVasily(): void;
      loginAsAdmin(): void;
      loginAsBlockedViaApi(): void;
      loginAsVasilyViaApi(): void;
      getSmsCode(phone: string): Chainable<string>;
    }
  }
}

//  Авторизация через API (без SMS) 

/** Войти как Василий — постоянный пароль, без SMS */
Cypress.Commands.add('loginAsVasily', () => {
  cy.request({
    method: 'POST',
    url: '/api/users/login',
    body: { phone: '+79001234567', password: '123456' },
  }).then((resp) => {
    cy.setCookie('access-token', resp.body.token);
  });
});

/** Войти как Администратор — постоянный пароль, без SMS */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.request({
    method: 'POST',
    url: '/api/users/login',
    body: { phone: '+79005555555', password: '555555' },
  }).then((resp) => {
    cy.setCookie('access-token', resp.body.token);
  });
});



// SMS

/**
 * Получить последний SMS-код для номера через админ API.
 *
 */
Cypress.Commands.add('getSmsCode', (phone: string) => {
  cy.request({
    method: 'POST',
    url: '/api/users/login',
    body: { phone: '+79005555555', password: '555555' },
  }).then((adminResp) => {
    const adminToken: string = adminResp.body.token;

    const fetchCode = (attemptsLeft: number): Cypress.Chainable<string> => {
      return cy.request({
        method: 'GET',
        url: '/api/admin/sms-log',
        headers: { Authorization: `Bearer ${adminToken}` },
        qs: { phone, page: 1, limit: 20 },
      }).then((resp) => {
        const messages: { phone: string; text: string; sendAt: string }[] = resp.body.smsLog;

        cy.log(` SMS-лог для ${phone} — всего записей: ${messages.length}`);
        messages.forEach((m, i) => cy.log(`  [${i}] ${m.phone} | ${m.sendAt} | ${m.text}`));

        const forPhone = messages.filter((m) => m.phone === phone);
        cy.log(`Найдено для ${phone}: ${forPhone.length} шт.`);

        const last = forPhone[0]; // отсортировано по убыванию — первый = последний
        if (!last) {
          cy.log(` SMS ещё не появился, осталось попыток: ${attemptsLeft}`);
          if (attemptsLeft <= 0) throw new Error(`SMS для ${phone} не найден`);
          return cy.wait(1000).then(() => fetchCode(attemptsLeft - 1));
        }

        cy.log(` Берём: "${last.text}" (${last.sendAt})`);
        const match = last.text.match(/Код:\s*(\d+)/);
        if (!match) throw new Error(`Код не найден в тексте: ${last.text}`);
        cy.log(` Код: ${match[1]}`);
        return cy.wrap(match[1]);
      });
    };

    return fetchCode(5);
  });
});

export {};