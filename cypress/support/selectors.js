export const Routes = {
  login: '/login',
  products: '/app/catalogs/catalog/',
  productDetail: (id, tab) =>
    tab ? `/app/catalogs/catalog/${id}?tab=${tab}` : `/app/catalogs/catalog/${id}`,
  storageProvider: (id, tab = 'inventory') =>
    `/app/scm/storage-provider/${id}?tab=${tab}`,
  storageProvidersList: '/app/scm/storage-provider',
  pendingShipment: '/app/orders/list/Pending%20Shipment/?status=Pending+Shipment',
  pendingFulfillment:
    '/app/orders/list/Pending%20Fulfillment/?status=Pending+Fulfillment',
};

export const Login = {
  emailInput: 'input[placeholder="Email Address"]',
  passwordInput: 'input[placeholder="Password"]',
  submitButton: 'button[type="submit"]',
};

export const Sidebar = {
  mainContent: '#main-skupreme-content',
  inventoryMenuGroup: '[data-menu-id="rc-menu-uuid-Supply Chain"]',
  productsMenuItem: '[data-menu-id="rc-menu-uuid-/app/catalogs/catalog"]',
  storageProvidersMenuItem: '[data-menu-id="rc-menu-uuid-/app/scm/storage-provider"]',
};

export const Catalog = {
  pageHeader: '#main-skupreme-content',
  searchInput: 'input[placeholder="SKU, UPC, Title, ASIN..."]',
  productTable: 'table.AppTable__ShadowTable-sc-5p76pr-1',
  productTableBody: 'table.AppTable__ShadowTable-sc-5p76pr-1 tbody',
  availableUnitsHeader: 'th.AppTable__CustomHeaderCell-sc-5p76pr-6',
  productLink: (id) => `a[href="/app/catalogs/catalog/${id}"]`,
};

export const StorageProvider = {
  inventoryTable: 'table.AppTable__ShadowTable-sc-5p76pr-1',
};

export const Orders = {
  createOrderButton: 'button:contains("+ Order")',
  orderTable: 'table tbody tr',
  viewOrderButton: /view.*approve/i,
  createShippingLabelDrawer: /create shipping label/i,
  addressValidationModal: /address validation/i,
  validateAddressButton: /validate address/i,
  fulfillOrderButton: /fulfill order/i,
  shippingDetailsTab: /shipping details/i,
  labelHistoryTab: /label history/i,
};

export const ManualOrder = {
  modalTitle: /manual order/i,
  pasteAddressButton: 'Paste Address',
  useThisAddressButton: 'Use this address',
  addressAutocomplete: '[class*="GoogleAutocomplete"], [class*="AutoComplete"]',
  addressSearchInput:
    'textarea[class*="AutoCompleteInput"], textarea[class*="GoogleAutocomplete"], [class*="GoogleAutocomplete"] textarea',
  addressSuggestionItem:
    '[class*="Suggestion"]:not(textarea):not(input), [class*="suggestion"]:not(textarea):not(input)',
  searchCustomersInput: 'input[placeholder="Name, Customer ID, E-Mail Address"]',
  customerSearchBox: '[class*="CustomerSearch"], .ui.search',
  customerDropdownResult: '.results.transition.visible .result, .results.visible .result',
  customerDropdownTitle: '.results.transition.visible .result .title, .results.visible .result .title',
  searchItemsInput: 'input[placeholder="Search items"]',
  saveOrderButton: 'Save Order'
};
