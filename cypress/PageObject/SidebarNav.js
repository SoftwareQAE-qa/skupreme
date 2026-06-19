import { Routes, Sidebar } from '../support/selectors';

export class SidebarNav {
  goToProducts() {
    cy.visit(Routes.products);
    cy.get(Sidebar.mainContent, { timeout: 30000 }).should('be.visible');
    return this;
  }

  goToStorageProviders() {
    cy.get(Sidebar.inventoryMenuGroup).click();
    cy.get(Sidebar.storageProvidersMenuItem).click();
    cy.url({ timeout: 30000 }).should('include', Routes.storageProvidersList);
    return this;
  }
}
