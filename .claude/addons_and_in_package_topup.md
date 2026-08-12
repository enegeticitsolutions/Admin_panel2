# Add-ons Management, Region-Based Selection & In-Package Top-up Architecture

This document details the complete architecture, database schema, regional targeting flow, backend API endpoints, Admin Panel management, and Mobile App user experience for Add-ons, Package Customization, and In-Package Top-ups.

---

## 1. Core Architecture Overview

The system supports two distinct entry points for Add-ons:

1. **Care Plan Customization (Pre-Purchase / Initial Enrollment)**:
   - When a subscriber selects a base care package (e.g. Gold Package with 3 standard benefits), an **Add-on Customization Step Modal** allows selecting optional add-on benefits with quantity selectors before checkout.
   - Standard package benefits and selected add-on benefits are initialized together in a single atomic database transaction.
   - Result: All benefits (e.g., 3 standard + 1 add-on = 4 total) immediately appear together under **Package Utilization**.

2. **In-Package Top-up (Post-Purchase / Active Subscription)**:
   - Subscribers with an active subscription can top-up additional units for existing or new benefits directly from the **Package Utilization** screen.

---

## 2. Database Schema Architecture

The `Benefit` model in `packages/database/prisma/schema.prisma` was extended to serve as the unified engine for both standard benefits and add-ons:

```prisma
model Benefit {
  id                     String   @id @default(uuid())
  code                   String   @unique
  name                   String
  description            String?
  unitLabel              String   @default("visits")
  unitCost               Float?   // Internal cost incurred by company
  cost                   Float?   // Standard library cost
  
  // Add-on configuration
  isAddon                Boolean  @default(false)
  isGlobal               Boolean  @default(true)
  addonPrice             Float?   // Base retail price per add-on pack
  addonDiscountPrice     Float?   // Optional discounted price
  addonIncludedUnits     Int      @default(1) // Units included in 1 pack (e.g., 10 visits)
  
  // Relations
  regions                BenefitRegion[]
  packageBenefits        PackageVersionBenefit[]
  subscriptionBalances   SubscriptionBenefitBalance[]
}
```

### Purpose of Fields:
- **`isAddon`**: Marks whether a benefit is available as a standalone add-on.
- **`isGlobal`**: If `true`, the add-on is available nationally across all locations. If `false`, it requires regional targeting via `BenefitRegion`.
- **`addonPrice`**: Retail price of 1 add-on unit pack in INR.
- **`addonDiscountPrice`**: Discounted price if applicable.
- **`addonIncludedUnits`**: Number of benefit units credited per pack (e.g., `1 pack = 10 visits`).

---

## 3. Region-Based Add-ons Flow

Add-ons can be scoped globally or targeted to specific geographical regions:

```
[ Subscriber Sets Location (Pincode / GPS Pin) ]
                       │
                       ▼
         [ Resolves selectedRegionId ]
                       │
                       ▼
 [ GET /subscriber/subscriptions/addons/available?regionId=${selectedRegionId} ]
                       │
                       ▼
    ┌──────────────────┴──────────────────┐
    ▼                                     ▼
[ isGlobal === true ]          [ BenefitRegion contains regionId ]
(Global Add-ons)               (Location-Targeted Add-ons)
    └──────────────────┬──────────────────┘
                       ▼
  [ Returns Combined Available Add-ons List ]
```

### Step-by-Step Regional Flow:
1. **Admin Targeting (`AddonsPage.tsx`)**:
   - Admin creates an add-on (e.g., "Morning Nurse Special - Delhi NCR").
   - Sets `isGlobal = false` and links regional zones (`Delhi NCR`, `Gurugram`).
2. **Mobile Location Resolution (`subscription-packages.tsx`)**:
   - Subscriber enters Pincode (`110001`) or drops a map pin.
   - App checks serviceability and sets `selectedRegionId`.
3. **API Query Filtering**:
   - `GET /subscriber/subscriptions/addons/available?regionId=...` returns benefits matching:
     `isAddon === true` AND `isActive === true` AND (`isGlobal === true` OR `regions.some(r => r.regionId === selectedRegionId)`).
4. **Dynamic UI Adaptation**:
   - If the user changes location to Bangalore, the modal dynamically re-fetches and displays Bangalore-specific add-ons.

---

## 4. Package Selection Add-ons Customization Flow (Pre-Purchase)

When selecting a care package on `subscription-packages.tsx`:

1. **Package Card Selection**:
   - Subscriber taps "Select" on a package card (e.g., Gold Package).
2. **Customize Your Plan Modal**:
   - Displays package summary banner (`3 Standard Benefits Included · ₹5,000`).
   - Fetches available location-matched and global add-ons.
   - Shows add-on items with quantity steppers (`-` `[quantity]` `+`).
3. **Dynamic Live Calculations**:
   - **Total Coverage**: `Standard Benefits + Selected Add-on Benefits = Total Benefits` (e.g., `3 + 1 = 4 Benefits Total`).
   - **Total Price**: `Base Package Price + Sum(Addon Price * Quantity)`.
