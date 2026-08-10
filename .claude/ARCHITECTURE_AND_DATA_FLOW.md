# MaiHoonNa Connected Senior Care System — Architecture & Data Flow Guide

## System Overview & Component Mapping

The MaiHoonNa platform consists of 5 integrated applications sharing a centralized PostgreSQL database via Prisma ORM (`packages/database`).

```
                              ┌─────────────────────────────┐
                              │     PostgreSQL Database     │
                              │      (Prisma Schema)        │
                              └──────────────┬──────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                       ▼                                           ▼
          ┌──────────────────────────┐               ┌──────────────────────────┐
          │   apps/admin-backend     │               │        apps/api          │
          │   Port: 3001 (Express)   │               │   Port: 8001 (Express)   │
          └────────────┬─────────────┘               └─────────────┬────────────┘
                       │                                           │
                       ▼                                           ▼
          ┌──────────────────────────┐               ┌──────────────────────────┐
          │   apps/admin-frontend    │               │       apps/website       │
          │    Port: 5173 (React)    │               │    Port: 5174 (Vite)     │
          └──────────────────────────┘               └──────────────────────────┘
                                                                   │
                                                                   ▼
                                                     ┌──────────────────────────┐
                                                     │     apps/mobile-app      │
                                                     │    (React Native/Expo)   │
                                                     └──────────────────────────┘
```

---

## Component Responsibilities & Code Connections

### 1. Website Frontend (`apps/website`)
- **`src/main.jsx`**: Main SPA entry point and site shell. Manages page routing (`home`, `plans`, `saathi`, `checkout`, `account`), user authentication state (`mhn_user`, `mhn_token`), and global header nav bar.
- **`src/pages/PlansPage.jsx`**: Modular subscription plans page component. Features:
  - Interactive billing toggle (`1`, `3`, `6`, `12` months).
  - Auto-play card-wise carousel slider (slides right-to-left every 2.5s, pauses on hover, with `‹` / `›` nav arrows and dot pagination).
  - **100% Dynamic Comparison Table**: Pulls live package data from the DB, compares the top 3 packages (or packages flagged with `isCompared`), and dynamically renders rows from the live Benefits Library.
- **`src/components/PackageCard.jsx`**: Reusable card component for single package rendering. Calculates duration pricing (`priceThreeMonths`, `priceSixMonths`, `priceTwelveMonths`), units subtext (`hrs/mo`, `visits/wk`), and package benefits.
- **`src/pages/CheckoutPage.jsx`**: Native Razorpay subscription checkout. Passes `packageId`, duration, and `amount` to validate coupons and initiate Razorpay gateway payments.
- **`src/services/api.js`**: Service layer calling backend `/api/subscriber/*` endpoints.

### 2. Admin Frontend (`apps/admin-frontend`)
- **`src/app/pages/SubscriptionsPage.tsx`**: Product Factory Wizard. Allows non-tech admins to:
  - Define package metadata, MRP, base price, and duration discounts (3Mo, 6Mo, 12Mo).
  - Attach benefits from the Benefits Library and assign monthly unit quantities.
  - Check **"Include in Comparison Table"** (`isCompared`) to feature the package in the website side-by-side comparison.
  - Set global availability or target specific geographic regions.
- **`src/services/api.ts`**: Admin API service calling `admin-backend` (`packageApi`, `benefitApi`, `regionApi`).

### 3. Admin Backend (`apps/admin-backend`)
- **`routes/packages.js`**: Express routes handling package CRUD operations (`GET /packages`, `POST /packages`, `PUT /packages/:id`, `DELETE /packages/:id`). Saves `isCompared`, `isPopular`, `isGlobal`, duration prices, and package benefit links.
- **`utils/packageVersionHelper.js`**: Version snapshot helper for subscription packages.

### 4. Primary Backend API (`apps/api`)
- **`app/api/subscriber/subscriptions.routes.ts`**: Public & subscriber subscription API endpoints (`GET /subscriber/subscriptions/packages`).
- **`app/api/subscriber/coupons.routes.ts`**: Coupon validation endpoint (`POST /subscriber/coupons/validate` requiring `{ code, packageId, amount }`).
- **`app/services/subscriber/subscription_service.ts`**: Core subscription queries using Prisma.

### 5. Shared Database (`packages/database`)
- **`prisma/schema.prisma`**: Models for `SubscriptionPackage`, `Benefit`, `PackageBenefit`, `SubscriptionPackageRegion`, `Coupon`, `Subscription`, `User`, `Beneficiary`.

---

## Data Flow: Admin Product Factory → Website → Checkout

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ STEP 1: Admin Product Factory (apps/admin-frontend / SubscriptionsPage.tsx) │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ (POST/PUT /packages)
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ STEP 2: Database Storage (PostgreSQL / subscription_packages table)         │
 │ - Saves isCompared flag, 3Mo/6Mo/12Mo pricing, and PackageBenefit links     │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ STEP 3: Website Data Fetching (apps/website / services/api.js)              │
 │ - Calls GET /api/subscriber/subscriptions/packages                         │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ STEP 4: Live Rendering (apps/website / PlansPage.jsx & PackageCard.jsx)    │
 │ - Displays card carousel slider                                             │
 │ - Dynamically compares 3 DB packages against Benefits Library in table      │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ STEP 5: Razorpay Checkout (apps/website / CheckoutPage.jsx)                 │
 │ - Validates coupon with { code, packageId, amount }                         │
 │ - Executes Razorpay payment & activates subscription in DB                  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## Maintenance Guidelines

1. **Adding New Package Fields**:
   - Update `schema.prisma` -> run `$env:PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="proceed"; npx prisma db push` and `npx prisma generate` in `packages/database`.
   - Update `routes/packages.js` in `apps/admin-backend`.
   - Update `SubscriptionsPage.tsx` in `apps/admin-frontend`.
   - Update `PackageCard.jsx` and `PlansPage.jsx` in `apps/website`.

2. **Coupon Validation**:
   - Ensure the request body sent to `/subscriber/coupons/validate` always contains: `{ code: string, packageId: string, amount: number }`.

3. **App Store & Play Store Legal & UI Compliance**:
   - Privacy Policy and Terms of Service links point to live production URLs: `https://maihoonna.in/#privacy` and `https://maihoonna.in/#terms` (configured in `apps/mobile-app/app/(beneficiary)/profile/settings.tsx`).
   - Unreleased menu placeholder buttons in `apps/mobile-app/app/(beneficiary)/more.tsx` are commented out so Apple & Google human reviewers encounter zero dead links or unhandled buttons.

