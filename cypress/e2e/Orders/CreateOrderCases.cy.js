import { OrdersPage } from '../../PageObject/OrdersPage';
import { ManualOrderModal } from '../../PageObject/ManualOrderModal';

describe('SKUPREME - Create Manual Order', () => {
  const ordersPage = new OrdersPage();
  const manualOrder = new ManualOrderModal();

  beforeEach(() => {
    cy.fixture('testData').as('testData');
    ordersPage.visitPendingShipment();
    ordersPage.assertPageLoaded().selectD2COrders();
  })

  it('ORDER_01 | Create an order for a new customer by setting a new address', function () {
    const { product, pasteAddress, manualOrder: orderConfig } = this.testData;

    ordersPage.openCreateOrderModal();
    manualOrder.fillAddressViaPaste(pasteAddress);
    manualOrder.addLineItem(product.sku, orderConfig.quantity);
    manualOrder.saveOrder();
    cy.verifyToast('Order created successfully')
    manualOrder.assertCreateShippingLabelDrawer();
  })

  it('ORDER_02 | Create an order for an existing customer', function () {
    const { product, manualOrder: orderConfig, existingCustomer } = this.testData;

    ordersPage.openCreateOrderModal();
    manualOrder.selectExistingCustomer(existingCustomer.name);
    manualOrder.addLineItem(product.sku, orderConfig.quantity);
    manualOrder.saveOrder();
    cy.verifyToast('Order created successfully')
    manualOrder.assertCreateShippingLabelDrawer();
  })
})
