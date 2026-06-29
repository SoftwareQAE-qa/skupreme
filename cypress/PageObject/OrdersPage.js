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
    cy.get('[title="D2C Orders"]').should('be.visible').and('contain.text', 'D2C Orders').click();
    return this;
  }
  gotoPendingFulfillmentTab() {
    cy.get('[data-node-key="Pending Fulfillment"]').contains('Pending Fulfillment').scrollIntoView().should('be.visible').click()
    cy.get('.ant-table-row ').should('be.visible') //order rows are visible
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
    cy.get('input[placeholder="Order ID, Tracking Number..."]').should('be.visible').clear().type(keyword)
    cy.get('.ant-table-row ').contains(keyword).scrollIntoView().should('be.visible')
  }
  openOrderDetail({ index, orderNumber, orderID } = {}) {
    let locator = 'a[href*="/app/orders/"]';
    cy.wait(1000)
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
    // Match the Order ID from the order link text only (e.g. "OID-7701").
    // Note: a row's textContent concatenates all cells with no separators,
    // so matching against the whole row would merge the ID with the next cell.
    const orderIdPattern = /(?:OID|ORD)-\d+/;
    cy.get('.ant-table-tbody .ant-table-row', { timeout: 60000 })
      .should('have.length.greaterThan', 0)
      .then(($rows) => {
        // jQuery filter (accepts a callback, unlike Cypress's .filter()).
        // Keep only non-OOS rows whose Order ID looks like OID-#### / ORD-####.
        const $eligible = $rows.filter((_, row) => {
          const rowText = row.textContent || '';
          const link = row.querySelector('a[href*="/app/orders/"]');
          const linkText = (link && link.textContent) || '';
          return !/OOS/i.test(rowText) && orderIdPattern.test(linkText);
        });
        expect($eligible.length, 'eligible OID-/ORD- rows').to.be.greaterThan(index);

        const $row = $eligible.eq(index);
        const linkText = ($row.find('a[href*="/app/orders/"]').text()) || '';
        const orderId = (linkText.match(orderIdPattern) || [])[0];
        expect(orderId, 'order id').to.exist;
        cy.wrap(orderId).as('orderId');
        cy.wrap(orderId).as('fulfilledOrderId');

        cy.wrap($row).within(() => {
          cy.contains('button', 'View & Approve')
            .scrollIntoView()
            .should('be.visible')
            .click({ force: true });
        });
      });
    cy.contains(Orders.createShippingLabelDrawer, { timeout: 30000 }).should('be.visible'); //Create Shipping Label section should be open
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