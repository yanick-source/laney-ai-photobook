
# Partner Dashboard Shopify Integration Plan

## Overview
This plan connects the Partner Dashboard's "Order Physical Book" button to your Shopify store and links the "Create with Laney AI" button to your home page where users can create their own photobooks.

## What We'll Do

### 1. Create a New Shopify Product
We'll add a **B2B Photobook** product to your Shopify store:
- **Title**: B2B Photobook
- **Price**: €45.00
- **Description**: Professional photobook for business partners
- **Vendor**: Laney
- **Product Type**: Fotoboek

This product will be visible in your Shopify store alongside your existing "Laney Fotoboek" product.

### 2. Update the Partner Dashboard Buttons

**"Order Physical Book" Button**
- When clicked, creates a Shopify cart with the B2B Photobook
- Opens the Shopify checkout in a new tab
- Uses the proper Storefront API cart creation (not direct URLs)
- Shows a loading state while processing

**"Create with Laney AI" Button**
- Links to the home page (`/`) using React Router navigation
- Users can then start creating their own photobook through the AI creation flow

---

## Technical Details

### Files to Modify

**`src/pages/Partner/PartnerDashboard.tsx`**
- Import `useNavigate` from react-router-dom for navigation
- Import cart/checkout functions from the Shopify library
- Add loading state for the order button
- Connect "Order Physical Book" to create a cart with the B2B product variant and redirect to Shopify checkout
- Connect "Create with Laney AI" to navigate to home page

### Shopify Integration Flow

```text
User clicks "Order Physical Book"
         ↓
Create cart via Storefront API (cartCreate mutation)
         ↓
Get checkout URL from response
         ↓
Add channel=online_store parameter
         ↓
Open checkout in new tab
```

### New Product Structure
```text
B2B Photobook
├── Price: €45.00
├── Vendor: Laney
├── Product Type: Fotoboek
└── Tags: b2b, partner, fotoboek, zakelijk
```

---

## Expected User Experience

1. **Partner views their photobook** on the dashboard
2. **Clicks "Order Physical Book"** → Button shows loading spinner → Shopify checkout opens in new tab with the B2B Photobook pre-added to cart
3. **Clicks "Create with Laney AI"** → Navigates to home page where they can start creating a new photobook

---

## Notes
- The B2B Photobook product will be created in your live Shopify store
- The checkout flow uses the secure Storefront API cart system already set up in your project
- All button styling remains consistent with the current design
