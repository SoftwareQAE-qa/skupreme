import { Orders, Routes } from '../support/selectors';

export class OrdersPage {
  visitPendingFulfillment() {
    cy.visit(Routes.pendingFulfillment);
    return this;
  }

  visitPendingShipment() {
    cy.visit(Routes.pendingShipment);
    return this;
  }

  assertPageLoaded() {
    cy.contains('Orders', { timeout: 30000 }).should('be.visible');
    return this;
  }

  selectD2COrders() {
    cy.contains('button, a, [role="tab"]', /d2c orders/i).click();
    return this;
  }

  selectStatusTab(status) {
    cy.contains('button, a, [role="tab"]', new RegExp(status, 'i')).click();
    return this;
  }

  openCreateOrderModal() {
    cy.contains('button', /\+?\s*order/i, { timeout: 30000 }).click({ force: true });
    cy.contains(/manual order/i, { timeout: 30000 }).should('be.visible');
    return this;
  }

  openOrderById(orderId) {
    cy.contains('tr', orderId, { timeout: 60000 }).should('be.visible').click({ force: true });
    cy.url({ timeout: 30000 }).should('match', /\/app\/orders\/(?!list)/);
    return this;
  }

  openFirstAvailableOrder() {
    cy.contains('button, a, [role="button"]', /view.*approve/i, { timeout: 30000 })
      .first()
      .click({ force: true });
    cy.url({ timeout: 30000 }).should('match', /\/app\/orders\/(?!list)/);
    return this;
  }

  openFirstFulfillableOrder() {
    cy.contains('tr', /OID-|ORD-/, { timeout: 30000 })
      .filter((_, row) => !/OOS/i.test(row.textContent || ''))
      .first()
      .then(($row) => {
        const orderId =
          ($row.find('td').first().text().match(/\b(?:OID|ORD)-\d+\b/) || [])[0] ||
          ($row.text().match(/\b(?:OID|ORD)-\d+\b/) || [])[0];
        expect(orderId, 'order id').to.exist;
        cy.wrap(orderId).as('fulfilledOrderId');

        cy.wrap($row)
          .find('button, a, [role="button"]')
          .contains(/view.*approve/i)
          .click({ force: true });
      });

    cy.contains(Orders.createShippingLabelDrawer, { timeout: 30000 }).should('be.visible');
    return this;
  }

  openFulfilledOrderDrawer() {
    cy.get('@fulfilledOrderId').then((orderId) => {
      this.selectStatusTab('Pending Fulfillment');
      cy.contains('tr', orderId, { timeout: 60000 }).should('be.visible');
      cy.contains('tr', orderId)
        .find('button, a, [role="button"]')
        .contains(/view.*approve/i)
        .click({ force: true });
    });

    cy.contains(Orders.createShippingLabelDrawer, { timeout: 30000 }).should('be.visible');
    return this;
  }

  assertFulfillSuccess() {
    cy.contains(/order fulfillment initiated successfully/i, { timeout: 60000 }).should(
      'be.visible'
    );
    return this;
  }

  assertOrderInList(orderId) {
    cy.contains(orderId, { timeout: 60000 }).should('be.visible');
    return this;
  }

  openShippingLabelDrawer() {
    cy.get('body').then(($body) => {
      if (Orders.createShippingLabelDrawer.test($body.text())) {
        cy.contains(Orders.createShippingLabelDrawer, { timeout: 30000 }).should('be.visible');
        return;
      }

      cy.contains('button', Orders.createShippingLabelDrawer, { timeout: 30000 }).click({
        force: true,
      });
      cy.contains(Orders.createShippingLabelDrawer, { timeout: 30000 }).should('be.visible');
    });
    return this;
  }

  completeAddressValidation() {
    cy.contains(Orders.addressValidationModal, { timeout: 30000 }).should('be.visible');

    cy.get('body').then(($body) => {
      if (/suggested address/i.test($body.text())) {
        cy.get('button')
          .filter((_, el) => /^use$/i.test((el.textContent || '').trim()))
          .first()
          .click({ force: true });
      }
    });

    cy.get('body').then(($body) => {
      if (/invalid zip code/i.test($body.text())) {
        cy.contains(/manual override/i)
          .closest('div')
          .find('input[type="checkbox"], [class*="Switch"], [class*="switch"], [role="switch"]')
          .first()
          .click({ force: true });
      }
    });

    cy.get('button')
      .filter((_, el) => /^save$/i.test((el.textContent || '').trim()))
      .filter(':visible')
      .last()
      .click({ force: true });

    cy.contains(Orders.addressValidationModal, { timeout: 60000 }).should('not.exist');
    return this;
  }

  selectShipFromIfNeeded(warehouseName) {
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      if (bodyText.includes(warehouseName)) {
        return;
      }

      cy.contains(/ship from/i, { timeout: 10000 })
        .closest('div')
        .find('input, [class*="Select"], [role="combobox"]')
        .first()
        .click({ force: true });

      cy.contains(warehouseName, { timeout: 10000 }).click({ force: true });
    });
    return this;
  }

  validateAddressIfNeeded(warehouseName) {
    cy.contains(Orders.createShippingLabelDrawer, { timeout: 30000 }).should('be.visible');

    if (warehouseName) {
      this.selectShipFromIfNeeded(warehouseName);
    }

    cy.contains('button', Orders.fulfillOrderButton).then(($btn) => {
      if ($btn.is(':disabled')) {
        cy.contains('button', Orders.validateAddressButton).click({ force: true });
        this.completeAddressValidation();
      }
    });

    cy.contains('button', Orders.fulfillOrderButton, { timeout: 60000 }).should('not.be.disabled');
    return this;
  }

  fulfillOrder(warehouseName) {
    this.openShippingLabelDrawer();
    this.validateAddressIfNeeded(warehouseName);

    cy.contains('button', Orders.fulfillOrderButton, { timeout: 30000 })
      .should('not.be.disabled')
      .click({ force: true });

    return this;
  }

  assertOrderStatus(expectedStatus) {
    cy.contains(new RegExp(expectedStatus, 'i'), { timeout: 60000 }).should('be.visible');
    return this;
  }

  assertOrderWorkflowVisible() {
    cy.contains(/pending fulfillment|pending shipment|shipped|delivered|workflow/i, {
      timeout: 30000,
    }).should('be.visible');
    return this;
  }

  openShippingDetailsTab() {
    cy.contains('button, a, [role="tab"]', Orders.shippingDetailsTab).click();
    return this;
  }

  openLabelHistoryTab() {
    cy.contains('button, a, [role="tab"]', Orders.labelHistoryTab).click();
    return this;
  }

  assertLabelGenerated() {
    cy.contains(/usps|ups|fedex|ground|label/i, { timeout: 120000 }).should('be.visible');
    return this;
  }

  assertInventorySource(warehouseName) {
    this.openShippingDetailsTab();
    cy.contains(/inventory source/i).parent().should('contain.text', warehouseName);
    return this;
  }

  assertNoOosWarning(orderId) {
    cy.contains(orderId)
      .parents('tr, [class*="row"]')
      .first()
      .should('not.contain.text', 'OOS');
    return this;
  }
}
