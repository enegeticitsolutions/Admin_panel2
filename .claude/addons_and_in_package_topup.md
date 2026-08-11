# Add-ons Management & In-Package Top-up Architecture

This document details the complete architecture, database schema changes, backend API endpoints, Admin Panel management, and Mobile App purchase flow for Add-ons and Benefit Top-ups.

---

## 1. Database Schema Updates

The `Benefit` model in `packages/database/prisma/schema.prisma` was extended with five key fields:

```prisma
model Benefit {
  id                     String   @id @default(uuid())
  // ... existing fields ...
  unitCost               Float?
  cost                   Float?   // Internal cost vs unit price
  
  // Add-on configuration
  isAddon                Boolean  @default(false)
  addonPrice             Float?
  addonDiscountPrice     Float?
  addonIncludedUnits     Int      @default(1)
  // ...
}
```

### Purpose of Fields:
- **`cost`**: Internal unit cost incurred by the provider/company (stored in Benefits Library form).
- **`isAddon`**: Boolean flag marking whether a benefit is available for standalone purchase outside of packages.
- **`addonPrice`**: Retail price of the add-on package in INR.
- **`addonDiscountPrice`**: Optional discounted price of the add-on package.
- **`addonIncludedUnits`**: The number of benefit units included in a single add-on purchase (e.g., 5 companion hours, 2 visits).

---

## 2. Admin Panel Configuration

### Benefits Library (`apps/admin-frontend/src/app/pages/BenefitsPage.tsx`)
- Updated the benefit creation and edit form under "Chargeable Benefit" toggle.
- Displays `Cost (₹)` (internal cost) alongside `Unit Price (₹)` (retail price charged per unit).

### Add-ons Management (`apps/admin-frontend/src/app/pages/AddonsPage.tsx`)
- New dedicated admin page accessible via sidebar at `/addons`.
- Fetches all benefits from the library grouped by category (Emergency, Tele-consultation, Nurse, etc.).
- Includes a toggle switch (`isAddon`) for each benefit.
- When toggled ON, exposes inputs for:
  - **Included Units** (`addonIncludedUnits`)
  - **Price (₹)** (`addonPrice`)
  - **Discount (₹)** (`addonDiscountPrice`)
- Saves directly to the database via `PATCH /api/benefits/:id` in `apps/admin-backend/routes/benefits.js`.

---

## 3. Subscriber Add-on Purchase Flow (Mobile App)

### User Flow:
1. Subscriber logs in -> Profile -> Selects Beneficiary -> Opens **Package Utilization** (`/package-utilization?beneficiaryId=...`).
2. Below the active benefit balances, an **"Available Add-ons"** section displays all active benefits with `isAddon === true`.
3. Tapping **"Add"** opens a purchase modal showing:
   - Benefit name & category icon
   - Unit count added (e.g. `+5 hours`)
   - Server-calculated price breakdown: Base price + 18% GST = Total price.
4. Tapping **"PAY ₹X"** opens Razorpay Checkout (or dev mock in web/Expo Go).
5. Upon successful payment verification, the backend instantly credits the units to the beneficiary's active subscription balance and auto-refreshes the screen.

---

## 4. Backend API Endpoints

All endpoints are located in `apps/api/app/api/subscriber/subscriptions.routes.ts`:

### 1. `GET /subscriber/subscriptions/addons/available`
- **Auth:** Subscriber
- **Returns:** List of active benefits where `isAddon === true`.

### 2. `POST /subscriber/subscriptions/addon/preview`
- **Auth:** Subscriber
- **Body:** `{ subscriptionId, benefitId }`
- **Logic:** Server-side calculation of base price, 18% GST tax, and total amount. Never trusts client-side math.

### 3. `POST /subscriber/subscriptions/addon/create-order`
- **Auth:** Subscriber
- **Body:** `{ subscriptionId, benefitId }`
- **Logic:** Calls `createOrder()` service to initialize Razorpay payment order.

### 4. `POST /subscriber/subscriptions/addon/purchase`
- **Auth:** Subscriber
- **Body:** `{ subscriptionId, benefitId, razorpay_payment_id, razorpay_order_id, razorpay_signature }`
- **Logic:**
  1. Verifies Razorpay HMAC signature via `verifyPaymentSignature()`.
  2. Runs a database transaction:
     - Upserts `SubscriptionBenefitBalance`: if the benefit already exists in the subscription, adds `addonIncludedUnits` to `totalUnits` and `availableUnits`. If it's a new benefit, creates a balance record.
     - Logs a audit entry in `BenefitTransaction` with `transactionType: 'ALLOCATED'` and `reason: Add-on purchase...`.

---

## 5. Architectural Integrity & Reuse

- **No schema pollution:** No separate `Addon` table needed; extended `Benefit` and existing `SubscriptionBenefitBalance`.
- **Payment reuse:** Uses existing `createOrder` and `verifyPaymentSignature` methods from `razorpay_service.ts`.
- **Audit trail:** All credit additions are tracked in `BenefitTransaction` with `ALLOCATED` type.
