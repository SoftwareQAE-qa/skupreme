import { OrdersPage } from '../../PageObject/OrdersPage';
import { ManualOrderModal } from '../../PageObject/ManualOrderModal';

describe('SKUPREME - Create Manual Order', () => {
  const ordersPage = new OrdersPage();
  const manualOrder = new ManualOrderModal();

  beforeEach(() => {
    cy.fixture('testData').as('testData');
    ordersPage.visitPendingShipment();
    ordersPage.assertPageLoaded().selectD2COrders();
  });

  it('ORD-01 | should create an order for a new customer by setting a new address', function () {
    const { product, pasteAddress, manualOrder: orderConfig } = this.testData;

    ordersPage.openCreateOrderModal();
    manualOrder.assertOpen();
    manualOrder.fillAddressViaPaste(pasteAddress);
    manualOrder.addLineItem(product.sku, orderConfig.quantity);
    manualOrder.saveOrder();
    manualOrder.assertCreateShippingLabelDrawer();
  });

  it('ORD-02 | should create an order for an existing customer', function () {
    const { product, manualOrder: orderConfig, existingCustomer } = this.testData;

    ordersPage.openCreateOrderModal();
    manualOrder.assertOpen();
    manualOrder.selectExistingCustomer(existingCustomer.name);
    manualOrder.addLineItem(product.sku, orderConfig.quantity);
    manualOrder.saveOrder();
    manualOrder.assertCreateShippingLabelDrawer();
  });
});
