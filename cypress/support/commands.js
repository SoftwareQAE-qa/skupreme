const { USER_EMAIL, USER_PASSWORD } = require('../../cypress-env.json');

Cypress.Commands.add('login', (email = USER_EMAIL, password = USER_PASSWORD) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[placeholder="Email Address"]').clear().type(email, { log: false });
    cy.get('input[placeholder="Password"]').clear().type(password, { log: false });
    cy.contains('button', 'Login').click();
    cy.url({ timeout: 60000 }).should('include', '/app');
    cy.visit('/app/catalogs/catalog/');
    cy.contains('Products', { timeout: 60000 }).should('be.visible');
  });
});

Cypress.Commands.add('loginFresh', (email = USER_EMAIL, password = USER_PASSWORD) => {
  cy.visit('/login');
  cy.get('input[placeholder="Email Address"]').clear().type(email, { log: false });
  cy.get('input[placeholder="Password"]').clear().type(password, { log: false });
  cy.contains('button', 'Login').click();
  cy.url({ timeout: 60000 }).should('include', '/app');
});
