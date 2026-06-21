import './commands';
import 'cypress-if'
import { fa, faker } from '@faker-js/faker';
Cypress.faker = faker;

Cypress.on('uncaught:exception', (err) => {
  const message = JSON.stringify(err?.message ?? err);

  if (
    message.includes('cancel-axios-token-duplicate') ||
    message.includes('Request Cancelled')
  ) {
    return false;
  }

  return true;
});

beforeEach(function () {
  const specName = Cypress.spec?.relative || '';
  if (!specName.includes('explore/')) {
    cy.login();
  }
});

// Hide fetch/XHR requests
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');

  app.document.head.appendChild(style);
}

//Handling exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Handle specific errors
  if (
    err.message?.includes(`Error: {"code":"cancel-axios-token-duplicate","error":"Request Cancelled","status":"450"}`) ||
    err.message?.includes(`TypeError: Cannot read properties of null (reading 'style')`)
  ) {
    // Returning false here prevents Cypress from failing the test
    return false;
  }
  // Let other errors fail the test if true
  return true;
})