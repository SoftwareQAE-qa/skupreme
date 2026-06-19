# SKUPREME Cypress Automation (POM)

Cypress E2E automation for the SKUPREME e-Commerce Admin portal (staging).

## Project Location

`C:\Projects\Cypress\SKUPREME`

## Setup

```bash
cd C:\Projects\Cypress\SKUPREME
npm install
```

Copy credentials:

```bash
copy cypress.env.example.json cypress-env.json
```

Edit `cypress-env.json` with staging credentials.

## Run Tests

```bash
npm run cy:open          # Interactive runner
npm run cy:run           # Headless - all specs
npm run cy:run:inventory # Inventory verification only
npm run cy:run:orders    # Create + fulfill order flows
npm run cy:explore       # Platform exploration specs
```

## Page Object Structure

```
cypress/
  PageObject/
    LoginPage.js
    SidebarNav.js
    CatalogProductsPage.js
    StorageProvidersPage.js
    OrdersPage.js
  e2e/
    Inventory/inventoryVerification.cy.js
    Orders/createOrder.cy.js
    Orders/fulfillOrder.cy.js
```

## Automated Flows (Phase 1)

1. **Verify warehouse inventory** - Catalog > Products (Available Units + Inventory tab) and Inventory > Storage Providers
2. **Create manual order** - Orders > Pending Shipment > + Order, using product with stock (e.g. BHP-102)
3. **Fulfill order** - Open order > Fulfill > verify Pending Shipment status and Label History

## Environment

- Base URL: `https://staging.skupreme.com`
- Login: `/login`

## Notes

- Demo/staging account is safe for exploration
- Orders with `OOS` (out of stock) are excluded from fulfillment tests
- Fulfillment providers seen: Tactical 3PL - Main, Warehouse ONE
