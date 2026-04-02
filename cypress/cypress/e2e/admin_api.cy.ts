

// Панель администратора

describe('Панель администратора', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('TC-ADM-01: Администратор видит иконку-ключ (ссылку на /admin) в шапке', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').should('be.visible');
  });

  it('TC-ADM-02: Обычный пользователь НЕ видит ссылку на /admin', () => {
    cy.loginAsVasily();
    cy.visit('/');
    cy.get('a[href="/admin"]').should('not.exist');
  });

  it('TC-ADM-03: Прямой переход на /admin без прав — редирект на главную', () => {
    cy.loginAsVasily();
    cy.visit('/admin');
    cy.url().should('not.include', '/admin');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('TC-ADM-04: Панель отображает статистику платформы', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').should('be.visible').click();
    cy.url().should('include', '/admin');

    cy.get('.tabs button').contains('Статистика').should('have.class', 'active');
    cy.get('.stats-grid').should('be.visible');
    cy.get('.stat-card').should('have.length', 5);
    cy.get('.stat-card .stat-value').first().invoke('text').then((text) => {
      expect(parseInt(text)).to.be.greaterThan(0);
    });
  });

  it('TC-ADM-05: Список пользователей отображается в таблице', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').click();

    cy.get('.tabs button').contains('Пользователи').click();
    cy.get('.table table').should('be.visible');
    cy.get('.table tbody tr').should('have.length.at.least', 1);
  });

  it('TC-ADM-06: Поиск пользователя по телефону', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').click();

    cy.get('.tabs button').contains('Пользователи').click();
    cy.get('.section-header input[type="text"]').type('+79001234567');
    cy.get('.section-header button').contains('Найти').click();

    cy.get('.table tbody tr').should('have.length.at.least', 1);
    cy.get('.table tbody tr td').first().should('contain', '+79001234567');
  });

  it('TC-ADM-07: Блокировка и разблокировка пользователя', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').click();

    cy.get('.tabs button').contains('Пользователи').click();
    cy.contains('tr', '+79009876543').within(() => {
      cy.get('button.btn-small').first().click();
    });

    cy.get('.modal-content').should('be.visible');
    cy.get('.modal-content textarea').type('Тест блокировки');
    cy.get('.modal-actions button').contains('Подтвердить').click();
    cy.contains('tr', '+79009876543').should('have.class', 'blocked');

    cy.contains('tr', '+79009876543').within(() => {
      cy.get('button.btn-small').first().click();
    });
    cy.get('.modal-actions button').contains('Подтвердить').click();
    cy.contains('tr', '+79009876543').should('not.have.class', 'blocked');
  });

  it('TC-ADM-08: Жалобы отображаются и фильтруются по статусу', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').click();

    cy.get('.tabs button').contains('Жалобы').click();
    cy.get('.reports-list').should('be.visible');

    cy.intercept('GET', '/api/admin/reports*').as('filteredReports');
    cy.get('.section-header select').select('На рассмотрении');
    cy.wait('@filteredReports');
    cy.wait(2000)

    cy.get('.report-card').each(($card) => {
      cy.wrap($card).find('.report-status')
        .invoke('attr', 'data-status')
        .should('eq', 'В обработке');
    });
  });

  it('TC-ADM-09: Обработка жалобы — изменение статуса', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').click();

    cy.get('.tabs button').contains('Жалобы').click();
    cy.get('.report-card').first().within(() => {
      cy.get('button').contains('Обработать').click();
    });

    cy.get('.modal-content select').select('Просмотрено');
    cy.get('.modal-content textarea').clear().type('Жалоба проверена');
    cy.get('.modal-actions button').contains('Сохранить').click();
    cy.get('.modal-content').should('not.exist');
  });

  it('TC-ADM-10: SMS-лог отображается', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.get('a[href="/admin"]').click();

    cy.get('.tabs button').contains('SMS').click();
    cy.get('.table table').should('be.visible');
    cy.get('.table tbody tr').should('have.length.at.least', 1);
  });
});

