import { Routes, Catalog } from '../support/selectors';

export class CatalogProductsPage {
  visit() {
    cy.visit(Routes.products);
    return this;
  }

  assertPageLoaded() {
    cy.get(Catalog.pageHeader, { timeout: 30000 }).should('be.visible').and('contain.text', 'Products');
    cy.get(Catalog.searchInput).should('be.visible');
    cy.get(Catalog.productTable, { timeout: 30000 }).should('be.visible');
    return this;
  }

  searchProduct(searchTerm) {
    cy.get(Catalog.searchInput).clear().type(`${searchTerm}{enter}`);
    cy.get(Catalog.productTableBody).contains(searchTerm, { timeout: 30000 }).should('be.visible');
    return this;
  }

  openProductBySku(sku) {
    cy.get(Catalog.productTableBody).contains(sku).parents('tr').find('a[href*="/catalogs/catalog/"]').first().click();
    cy.url({ timeout: 30000 }).should('match', /\/catalogs\/catalog\/[a-f0-9]+/);
    return this;
  }

  openProductById(productId, tab) {
    cy.visit(Routes.productDetail(productId, tab));
    cy.url({ timeout: 30000 }).should('include', productId);
    return this;
  }

  assertAvailableUnits(sku, minQty = 1) {
    cy.get(Catalog.productTableBody).contains(sku, { timeout: 30000 }).should('be.visible');
    cy.get(Catalog.productTableBody)
      .contains(sku)
      .parents('tr')
      .first()
      .invoke('text')
      .should((text) => {
        const numbers = text.match(/\d[\d,]*/g) || [];
        const quantities = numbers.map((n) => Number(n.replace(/,/g, '')));
        const maxQty = Math.max(...quantities, 0);
        expect(maxQty).to.be.at.least(minQty);
      });
    return this;
  }

  openInventoryTab(productId) {
    cy.visit(Routes.productDetail(productId, 'inventory'));
    cy.url({ timeout: 30000 }).should('include', 'tab=inventory');
    cy.contains('Available Units', { timeout: 30000 }).should('be.visible');
    return this;
  }
}
