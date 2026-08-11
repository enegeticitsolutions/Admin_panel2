# Subscription Management & Utilization

This document outlines the recent updates made to the subscription management, beneficiary linking, and package utilization features.

## 1. Beneficiary Linking (Zero-Entry)
When a subscriber purchases a package without specifying a beneficiary, it is created as an "Unlinked Care Plan."

**Flow & Logic:**
- **Frontend (`apps/mobile-app/app/(subscriber)/index.tsx`):** Added a Bottom Sheet Modal for the Dashboard. When "Add Beneficiary" is clicked on an unlinked care plan, it prompts the user to select one of their existing beneficiaries instead of forcing them to fill out the enrollment form again.
- **Backend API (`apps/api/app/api/subscriber/subscriptions.routes.ts`):** 
  - Added `POST /api/subscriber/subscriptions/:subscriptionId/link-beneficiary`
  - Validates ownership of both the subscription and the beneficiary.
  - Updates the `Subscription` table in the database to link the `beneficiaryId`.
  - *Note:* `SubscriptionBenefitBalance` and `PackageHoursLog` tables do not require `beneficiaryId` updates during linking because they are either strictly mapped by `subscriptionId` or are only generated upon actual usage (visits).

## 2. Package Utilization Filtering
The Package Utilization screen (`/package-utilization`) displays a summary of beneficiaries and their current active packages.

**Logic Update:**
- **Backend API (`apps/api/app/api/shared/utilization.routes.ts`):**
  - Updated the logic for `userRole === 'subscriber'`.
  - Added a `.filter(s => s.activePackage !== null)` constraint to the returned `normalSummaries` array.
  - Beneficiaries whose packages have expired or who have no package attached are intentionally hidden from the utilization summary view, keeping the UI focused only on active packages.

## 3. Autopay Setup (Future Reference)
A fully documented reference file has been added to support recurring billing (Autopay) via Razorpay Subscriptions.

- **File Path:** `apps/api/app/services/razorpay_autopay_reference.ts`
- **Key differences from current setup:**
  - Uses `razorpay.subscriptions.create()` instead of `razorpay.orders.create()`.
  - Requires setting up a `Plan` in Razorpay beforehand (or on-the-fly).
  - Relies on Razorpay Webhooks (e.g., `subscription.charged`) to automatically renew the subscription in the database each month.
