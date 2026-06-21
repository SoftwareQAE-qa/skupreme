import { ManualOrder } from '../support/selectors';

const pasteAddressModal = () =>
  cy
    .contains('button', ManualOrder.useThisAddressButton)
    .closest('[role="dialog"], [class*="Modal"], [class*="modal"]');

const pasteAddressField = (labelRegex) =>
  pasteAddressModal()
    .contains('label, span, div', labelRegex)
    .filter(':visible')
    .first()
    .closest('div')
    .find('input:visible')
    .first();

export class ManualOrderModal {

  typeAddressSearch(searchText) {
    cy.get(ManualOrder.addressSearchInput)
      .filter(':visible')
      .first()
      .clear()
      .type(searchText);
    return this;
  }

  waitForAddressSuggestions() {
    cy.get(ManualOrder.addressSuggestionItem, { timeout: 25000 })
      .filter(':visible')
      .should('have.length.at.least', 1);
    return this;
  }

  selectAddressSuggestion(suggestionMatch, expected) {
    this.waitForAddressSuggestions();

    cy.get(ManualOrder.addressSuggestionItem)
      .filter(':visible')
      .then(($suggestions) => {
        const $match = $suggestions.filter((_, el) =>
          (el.textContent || '').includes(suggestionMatch)
        );
        const $target = $match.length ? $match : $suggestions;

        expect($target.length, `address suggestion "${suggestionMatch}"`).to.be.greaterThan(
          0
        );
        cy.wrap($target.first()).click({ force: true });
      });

    this.waitForPasteAddressAutofill(expected);
    return this;
  }

  waitForPasteAddressAutofill(expected) {
    pasteAddressField(/^Name/i).should('not.have.value', '', { timeout: 15000 });

    if (expected.city) {
      pasteAddressField(/^City/i).should('have.value', expected.city, { timeout: 15000 });
    }
    if (expected.state) {
      pasteAddressField(/^State/i).should('have.value', expected.state, { timeout: 15000 });
    }
    if (expected.zipCode) {
      pasteAddressField(/^Zip/i).should('have.value', expected.zipCode, { timeout: 15000 });
    }
    if (expected.addressLine1) {
      pasteAddressModal()
        .find('input:visible')
        .filter((_, el) => el.value === expected.addressLine1)
        .should('exist');
    }

    cy.contains('button', ManualOrder.useThisAddressButton).should('not.be.disabled');
    return this;
  }

  fillAddressViaPaste(pasteAddress) {
    cy.get('[class*="ManaulOrderPopup__PasteAddressButton-sc-"]').should('be.visible').and('contain.text', 'Paste Address').click() //Paste Address
    cy.get('textarea[name="searchAddress"]').should('be.visible').clear().type(pasteAddress.searchText)
    cy.get('.has-suggestions').should('be.visible').children().first().click() //select suggestion
    cy.get('input[placeholder="Name"]').should('be.visible').clear().type(pasteAddress.expected.recipient) //Name
    cy.wait(500)
    this.assertMainFormAddress(pasteAddress.expected);
    cy.get('.modal.active .d-flex .ui.button').contains('Use this address').should('be.visible').click() //Use this address
    return this;
  }
  assertMainFormAddress({ recipient, addressLine1, addressLine2, city, state, zipCode, country }) {
    if (recipient) {
      cy.get('input[placeholder="Name"]', { timeout: 30000 })
        .should('be.visible')
        .invoke('val')
        .should('eq', recipient)
    }

    if (addressLine1) {
      cy.get('input[placeholder="Address"]')
        .should('be.visible')
        .invoke('val')
        .should('eq', addressLine1)
    }

    if (addressLine2) {
      cy.get('input[data-field-value="address_line_two"]').eq(1)
        .should('be.visible')
        .invoke('val')
        .should('eq', addressLine2)
    }

    if (city) {
      cy.get('input[data-field-value="city"]').eq(1)
        .should('be.visible')
        .invoke('val')
        .should('eq', city)
    }

    if (state) {
      cy.get('input[data-field-value="state"]').eq(1)
        .should('be.visible')
        .invoke('val')
        .should('eq', state)
    }

    if (zipCode) {
      cy.get('input[data-field-value="zip_code"]').eq(1)
        .should('be.visible')
        .invoke('val')
        .should('eq', zipCode)
    }

    if (country) {
      cy.get('[data-field-value="country"] .text')
        .should('contain.text', country)
    }

    return this
  }
  selectExistingCustomer(customerName) {
    cy.get('input[placeholder="Name, Customer ID, E-Mail Address"]').should('be.visible').clear().type(customerName).wait(1000)
    cy.get('[class*="CustomerSearchInput__CustomerName-"]').contains(customerName).first().parents('.row').click()
    return this;
  }

  addLineItem(skuOrName, quantity = 1) {
    cy.get(ManualOrder.searchItemsInput, { timeout: 30000 }).clear().type(skuOrName);
    cy.contains(skuOrName, { timeout: 30000 }).click({ force: true });
    cy.contains('tr', skuOrName, { timeout: 30000 }).should('be.visible');

    if (quantity > 1) {
      cy.contains('tr', skuOrName).find('input').last().clear().type(String(quantity));
    }
    return this;
  }

  saveOrder() {
    cy.intercept('POST', '**/v1/orders').as('saveOrder')
    cy.contains('button', ManualOrder.saveOrderButton, { timeout: 30000 }).should('not.be.disabled').click()

    cy.wait('@saveOrder').then(({ request, response }) => {
      expect(response.statusCode).to.eq(200)
      const orderId = request.body.order_id
      cy.wrap(orderId, { log: true }).as('orderId')
      cy.log(`Order ID: ${orderId}`)
    })
    return this
  }

  assertCreateShippingLabelDrawer() {
    cy.contains('Create Shipping Label', { timeout: 30000 }).should('be.visible');
    return this;
  }
}
