describe('SKUPREME - Platform Exploration', () => {
  beforeEach(() => {
    cy.login();
  });

  it('explores catalog, orders, and storage providers after login', () => {
    cy.visit('/app/catalogs/catalog/');
    cy.wait(5000);
    cy.screenshot('01-catalog-products');
    cy.document().then((doc) => {
      const inputs = [...doc.querySelectorAll('input')].map((el) => ({
        type: el.type,
        placeholder: el.placeholder,
        id: el.id,
      }));
      const navLinks = [...doc.querySelectorAll('a')].map((el) => ({
        text: el.innerText.trim(),
        href: el.getAttribute('href'),
      }));
      cy.writeFile('cypress/fixtures/explore-catalog.json', { inputs, navLinks });
    });

    cy.visit('/app/orders/list/Pending%20Shipment/?status=Pending+Shipment');
    cy.wait(5000);
    cy.screenshot('02-orders-pending-shipment');
    cy.document().then((doc) => {
      const buttons = [...doc.querySelectorAll('button')]
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      const tabs = [...doc.querySelectorAll('[role="tab"], button, a')]
        .map((el) => el.innerText.trim())
        .filter((t) => /pending|shipment|fulfillment|d2c|b2b|manual/i.test(t));
      cy.writeFile('cypress/fixtures/explore-orders.json', { buttons, tabs });
    });

    cy.visit('/app/scm/storage-providers');
    cy.wait(5000);
    cy.screenshot('03-storage-providers');
  });

  it('explores manual order creation UI', () => {
    cy.visit('/app/orders/list/Pending%20Shipment/?status=Pending+Shipment');
    cy.wait(5000);

    cy.get('button, a')
      .filter((_, el) => /manual|create|new order/i.test(el.innerText))
      .then(($els) => {
        const matches = [...$els].map((el) => el.innerText.trim());
        cy.writeFile('cypress/fixtures/explore-order-actions.json', matches);
      });

    cy.contains('button, a', /manual order|create order|new order/i, { timeout: 10000 })
      .first()
      .click({ force: true });

    cy.wait(3000);
    cy.screenshot('04-manual-order-modal');
    cy.document().then((doc) => {
      const inputs = [...doc.querySelectorAll('input')].map((el) => ({
        type: el.type,
        placeholder: el.placeholder,
        name: el.name,
      }));
      const buttons = [...doc.querySelectorAll('button')]
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      cy.writeFile('cypress/fixtures/explore-manual-order.json', { inputs, buttons });
    });
  });
});