4. **Checkout Transmission (`checkout.tsx`)**:
   - Passes `selectedAddons: Array<{ benefitId: string, quantity: number }>` to `POST /checkout/preview`, `POST /create-order`, and `POST /purchase`.
   - Displays selected add-ons breakdown inside the Checkout **Order Summary** card.
5. **Atomic Backend Purchase & Balance Initialization**:
   - Inside `purchaseSubscription` transaction in `subscription_service.ts`:
     - Creates `Subscription` record.
     - Initializes balances for standard `versionBenefits`.
     - Initializes/tops-up balances for `selectedAddons` (`units = addonIncludedUnits * quantity`).
   - Result: Both standard and add-on benefits immediately show up together in **Package Utilization** (`package-utilization.tsx`).

---

## 5. Backend API Reference

All endpoints are located in `apps/api/app/api/subscriber/subscriptions.routes.ts`:

### 1. `GET /subscriber/subscriptions/addons/available`
- **Auth:** Subscriber token
- **Query Params:** `regionId?: string`
- **Returns:** Array of active add-on benefits (filtered by region + global).

### 2. `POST /subscriber/subscriptions/checkout/preview`
- **Auth:** Subscriber token
- **Body:** `{ packageId: string, couponCode?: string, selectedAddons?: Array<{ benefitId: string, quantity: number }> }`
- **Returns:** Calculated breakdown including `packageBasePrice`, `addonsTotalPrice`, `addonsBreakdown`, `discountApplied`, `tax` (18% GST), and `total`.

### 3. `POST /subscriber/subscriptions/create-order`
- **Auth:** Subscriber token
- **Body:** `{ packageId: string, couponCode?: string, selectedAddons?: Array<{ benefitId: string, quantity: number }> }`
- **Logic:** Server-side calculation of total amount including add-ons; creates Razorpay payment order.

### 4. `POST /subscriber/subscriptions/purchase`
- **Auth:** Subscriber token
- **Body:** `{ packageId: string, beneficiaryData: ..., selectedAddons?: Array<{ benefitId: string, quantity: number }>, razorpay_payment_id, ... }`
- **Logic:** Verifies payment signature and runs atomic database transaction populating all standard + selected add-on balances.

### 5. `POST /subscriber/subscriptions/addon/preview` (In-Package Top-up)
- **Auth:** Subscriber token
- **Body:** `{ subscriptionId: string, benefitId: string, quantity?: number }`
- **Returns:** Pricing breakdown for standalone top-up purchase.

### 6. `POST /subscriber/subscriptions/addon/purchase` (In-Package Top-up)
- **Auth:** Subscriber token
- **Body:** `{ subscriptionId: string, benefitId: string, quantity?: number, razorpay_payment_id, ... }`
- **Logic:** Verifies signature, updates/upserts `SubscriptionBenefitBalance`, logs `BenefitTransaction` (`ALLOCATED`), and dispatches push & in-app notifications.

---

## 6. Shared Modular Frontend Architecture (`apps/mobile-app/`)

To maintain clean code separation and max reusability, components are organized under `components/addons/`:

```
apps/mobile-app/components/addons/
├── AddonCard.tsx            # Universal Add-on Card (Direct mode & Stepper mode)
├── AddonPurchaseModal.tsx   # Top-up Purchase Sheet with Quantity Selector & Price Breakdown
└── AddonsSection.tsx        # Section Container for Package Utilization screen
```

### Dual Operating Modes of `AddonCard.tsx`:
1. **Direct Purchase Mode** (`package-utilization.tsx`):
   - Renders `Add` button that opens `AddonPurchaseModal` for topping up an active subscription.
2. **Interactive Stepper Mode** (`subscription-packages.tsx`):
   - Accepts `selectedQuantity` and `onQuantityChange` props.
   - When quantity is `0`: Renders `+ Add` button.
   - When quantity is `> 0`: Renders interactive `-` `[quantity]` `+` stepper controls directly on the card.

---

## 7. Minimalist Design System Standards

The Add-on UI adheres to modern minimalist design principles:

- **Typography**: Clean slate hierarchy (`#0F172A` headings, `#64748B` body, tracking letter-spacing on category badges).
- **Cards**: Pure white background (`#FFFFFF`), subtle border (`1px solid #E2E8F0`), soft subtle orange tint on selection (`#FFFBF9`).
- **Badges**: Micro unit pills (`#F1F5F9` subtle tint badge, `#475569` text).
- **Buttons**: Minimalist `#FF5B0A` solid buttons with clean white text and smooth touch feedback.

---

## 8. Notifications & Audit Trail

Upon completing any Add-on purchase:
1. **Audit Log**: Formally recorded in `BenefitTransaction` table with `transactionType: 'ALLOCATED'` and reason string.
2. **Subscriber Notification**: Dispatched via FCM/APNs & stored in `notifications` table (`Add-on Purchased! 🎉`).
3. **Beneficiary Notification**: Dispatched to beneficiary user account (`New Benefit Added! 🎁`).
