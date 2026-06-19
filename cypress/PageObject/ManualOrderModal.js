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
  assertOpen() {
    cy.contains(ManualOrder.modalTitle, { timeout: 30000 }).should('be.visible');
    return this;
  }

  openPasteAddress() {
    cy.contains('button', ManualOrder.pasteAddressButton, { timeout: 30000 }).click();
    cy.contains('button', ManualOrder.useThisAddressButton, { timeout: 30000 }).should(
      'be.visible'
    );
    cy.get(ManualOrder.addressSearchInput, { timeout: 30000 })
      .filter(':visible')
      .first()
      .should('be.visible');
    return this;
  }

  typeAddressSearch(searchText) {
    cy.get(ManualOrder.addressSearchInput)
      .filter(':visible')
      .first()
      .clear()
      .type(searchText, { delay: 100 });
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

  searchAndSelectAddress({ searchText, suggestionMatch, expected }) {
    this.typeAddressSearch(searchText);
    this.selectAddressSuggestion(suggestionMatch, expected);
    return this;
  }

  useSelectedAddress() {
    cy.contains('button', ManualOrder.useThisAddressButton, { timeout: 30000 }).click();
    cy.contains('button', ManualOrder.pasteAddressButton, { timeout: 30000 }).should(
      'be.visible'
    );
    return this;
  }

  assertMainFormAddress({ recipient, addressLine1, city, state, zipCode }) {
    if (recipient) {
      cy.contains('label, span', /^Recipient/i)
        .parent()
        .find('input:visible')
        .first()
        .invoke('val')
        .should('match', new RegExp(recipient, 'i'));
    }
    if (addressLine1) {
      cy.contains('label, span', /address line 1/i)
        .parent()
        .find('input:visible')
        .first()
        .should('have.value', addressLine1);
    }
    if (city) {
      cy.contains('label, span', /^City/i)
        .parent()
        .find('input:visible')
        .first()
        .should('have.value', city);
    }
    if (state) {
      cy.contains('label, span', /^State/i)
        .parent()
        .find('input:visible')
        .first()
        .should('have.value', state);
    }
    if (zipCode) {
      cy.contains('label, span', /zip code/i)
        .parent()
        .find('input:visible')
        .first()
        .should('have.value', zipCode);
    }
    return this;
  }

  fillAddressViaPaste(pasteAddress) {
    this.openPasteAddress();
    this.searchAndSelectAddress(pasteAddress);
    this.useSelectedAddress();
    this.assertMainFormAddress(pasteAddress.expected);
    return this;
  }

  customerSearchRoot() {
    return cy
      .get(ManualOrder.searchCustomersInput, { timeout: 30000 })
      .closest('.ui.search, [class*="CustomerSearch"], [class*="search"]');
  }

  openExistingCustomersDropdown() {
    cy.get(ManualOrder.searchCustomersInput, { timeout: 30000 }).click();
    this.customerSearchRoot()
      .find(ManualOrder.customerDropdownResult, { timeout: 30000 })
      .should('have.length.at.least', 1);
    return this;
  }

  selectCustomerFromDropdown(customerName) {
    this.customerSearchRoot()
      .contains(ManualOrder.customerDropdownResult, customerName)
      .first()
      .click({ force: true });

    cy.wrap(customerName).as('selectedCustomerName');
    return this;
  }

  selectExistingCustomer(customerName) {
    this.openExistingCustomersDropdown();
    this.selectCustomerFromDropdown(customerName);

    cy.get('@selectedCustomerName').then((customerName) => {
      cy.contains('label, span', /^Recipient/i)
        .parent()
        .find('input:visible')
        .first()
        .invoke('val')
        .should('match', new RegExp(customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    });

    cy.contains('label, span', /address line 1/i)
      .parent()
      .find('input:visible')
      .first()
      .invoke('val')
      .should('not.be.empty');
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
    cy.contains('button', ManualOrder.saveOrderButton, { timeout: 30000 })
      .should('not.be.disabled')
      .click();
    cy.contains(ManualOrder.successToast, { timeout: 90000 }).should('be.visible');
    return this;
  }

  assertCreateShippingLabelDrawer() {
    cy.contains(ManualOrder.shippingLabelDrawer, { timeout: 30000 }).should('be.visible');
    return this;
  }
}
