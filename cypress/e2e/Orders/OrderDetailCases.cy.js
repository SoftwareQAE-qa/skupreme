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

  it('ORD_DETAIL_05 | Update order fulfillment Status as pending shipment from order details page', function () {
    // const { product, manualOrder: orderConfig, existingCustomer } = this.testData;
    // ordersPage.openCreateOrderModal()
    // manualOrder.selectExistingCustomer(existingCustomer.name)
    // manualOrder.addLineItem(product.sku, orderConfig.quantity)
    // manualOrder.saveOrder()
    // cy.verifyToast('Order created successfully')
    // manualOrder.assertCreateShippingLabelDrawer()

    ordersPage.openOrderDetail({ index: 0 })

    cy.get('@orderId').then(orderId => {
      orderDetailPage.updateFulfillmentStatus('Pending Shipment')
      ordersPage.visitPendingShipment()
      ordersPage.searchOrder(orderId)
    })
  })
  it('ORD_DETAIL_06 | Update order fulfillment Status as canceled from order details page', function () {
    ordersPage.openOrderDetail({ index: 0 })
    cy.get('@orderId').then(orderId => {
      orderDetailPage.updateFulfillmentStatus('Canceled')
      ordersPage.visitCanceledOrders()
      ordersPage.searchOrder(orderId)
    })
  })
  it('ORD_DETAIL_07 | Update order fulfillment Status as Returned from order details page', function () {
    ordersPage.openOrderDetail({ index: 0 })
    cy.get('@orderId').then(orderId => {
      orderDetailPage.updateFulfillmentStatus('Returns')
      ordersPage.visitReturnedOrders()
      ordersPage.searchOrder(orderId)
    })
  })
  it('ORD_DETAIL_08 | Update order fulfillment Status as Shipped from order details page', function () {
    ordersPage.openOrderDetail({ index: 0 })
    cy.get('@orderId').then(orderId => {
      orderDetailPage.updateFulfillmentStatus('Shipped')
      orderDetailPage.validateOrderStatus('Shipped')
    })
  })
})
