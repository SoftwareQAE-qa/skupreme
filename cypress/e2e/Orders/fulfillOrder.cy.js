import { OrdersPage } from '../../PageObject/OrdersPage';

describe('SKUPREME - Fulfill Order', () => {
  const ordersPage = new OrdersPage();

  beforeEach(() => {
    cy.fixture('testData').as('testData');
  });

  it('FUL-01 | should open order details from Pending Shipment list', () => {
    ordersPage.visitPendingShipment();
    ordersPage.assertPageLoaded().selectD2COrders();
    ordersPage.openFirstAvailableOrder();
    cy.contains(/pending shipment|pending fulfillment|summary/i).should('be.visible');
  });

  it('FUL-02 | should fulfill order and verify shipping label history', function () {
    const { product, storageProvider } = this.testData;

    ordersPage.visitPendingShipment();
    ordersPage.assertPageLoaded().selectD2COrders();
    ordersPage.openFirstFulfillableOrder();

    ordersPage.fulfillOrder(storageProvider.name);
    ordersPage.assertFulfillSuccess();
    ordersPage.openFulfilledOrderDrawer();

    cy.contains(product.sku, { matchCase: false }).should('be.visible');
    ordersPage.assertLabelGenerated();
  });

  it('FUL-03 | should display order workflow on Pending Fulfillment orders', () => {
    ordersPage.visitPendingFulfillment();
    ordersPage.assertPageLoaded().selectD2COrders();
    ordersPage.openFirstAvailableOrder();
    ordersPage.assertOrderWorkflowVisible();
  });
});
