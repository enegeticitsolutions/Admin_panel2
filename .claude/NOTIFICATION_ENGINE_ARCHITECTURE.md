# Omnichannel Notification Engine Architecture & Integration Guide

## 1. Executive Summary & Architectural Goals

The MaiHoonNa Notification Engine is a production-grade, enterprise-decoupled notification system designed to support **Omnichannel Messaging** (WhatsApp via MSG91, In-App Lock-Screen Push via Expo/FCM, SMS, and Email).

### Core Architectural Principles
1. **Zero Blast Radius**: Notification dispatching is 100% asynchronous and fail-safe. Network errors, invalid phone numbers, or third-party API outages (MSG91/Expo) will never crash core database transactions or block API HTTP responses.
2. **Single Responsibility Principle (SRP)**: Core controllers (payments, visits, staff assignment) emit clean semantic domain calls (e.g., `dispatchVisitScheduled(target, variables)`). They have zero knowledge of third-party templates, vendor APIs, or JSON payload structures.
3. **Type-Safe Registry Pattern**: All 63 business events are registered in a central registry mapping event keys to MSG91 template IDs, namespaces, and mandatory variable schemas.
4. **Omnichannel Targeting**: A single dispatcher call simultaneously triggers WhatsApp messages and Expo/FCM In-App Push notifications.

---

## 2. Package Architecture (`packages/notifications`)

The notification SDK resides in the monorepo workspace at `packages/notifications`.

### Key Files:
- **`src/registry/whatsapp.registry.ts`**: Contains the full mapping of all 63 business events (e.g., `OTP_VERIFICATION`, `SUBSCRIPTION_ACTIVATED`, `VISIT_SCHEDULED`, `RENEWAL_PAYMENT_LINK`, `CC_ASSIGNED`, `LAB_TEST_SCHEDULED`, `EMERGENCY_TRIGGERED`).
  ```typescript
  export interface WhatsAppTemplateConfig {
    templateName: string;
    namespace: string;
    language: string;
    variables: string[];
  }
  ```
- **`src/services/notification.service.ts`**: Encapsulates HTTP calls to MSG91 outbound bulk WhatsApp endpoint (`https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/`). Reads `MSG91_AUTH_KEY` and `MSG91_INTEGRATED_NUMBER` from environment variables.
- **`src/index.ts`**: Exports the singleton instance `notificationService`.

---

## 3. Backend Dispatcher Layer (`apps/admin-backend/services/notification.dispatcher.js`)

To prevent controllers from being bloated with payload formatting, all backend notification dispatches route through `notification.dispatcher.js`.

### Target Normalization
The dispatcher accepts a flexible `target` parameter:
- **String (`phone`)**: Triggers WhatsApp notification only.
- **Object (`{ phone, userId }`)**: Triggers **both** WhatsApp message AND Expo Lock-Screen Push notification in parallel.

```javascript
const { notificationService } = require('@maihoonna/notifications');
const { notifyUser } = require('./notifications');
const { prisma } = require('../lib/prisma');
```

### Supported Dispatcher Methods:
1. **`dispatchPaymentLinkGenerated(target, variables)`**
   - WhatsApp Event: `RENEWAL_PAYMENT_LINK`
   - In-App Push: `💳 Renewal Payment Link` (Deep link: `/payments`)
2. **`dispatchPaymentSuccessful(target, variables)`**
   - WhatsApp Events: `PAYMENT_SUCCESSFUL` + `SUBSCRIPTION_ACTIVATED`
   - In-App Push: `✅ Payment Successful` (Deep link: `/subscriptions`)
3. **`dispatchVisitScheduled(target, variables)`**
   - WhatsApp Event: `VISIT_SCHEDULED`
   - In-App Push: `📅 Care Visit Scheduled` (Deep link: `/schedule`)
4. **`dispatchCareCompanionAssigned(target, variables)`**
   - WhatsApp Event: `CC_ASSIGNED`
   - In-App Push: `🤝 Care Companion Assigned` (Deep link: `/care-team`)

---

## 4. Integrated Backend Controllers & Call Sites

