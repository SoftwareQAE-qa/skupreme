import { Orders, Routes } from '../support/selectors';

export class OrdersPage {
  visitPendingShipment() {
    cy.visit(Routes.pendingShipment);
    return this;
  }
  visitPendingFulfillment() {
    cy.visit(Routes.pendingFulfillment);
    return this;
  }
  visitShippedOrders() {
    cy.visit('/app/orders/list/Shipped/')
    return this
  }
  visitCanceledOrders() {
    cy.visit('/app/orders/list/Canceled/?status=Canceled')
    return this
  }
  visitReturnedOrders() {
    cy.visit('/app/orders/list/Returns/?tab=all')
    return this
  }
  assertPageLoaded() {
    cy.contains('Orders', { timeout: 30000 }).should('be.visible');
    return this;
  }

  selectD2COrders() {
    cy.contains('button, a, [role="tab"]', /d2c orders/i).click();
    return this;
  }
  gotoPendingFulfillmentTab() {
    cy.get('.pointing.menu .item').contains('Pending Fulfillment').scrollIntoView().should('be.visible').click()
    cy.get('[class*="List__OrderTableRow-"]').should('be.visible') //order rows are visible
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
  searchOrder(keyword) {
    cy.get('input[placeholder="Order ID, Tracking Number"]').should('be.visible').clear().type(keyword)
    cy.get('[class*="List__OrderTableRow-"]').contains(keyword).scrollIntoView().should('be.visible')
  }
  openOrderDetail({ index, orderNumber, orderID } = {}) {
    let locator = 'a[href*="/app/orders/"]';
    if (orderID) {
      cy.get(`${locator}[href*="${orderID}"]`).should('be.visible').then($link => {
        const href = $link.attr('href');
        cy.wrap(href).as('orderHref');
        cy.wrap($link).scrollIntoView().click({ force: true });
      });
    }

    else if (orderNumber) {
      cy.contains(locator, orderNumber).should('be.visible').then($link => {
        const href = $link.attr('href');
        cy.wrap(href).as('orderHref');
        cy.wrap($link).scrollIntoView().click({ force: true });
      });
    }

    else {
      cy.get(locator).eq(index || 0).then($link => {
        const href = $link.attr('href');
        cy.wrap(href).as('orderHref');
        cy.wrap($link).scrollIntoView().click({ force: true });
      });
    }

    cy.get('@orderHref').then(href => {
      cy.url({ timeout: 30000 }).should('include', href);
    });
    cy.get('[class*="Header__StatusContainer-"]').contains('Pending Shipment').scrollIntoView().should('be.visible')
    cy.get('[class*="Details__Column-sc-"] [class*="TextCopyToClipboard__TextToCopy-sc"]').invoke('text').as('orderId')
    return this;
  }

  clickViewApprove(index = 0) {
    cy.contains('tr', /OID-|ORD-/, { timeout: 30000 })
      .filter((_, row) => !/OOS/i.test(row.textContent || '')).eq(index).then(($row) => {
        const orderId =
          ($row.find('td').first().text().match(/\b(?:OID|ORD)-\d+\b/) || [])[0] ||
          ($row.text().match(/\b(?:OID|ORD)-\d+\b/) || [])[0];
        expect(orderId, 'order id').to.exist;
        cy.wrap(orderId).as('fulfilledOrderId');

        cy.wrap($row).find('.right .ui.button').should('contain.text', 'View & Approve').scrollIntoView().click({ force: true })
      })
    cy.contains(Orders.createShippingLabelDrawer, { timeout: 30000 }).should('be.visible') //Create Shipping Label section should be open
    return this;
  }
  assertOrderInList(orderId) {
    cy.contains(orderId, { timeout: 60000 }).should('be.visible');
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

  validateAddressIfNeeded(warehouseName) { //Enable Manual Override 
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
    this.validateAddressIfNeeded(warehouseName);

    cy.contains('button', Orders.fulfillOrderButton, { timeout: 30000 })
      .should('not.be.disabled')
      .click({ force: true });

    return this;
  }
  assertOrderWorkflowVisible() {
    cy.contains(/pending fulfillment|pending shipment|shipped|delivered|workflow/i, {
      timeout: 30000,
    }).should('be.visible');
    return this;
  }

}