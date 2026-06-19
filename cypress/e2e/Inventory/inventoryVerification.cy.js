import { SidebarNav } from '../../PageObject/SidebarNav';
import { CatalogProductsPage } from '../../PageObject/CatalogProductsPage';
import { StorageProvidersPage } from '../../PageObject/StorageProvidersPage';

describe('SKUPREME - Warehouse Inventory Verification', () => {
  const sidebar = new SidebarNav();
  const productsPage = new CatalogProductsPage();
  const storagePage = new StorageProvidersPage();

  beforeEach(() => {
    cy.fixture('testData').as('testData');
  });

  it('INV-01 | should verify product available units from Catalog > Products', function () {
    const { product } = this.testData;

    sidebar.goToProducts();
    productsPage.assertPageLoaded();
    productsPage.searchProduct(product.sku);
    productsPage.assertAvailableUnits(product.sku, 1);
  });

  it('INV-02 | should verify product inventory tab for warehouse stock', function () {
    const { product } = this.testData;

    productsPage.openInventoryTab(product.id);
    cy.contains(product.sku).should('be.visible');
    cy.contains('Available Units').should('be.visible');
  });

  it('INV-03 | should verify inventory from Storage Providers', function () {
    const { product, storageProvider } = this.testData;

    storagePage.visit(storageProvider.id);
    storagePage.assertInventoryVisible();
    storagePage.findProductInInventory(product.sku);
  });
});
