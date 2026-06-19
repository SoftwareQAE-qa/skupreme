export class LoginPage {
  visit() {
    cy.visit('/login');
    return this;
  }

  login(email, password) {
    cy.get('input[placeholder="Email Address"]').clear().type(email);
    cy.get('input[placeholder="Password"]').clear().type(password);
    cy.contains('button', 'Login').click();
    return this;
  }

  assertLoggedIn() {
    cy.url({ timeout: 60000 }).should('include', '/app');
    return this;
  }
}