### A. Payment Link Generation
- **File**: `apps/admin-backend/modules/payments/payment.service.js`
- **Hook**: Inside `generatePaymentLink()`
- **Invocation**:
  ```javascript
  dispatchPaymentLinkGenerated(subscriberPhone, {
    beneficiaryName: beneficiaryId ? 'your beneficiary' : 'you',
    packageName: packageName || resolvedPackageType,
    paymentLink: paymentLinkUrl
  });
  ```

### B. Payment Webhook Success & Subscription Activation
- **File**: `apps/admin-backend/modules/payments/payment.repository.js`
- **Hook**: Inside `markPaymentSuccessfulTransaction()` after `prisma.$transaction` commits
- **Invocation**:
  ```javascript
  if (existing.subscriber) {
    dispatchPaymentSuccessful(
      { phone: existing.subscriber.phone, userId: existing.subscriberId },
      {
        amount: existing.amountPaid.toString(),
        beneficiaryName: existing.beneficiary ? existing.beneficiary.name : 'you',
        packageName: existing.packageType,
        isSubscriptionActive: !!existing.subscriptionId,
        subscriberName: existing.subscriber.name || 'Subscriber',
        startDate: paidAt.toLocaleDateString(),
      }
    );
  }
  ```

### C. Visit Scheduling
- **File**: `apps/admin-backend/routes/visits.js`
- **Hook**: `POST /api/visits` route after visit creation transaction
- **Invocation**:
  ```javascript
  dispatchVisitScheduled(
    { phone: subscriberUser.phone, userId: subscriberUser.id },
    {
      ccName: result.careCompanion?.name || 'Your Care Companion',
      beneficiaryName: result.beneficiary?.name || 'the beneficiary',
      date: formattedDate,
      time: formattedTime,
      address: 'the registered address',
    }
  );
  ```

### D. Staff / Care Companion Assignment
- **File**: `apps/admin-backend/routes/beneficiaries.js`
- **Hook**: `PUT /api/beneficiaries/:id/assign-staff` route
- **Invocation**:
  ```javascript
  dispatchCareCompanionAssigned(
    { phone: beneficiary.subscriber.phone, userId: beneficiary.subscriberId },
    {
      ccName: newPrimaryCC.name || 'Your Care Companion',
      beneficiaryName: beneficiary.name || 'your beneficiary',
      primaryOrSecondary: 'Primary'
    }
  );
  ```

---

## 5. Lock-Screen Push Notification Pipeline (`apps/mobile-app`)

### Client-side Registration (`apps/mobile-app/services/notifications.ts`)
1. On app launch/login (`_layout.tsx`), `registerForPushNotifications()` is invoked.
2. Prompts user for OS Push permissions (iOS APNs / Android FCM).
3. Obtains Expo Push Token (`ExponentPushToken[...]`).
4. Syncs token to backend via `POST /shared/users/push-token`.

### Database Storage
- User record in Prisma database (`packages/database/prisma/schema.prisma`):
  `User.fcmToken` stores the Expo Push Token.

### Push Dispatch (`apps/admin-backend/services/notifications.js`)
- `notifyUser(tx, { userId, title, body, data })`:
  1. Creates DB record in `Notification` table for in-app bell tray history.
  2. Queries `User.fcmToken`.
  3. Sends HTTP POST payload to `https://exp.host/--/api/v2/push/send`.

---

## 6. How to Extend for Future Features

### Adding a New WhatsApp Template:
1. Add template entry to `WHATSAPP_TEMPLATES` in `packages/notifications/src/registry/whatsapp.registry.ts`.
2. Add a helper function in `apps/admin-backend/services/notification.dispatcher.js`.
3. Call the helper from the relevant controller/route.

### Adding SMS or Email Channels:
1. Extend `NotificationRequest` interface in `packages/notifications/src/services/notification.service.ts` to include `channel: 'sms' | 'email'`.
2. Implement SMS (e.g., MSG91 SMS API) or Email (e.g., SendGrid / AWS SES) strategy method inside `NotificationService`.
3. In `notification.dispatcher.js`, include the new channel call inside the corresponding `dispatch...()` function.
