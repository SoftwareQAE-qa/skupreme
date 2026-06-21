import { OrdersPage } from '../../PageObject/OrdersPage';
import { ManualOrderModal } from '../../PageObject/ManualOrderModal';
import { OrderDetailPage } from '../../PageObject/OrderDetailPage';

describe('SKUPREME - Create Manual Order', () => {
  const ordersPage = new OrdersPage()
  const manualOrder = new ManualOrderModal()
  const orderDetailPage = new OrderDetailPage

  beforeEach(() => {
    cy.fixture('testData').as('testData')
    ordersPage.visitPendingShipment();
    ordersPage.assertPageLoaded().selectD2COrders();
  })

  it('ORD_DETAIL_01 | Validate order details page for Pending Shipment Orders', function () {
    ordersPage.visitPendingShipment()
    ordersPage.assertPageLoaded().selectD2COrders()
    ordersPage.openOrderDetail({ index: 0 })
    orderDetailPage.validateOrderDetail()
  })

  it('ORD_DETAIL_02 | Validate fulfill order option on order details page for Pending Shipment Orders', function () {
    const { product, manualOrder: orderConfig, existingCustomer } = this.testData;

    ordersPage.openCreateOrderModal()
    manualOrder.selectExistingCustomer(existingCustomer.name)
    manualOrder.addLineItem(product.sku, orderConfig.quantity)
    manualOrder.saveOrder()
    cy.verifyToast('Order created successfully')
    manualOrder.assertCreateShippingLabelDrawer()

    cy.get('@orderId').then(orderId => {
      ordersPage.openOrderDetail({ orderNumber: orderId })
      orderDetailPage.fulfillOrder()
      cy.verifyToast('Order fulfillment initiated successfully')
    })
    cy.wait(5000) //wait for fulfillment process to apply on order
  })

  it('ORD_DETAIL_03 | Validate Cancel fulfillment option on order details page for Pending Shipment Orders', function () {
    ordersPage.visitPendingFulfillment()
    ordersPage.openOrderDetail({ index: 0 })
    orderDetailPage.cancelFulfillment('Testing Cancel fulfillment')
  })

  it('ORD_DETAIL_04 | Validate Create Copy option on order details page for Pending Shipment Orders', function () {
    ordersPage.visitPendingShipment()
    ordersPage.assertPageLoaded().selectD2COrders()
    ordersPage.openOrderDetail({ index: 0 })
    const marketOrderId = 'COPY' + Cypress.faker.string.numeric(5)
    orderDetailPage.createCopy(marketOrderId)
    ordersPage.searchOrder(marketOrderId)
  })
})
