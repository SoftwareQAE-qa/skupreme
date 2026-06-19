import { Routes, StorageProvider } from '../support/selectors';

export class StorageProvidersPage {
  visit(providerId) {
    cy.visit(Routes.storageProvider(providerId, 'inventory'));
    cy.url({ timeout: 30000 }).should('include', 'tab=inventory');
    return this;
  }

  assertInventoryVisible() {
    cy.get(StorageProvider.inventoryTable, { timeout: 30000 }).should('be.visible');
    cy.contains('th', 'Product Information').should('be.visible');
    return this;
  }

  findProductInInventory(sku) {
    cy.get(StorageProvider.inventoryTable).contains(sku, { timeout: 30000 }).should('be.visible');
    return this;
  }
}
