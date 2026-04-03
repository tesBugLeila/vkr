
// Команды loginAsVasilyViaApi, getSmsCode — из cypress/support/commands.ts

describe('Аутентификация пользователя', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  
  // ПОЗИТИВНЫЕ СЦЕНАРИИ

    it('TC-AUTH-01: Успешный вход — ввод телефона и подтверждение SMS-кода', () => {
    // Василий 
    cy.visit('/login');
    cy.get('input[type="tel"]').type('9001234567');
    cy.get('button').contains('Отправить код').should('not.be.disabled').click();
 
    cy.get('input.code').should('be.visible').type('123456');
    cy.xpath("(//button[contains(text(),'Войти')])[3]").click();
    cy.url().should('match', /\/(profile)?$/);
  });

  it('TC-AUTH-02: Первый вход нового номера — перенаправление на /profile', () => {
    const uniqueDigits = Date.now().toString().slice(-7);
    const uniquePhone = `+7900${uniqueDigits}`;
    const uniqueInput = `900${uniqueDigits}`;

    cy.visit('/login');
    cy.get('input[type="tel"]').type(uniqueInput);
    cy.get('button').contains('Отправить код').click();

    cy.getSmsCode(uniquePhone).then((code) => {
      cy.get('input.code').should('be.visible').type(code);
      cy.xpath("(//button[contains(text(),'Войти')])[3]").click();
      cy.url().should('include', '/profile');
    });
  });

  
  it('TC-AUTH-03: JWT-токен сохраняется в cookie после входа', () => {
    // Василий — постоянный пароль, getSmsCode не нужен
    cy.visit('/login');
    cy.get('input[type="tel"]').type('9001234567');
    cy.get('button').contains('Отправить код').should('not.be.disabled').click();
 
    cy.get('input.code').should('be.visible').type('123456');
    cy.xpath("(//button[contains(text(),'Войти')])[3]").click();
 
    cy.url().should('match', /\/(profile)?$/).then(() => {
      cy.getCookie('access-token')
        .should('exist')
        .and('have.property', 'value')
        .and('match', /\S+\.\S+\.\S+/);
    });
  });



  it('TC-AUTH-04: Успешный выход из системы', () => {
    cy.loginAsVasily();
    cy.visit('/');
    cy.get('app-login-bar svg').last().trigger('mouseenter');
    cy.contains('li', 'Выход').click();
    cy.get('app-login-bar').contains('Войти').should('be.visible');
  });


  // НЕГАТИВНЫЕ СЦЕНАРИИ

  it('TC-AUTH-05: Неверный SMS-код — состояние failure, сообщение об ошибке', () => {
    cy.visit('/login');
    cy.get('input[type="tel"]').type('9001234567');
    cy.get('button').contains('Отправить код').click();

    cy.get('input.code').type('000000');
    cy.get('button').contains('Войти').click();

    cy.get('section h3')
      .should('be.visible')
      .and('not.contain', 'Введите ваш номер телефона');
    cy.url().should('include', '/login');
  });

  it('TC-AUTH-06: Некорректный формат телефона — кнопка «Отправить код» неактивна', () => {
    cy.visit('/login');
    cy.get('input[type="tel"]').type('123');
    cy.get('button').contains('Отправить код').should('be.disabled');
  });

 it('TC-AUTH-07: Вход заблокированного пользователя — ошибка показывается 10 секунд', () => {
    // Заблокированный пользователь +79009000000 — пароль известен из seed
    cy.visit('/login');
    cy.get('input[type="tel"]').type('9009000000');
    cy.get('button').contains('Отправить код').click();
 
    cy.get('input.code').should('be.visible').type('123456');
     cy.xpath("(//button[contains(text(),'Войти')])[3]").click();
    cy.get('section h3').should('contain', 'заблокирован');
  });

  it('TC-AUTH-08: Защищённый маршрут /new без авторизации — редирект на /login', () => {
    cy.visit('/new');
    cy.url().should('include', '/login');
  });
});