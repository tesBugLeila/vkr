
// Команда loginAsVasily — из cypress/support/commands.ts

describe('Объявления — публикация и просмотр', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ПОЗИТИВНЫЕ СЦЕНАРИИ
  

  it('TC-LIST-01: Главная страница загружается и показывает список объявлений', () => {
    cy.visit('/');
    cy.get('app-post').should('exist');
  });

  it('TC-LIST-02: Успешная публикация объявления', () => {
    cy.loginAsVasily();
    cy.visit('/');

    cy.get('.user-actions button').contains('Подать объявление').should('be.visible').click();
    cy.url().should('include', '/new');

    cy.get('input[formControlName="title"]').type('Домашние пироги с капустой');
    cy.get('textarea[formControlName="description"]').type('Только что из печи, тесто дрожжевое — длинное описание');
    cy.get('input[formControlName="price"]').clear().type('250');
    cy.get('select[formControlName="category"]').select('Выпечка');
    cy.get('input[formControlName="contact"]').clear().type('+79001234567');
    cy.get('input[formControlName="district"]').type('Центр');

    cy.get('input#photoUpload').selectFile('cypress/fixtures/test-photo.jpg', { force: true });

    cy.get('button[type="submit"]').should('not.be.disabled').click();

    cy.url().should('match', /\/post\/\w+/);
    cy.get('h3').should('contain', 'Домашние пироги с капустой');
  });

  it('TC-LIST-03: Детальная страница объявления открывается', () => {
    cy.visit('/');
    cy.get('app-post section.clickable').first().click();

    cy.url().should('match', /\/post\/\w+/);
    cy.get('h3').should('be.visible');
    cy.get('.price').should('be.visible');
    cy.get('.photo-section').should('be.visible');
  });

  it('TC-LIST-04: Авторизованный пользователь видит контакт на странице поста', () => {
    cy.loginAsVasily();
    cy.visit('/');
    cy.get('app-post section.clickable').first().click();

    cy.url().should('match', /\/post\/\w+/);
    cy.get('.contact-value').should('be.visible');
    cy.get('app-phone').should('be.visible');
  });

  it('TC-LIST-05: Неавторизованный пользователь — блок контакта отсутствует в карточке', () => {
    cy.visit('/');
    cy.get('app-post section').first().within(() => {
      cy.get('.contact-meta').should('not.exist');
    });
  });

  it('TC-LIST-06: Фильтрация по категории работает', () => {
    cy.visit('/');
    cy.intercept('GET', '/api/posts*').as('filteredPosts');
    cy.get('app-search-bar select').first().select('Мясо');
    cy.wait('@filteredPosts');

    cy.get('app-post').should('have.length.greaterThan', 0);
    cy.get('.category').should('contain', 'Мясо');
  });

  it('TC-LIST-07: Профиль показывает объявления пользователя', () => {
    cy.loginAsVasily();
    cy.visit('/profile');
    cy.get('.tabs button').contains('Мои объявления').click();
    cy.get('.posts-list app-post').should('have.length.greaterThan', 0);
  });

  it('TC-LIST-08: Удаление своего объявления через форму редактирования', () => {
    cy.loginAsVasily();

    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: { phone: '+79001234567', password: '123456' },
    }).then((loginResp) => {
      const token = loginResp.body.token;

      cy.request({
        method: 'POST',
        url: '/api/posts',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          title: 'Тест удаления',
          description: 'Тестовое объявление для удаления через тест Cypress',
          price: 10,
          category: 'Другое',
          district: 'Тест',
          contact: '+79001234567',
          notifyNeighbors: false,
        },
      }).then((postResp) => {
        const postId = postResp.body.post.id;

        cy.visit(`/post/${postId}`);
        cy.get('.owner-actions a').contains('Редактировать').click();
        cy.url().should('include', `/edit/${postId}`);

        cy.get('button.delete').first().click();
        cy.get('.delete-confirm').should('be.visible');
        cy.get('.delete-confirm button.delete').click();

        cy.url().should('eq', Cypress.config('baseUrl') + '/');
      });
    });
  });

 
  // НЕГАТИВНЫЕ СЦЕНАРИИ — ВАЛИДАЦИЯ
  

  it('TC-LIST-09: Форма не отправляется без обязательных полей — кнопка задизейблена', () => {
    cy.loginAsVasily();
    cy.visit('/');
    cy.get('.user-actions button').contains('Подать объявление').click();
    cy.url().should('include', '/new');

    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('input[formControlName="title"]').type('АБ').blur();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('label small').should('contain', 'Минимум 3 символа');
  });

  it('TC-LIST-10: Описание требует минимум 10 символов', () => {
    cy.loginAsVasily();
    cy.visit('/');
    cy.get('.user-actions button').contains('Подать объявление').click();
    cy.url().should('include', '/new');

    cy.get('textarea[formControlName="description"]').type('Мало').blur();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('label small').should('contain', 'Минимум 10 символов');
  });
});