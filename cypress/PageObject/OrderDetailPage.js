import { Orders, Routes } from '../support/selectors';

export class OrderDetailPage {
  validateOrderDetail() {
    cy.url({ timeout: 30000 }).should('include', '/app/orders/')

    // Wait until page is loaded
    cy.contains('strong', /^Orders$/, { timeout: 30000 }).should('be.visible')
    cy.contains('b', /^Pending Shipment$/, { timeout: 30000 }).should('be.visible')
    cy.contains('a.item:visible', /^Summary$/, { timeout: 30000 }).should('have.class', 'active')
    cy.contains('span:visible', /^Marketplace Order ID:$/, { timeout: 30000 }).should('be.visible')
    cy.contains('a.item:visible', /^Order Contents$/, { timeout: 30000 }).should('have.class', 'active')
    cy.get('table:visible tbody tr', { timeout: 30000 }).should('have.length.greaterThan', 0)

    // Status tracker
    cy.contains('b', /^Pending Shipment$/).should('be.visible')
    cy.contains('b', /^Pending Fulfillment$/).should('be.visible')
    cy.contains('b', /^Shipped \(In Transit\)$/).should('be.visible')
    cy.contains('b', /^Delivered$/).should('be.visible')

    // Total items
    cy.contains('div, span', /^Total Items:\s*$/).should('be.visible')

    // Action dropdown DOM validation
    cy.get('[role="listbox"]', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .within(() => {
        cy.get('.menu').should('exist')

        cy.root().then($dropdown => {
          const dropdownText = $dropdown.text()
          const pageText = Cypress.$('body').text()
          const hasInvalidAddress = pageText.includes('Invalid Address')

          if (!hasInvalidAddress) {
            expect(dropdownText).to.include('Fulfill Order')
          }

          expect(dropdownText).to.include('Create Copy')
          expect(dropdownText).to.include('Update Fulfillment Status')
          expect(dropdownText).to.include('Cancel Order')
        })
      })

    // Summary section
    cy.contains('a.item:visible', /^Summary$/).should('have.class', 'active')
    cy.contains('a.item:visible', /^Fulfillment Details$/).should('be.visible')

    cy.contains('span:visible', /^Marketplace Order ID:$/).should('be.visible')
    cy.contains('span:visible', /^Purchase Date:$/).should('be.visible')
    cy.contains('span:visible', /^Ship By:$/).should('be.visible')
    cy.contains('span:visible', /^Deliver By:$/).should('be.visible')

    // Customer section
    cy.contains('a.item:visible', /^Customer Details$/).should('have.class', 'active')
    cy.contains('a.item:visible', /^Comments$/).should('be.visible')
    cy.contains('a.item:visible', /^Sales Proceeds$/).should('be.visible')

    cy.contains('span:visible', /^Note$/).should('be.visible')
    cy.contains('span:visible', /^E-Mail:$/).should('be.visible')
    cy.contains('span:visible', /^Phone:$/).should('be.visible')

    cy.get('body').then($body => {
      if ($body.text().includes('Invalid Address')) {
        cy.contains('span:visible', /^Invalid Address$/).should('be.visible')
      }
    })

    // Order tabs
    cy.contains('a.item:visible', /^Order Contents$/).should('have.class', 'active')
    cy.contains('a.item:visible', /^Shipping Details$/).should('be.visible')
    cy.contains('a.item:visible', /^Logs$/).should('be.visible')

    // Table
    cy.get('table:visible').within(() => {
      cy.contains('th', /^Product Information$/).should('be.visible')
      cy.contains('th', /^Quantity$/).should('be.visible')
      cy.contains('th', /^Unit Price$/).should('be.visible')
      cy.contains('th', /^Proceeds$/).should('be.visible')

      cy.contains('span', /^SKU$/).should('be.visible')
      cy.contains('span', /^Marketplace SKU$/).should('be.visible')
      cy.contains('span', /^UPC$/).should('be.visible')
    })

    return this
  }
  fulfillOrder() {
    cy.get('[role="listbox"]').should('be.visible').click() //3dot
    cy.get('.menu .dropdown-action').contains('Fulfill Order').should('exist').click({ force: true })
    cy.get('[class*="Common__PageHeaderText-sc-"]').should('be.visible').and('contain.text', 'Create Shipping Label')
    cy.contains('button', /^Fulfill Order$/, { timeout: 30000 }).should('be.visible').if('enabled').then((ele) => {
      cy.wrap(ele).should('not.be.disabled').click({ force: true })
    }).else().then(() => {
      cy.get('[class*="Button__DangerButton-sc-"]').should('be.visible').and('contain.text', 'Validate Address').click()
      this.addValidAddress()
    })
    return this;
  }
  updateFulfillmentStatus(status) {
    cy.get('[role="listbox"]').should('be.visible').click() //3dot
    cy.get('.menu .dropdown-action').contains('Update Fulfillment Status').should('exist').click({ force: true })
    cy.url().should('include', '/app/orders/update-fulfillment-status/')
    cy.get('.small-font').should('be.visible').and('contain.text', '0 selected items total') //0 selected items total should be visible
    cy.get('.ui.fitted input').eq(0).should('exist').check({ force: true }) //select all products
    cy.get('[data-field-value="status"]').should('be.visible').click() //open status dropdown
    cy.get('.visible.menu [role="option"]').contains(status).should('be.visible').click() //select status
    cy.get('button.ui.button').contains('Update Fulfillment Status').should('be.visible').click() //Update Fulfillment Status
    cy.get('.ui.modal.active h3').should('be.visible').and('contain.text', 'Update Order Status')
    cy.get('.ui.modal.active div').contains('Are you sure you want to update status for this order?').should('be.visible')
    cy.get('.ui.modal.active .positive').should('contain.text', 'Yes').click()
    cy.verifyToast('Order status updated')
    return this;
  }
  addValidAddress(address = {}) {
    const data = {
      addressLine1: '208 Quincy St',
      addressLine2: 'Brooklyn',
      city: 'Kings County',
      state: 'NY',
      zipCode: '11216',
      country: 'United States',
      customerName: 'Hannah Smith',
      email: '',
      mobileNumber: '+12025556385',
      companyName: '',
      manualOverride: false,
      ...address
    }

    cy.get('.modal.active', { timeout: 30000 }).within(() => {
      cy.get('[class*="Modal__AppModalHeader-sc-"]').should('be.visible').and('contain.text', 'Address Validation')
      cy.get('[class*="AddressValidationPopup__BannerRed-sc-"]').should('be.visible').and('contain.text', 'Invalid ZIP Code')
      cy.get('input[data-field-value="address_one"]').should('be.visible').clear().type(data.addressLine1)
      cy.get('input[data-field-value="address_two"]').should('be.visible').clear()

      if (data.addressLine2) {
        cy.get('input[data-field-value="address_two"]').type(data.addressLine2)
      }
      cy.get('input[data-field-value="city"]').should('be.visible').clear().type(data.city)
      cy.get('input[data-field-value="state"]').should('be.visible').clear().type(data.state)
      cy.get('input[data-field-value="postal_code"]').should('be.visible').clear().type(data.zipCode)
      cy.get('[data-field-value="country"]').should('be.visible').click({ force: true })
      cy.get('[data-field-value="country"] input.search').clear({ force: true }).type(data.country, { force: true })
      cy.contains('[data-field-value="country"] [role="option"] .text', new RegExp(`^${data.country}$`)).click({ force: true })
      cy.get('input[data-field-value="name"]').should('be.visible').clear().type(data.customerName)
      cy.get('input[data-field-value="email"]').should('be.visible').clear()

      if (data.email) {
        cy.get('input[data-field-value="email"]').type(data.email)
      }

      cy.get('input[data-field-value="phone"]').should('be.visible').clear({ force: true }).type(data.mobileNumber, { force: true })
      cy.get('input[data-field-value="company"]').should('be.visible').clear()

      if (data.companyName) {
        cy.get('input[data-field-value="company"]').type(data.companyName)
      }

      if (data.manualOverride) {
        cy.contains('Manual Override').parents('.field, div').first().find('input, .checkbox, [role="checkbox"]').click({ force: true })
      }
      cy.contains('button', /^Cancel$/).should('be.visible')
      cy.contains('button', /^Save$/).should('be.visible').and('not.be.disabled').click()
    })

    return this
  }
  cancelFulfillment(reason) {
    cy.get('[role="listbox"]').should('be.visible').click() //3dot
    cy.get('.menu .dropdown-action').contains('Cancel Fulfillment').should('exist').click({ force: true })
    cy.get('.modals.active h3').should('be.visible').and('contain.text', 'Are you sure you want to cancel').and('contain.text', 'order fulfillment?')
    cy.get('.modals.active .description .mb-3').should('be.visible').and('contain.text', 'Only the Shipment will be stopped but the order will be still retained')
    cy.get('.modals.active [placeholder="Reason"]').should('be.visible').type(reason)
    cy.get('.modals.active .text-right button').contains('Cancel').should('be.visible')
    cy.get('.modals.active .text-right button').contains('Submit').should('be.visible').click()
    cy.verifyToast('Order cancelled successfully')
  }
  createCopy(marketOrderId) {
    cy.get('[role="listbox"]').should('be.visible').click() //3dot
    cy.get('.menu .dropdown-action').contains('Create Copy').should('exist').click({ force: true })
    cy.get('.modal.active .header').should('be.visible').and('contain.text', 'Create Order Copy')
    cy.get('.modal.active [class*="FormField__MuteLabel-sc-"]').should('be.visible').and('contain.text', 'Market Order ID')
    cy.get('.modal.active [placeholder="Market Order ID"]').should('be.visible').type(marketOrderId)
    cy.get('.modal.active .text-right button').contains('Cancel').should('be.visible')
    cy.get('.modal.active .text-right button').contains('Duplicate').should('be.visible').click()
    cy.url().should('include', '/app/orders/clone/')
    cy.wait(2000)
    cy.get('.save-action').should('be.visible').and('contain.text', 'Save Changes').click() //Save Changes
  }
  validateOrderStatus(orderStatus) {
    const statuses = [
      'Pending Shipment',
      'Pending Fulfillment',
      'Shipped',
      'Delivered'
    ]

    const currentIndex = statuses.indexOf(orderStatus)
    expect(currentIndex, `Invalid order status: ${orderStatus}`).to.be.greaterThan(-1)

    cy.get('[class*="Header__StatusContainer-sc-"]').should('have.length', statuses.length)

    statuses.forEach((status, index) => {
      cy.get('[class*="Header__StatusContainer-sc-"]')
        .eq(index)
        .should('be.visible')
        .within(() => {
          cy.get('b').should('contain.text', status)
        })

      cy.get('[class*="Header__StatusContainer-sc-"]')
        .eq(index)
        .then($status => {
          if (index <= currentIndex) {
            cy.wrap($status).should('have.class', 'white')
          } else {
            cy.wrap($status).should('have.class', 'mute')
          }
        })
    })
  }
}