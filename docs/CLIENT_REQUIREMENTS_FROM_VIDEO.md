# SKUPREME Video Requirements Extraction

Source: `SKUPREME.mp4` (~9 min demo walkthrough by Gaurab Thapa)

## Client Context

- **Platform:** SKUPREME e-Commerce Admin Portal (staging)
- **Environment:** Demo account — safe to explore and test
- **Credentials:** `qa@skupreme.com` (QA account used in demo)

---

## Phase 1 Automation Scope (Explicit Ask)

Gaurab requests automating **up to the first milestone**:

> *"Can you try and automate till this part? Meaning like, checking maybe..."*

### Flow 1: Verify Warehouse Inventory

| Step | Action |
|------|--------|
| 1 | Navigate to **Catalog > Products** |
| 2 | Open product (example: **BHP Test**, SKU **BHP-102**, UPC 1112331) |
| 3 | Check **Inventory** tab — how much is available per warehouse |
| 4 | Alternatively: **Inventory > Storage Providers** > select provider > **Inventory** tab |
| 5 | Toggle **Show Items** if needed |

**Business rule:** Catalog has inventory per warehouse. Know which warehouse has stock before creating orders.

### Flow 2: Create Manual Order (Warehouse-Aware)

| Step | Action |
|------|--------|
| 1 | Go to **Orders > Pending Shipment** (D2C Orders) |
| 2 | Click **+ Order** (Manual Order modal) |
| 3 | Fill recipient/address (example: Alice Brown, 321 Pine Road, CA 33423) |
| 4 | Add line item from catalog (e.g. BHP-102) — item must have inventory in selected warehouse |
| 5 | Submit order |
| 6 | Order should appear in **Pending Fulfillment** |

**Business rules:**
- Order routes to warehouse based on inventory availability
- Orders can show **OOS** (Out of Stock) when inventory insufficient — e.g. `OID-9158` shows "1/1 items OOS"
- Test with **valid and invalid addresses** (wrong address scenarios mentioned)
- Can copy/reuse previous order addresses

### Flow 3: Fulfill Order

| Step | Action |
|------|--------|
| 1 | From **Pending Shipment**, open order (View / View & Approve) |
| 2 | Click **Fulfill** — sends fulfillment request to warehouse |
| 3 | Warehouse receives request: *"fulfillment has been requested from the Skupreme side"* |
| 4 | Order status progresses: **Pending Fulfillment → Pending Shipment → Shipped → Delivered** |
| 5 | **Shipping Details** tab shows: Status, Inventory Source (e.g. Warehouse ONE), product/SKU |
| 6 | **Label History** tab shows generated labels (USPS Ground Advantage, etc.) |
| 7 | Labels can be downloaded (PDF) |

**Business rules:**
- System may generate **multiple labels** (one per item/team)
- Compare **label rates** across providers before fulfilling
- Fulfillment providers: **Tactical 3PL** (Perris, CA), **Warehouse ONE**
- Batches can group orders for fulfillment

---

## Platform Modules Shown (Full Tour)

### Orders
- Pending Shipment, Pending Fulfillment, Shipped, Canceled, Returns, Manual Labels
- D2C Orders vs B2B Orders
- Batches table (Name, Date Created, Fulfillment Provider)
- Orders table (Order ID, Order Age, Marketplace, Fulfillment Provider, Locale, Total Items, Price)
- Actions: + Order, Fulfill, View & Approve, Filters, Import/Export
- Barcode scan workflow
- OOS indicator on order rows

### Inventory
- Storage Providers (with Inventory tab, Metric/Imperial toggle, Show Items)
- Shipments, Work Orders

### Catalog
- Products, Components, Carton Configuration, Classification Guide, Unmatched Listings
- Product detail tabs: Information, Price, Images, Variations, Sales Velocity, **Inventory**, Item Package Attributes
- Available Units column on product list

### Settings
- Users, Open Invitations (signup/invite flow discussed)
- General, Wallet, Catalog, Orders, Markets, Subscription, Keys, Ads Integration

### Other
- Purchasing, Wholesale, Reports, Dashboard/Awaiting Actions, Notifications

---

## Test Data from Video

| Field | Value |
|-------|-------|
| Product | BHP Test (Kit) |
| SKU | BHP-102 |
| UPC | 1112331 |
| Price | $1.00 |
| Sample order ID | Copy-1, OID-9158 |
| Warehouse | Warehouse ONE, Tactical 3PL - Main |
| Recipient (demo) | Alice Brown |
| Address | 321 Pine Road, CA 33423 |
| Email | alice.brown@sample.net |

---

## Out of Scope (Mentioned but Not Phase 1)

- User signup / invite user troubleshooting
- Full address validation matrix (wrong addresses — mentioned for later)
- B2B orders flow
- Barcode scanning
- Batch management
- Label rate comparison automation
- Warehouse physical pick simulation

---

## Success Criteria for Phase 1

1. Login to staging successfully
2. Assert product BHP-102 has available inventory
3. Create manual order with that product
4. Order reaches **Pending Fulfillment** status
5. Fulfill order → status moves to **Pending Shipment**
6. Label appears in **Label History**

---

## Open Questions for Client

1. Which warehouse should be the default for order creation tests?
2. Should tests use a unique order ID prefix to avoid collisions?
3. Is label generation synchronous or async (wait time for Label History)?
4. Should OOS orders be a separate negative test case?
5. Priority: D2C only or include B2B?
