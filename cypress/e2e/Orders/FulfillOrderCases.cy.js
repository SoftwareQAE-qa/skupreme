import { OrdersPage } from '../../PageObject/OrdersPage';

describe('SKUPREME - Fulfill Order', () => {
  const ordersPage = new OrdersPage();

  beforeEach(() => {
    cy.fixture('testData').as('testData');
  });

  it('ORD_FUL_01 | Initiate order fulfillment process on a pending shipment order', function () {
    const { product, storageProvider } = this.testData;

    ordersPage.visitPendingShipment();
    ordersPage.assertPageLoaded().selectD2COrders();
    ordersPage.clickViewApprove(0);

    ordersPage.fulfillOrder(storageProvider.name);
    cy.verifyToast('Order fulfillment initiated successfully');
    cy.wait(10000)
    ordersPage.gotoPendingFulfillmentTab()
    cy.get('@fulfilledOrderId').then(fulfilledOrderId => {
      ordersPage.searchOrder(fulfilledOrderId)
    })
  })
})
