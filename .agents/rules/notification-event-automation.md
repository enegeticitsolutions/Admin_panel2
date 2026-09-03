# Notification Event Trigger & Template Integration Rule

> **Scope**: Omnichannel Notification Microservice (`@maihoonna/notifications`, Redis Streams, MSG91 WhatsApp Gateway)  
> **Audience**: AI Agents (Antigravity, Cursor, Copilot, Claude) and Developers  
> **Trigger Prompt Pattern**: When a developer references a code location (e.g. `@[path/to/file.tsx:L123]`) and provides an MSG91 WhatsApp template JSON or cURL.

---

## 1. Objective & Behavioral Protocol

When a developer provides:
1. **A code reference** marking where a business event occurs (e.g. Checkout payment completed, Visit scheduled, Subscription renewed).
2. **An MSG91 WhatsApp Outbound Template JSON / cURL** payload.

You (the AI agent / developer) must autonomously execute the standardized 4-step integration pipeline without requiring additional back-and-forth prompt clarifications.

---

## 2. Standard 4-Step Execution Pipeline

```
┌───────────────────────────────┐
│ 1. Parse MSG91 Template JSON  │ ➔ Extract template name & body_1, body_2...
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ 2. Register in whatsapp.reg.. │ ➔ packages/notifications/src/registry/whatsapp.registry.ts
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ 3. Inject Producer Trigger    │ ➔ notificationProducer.publish() at event source
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ 4. Verify Stream & Worker     │ ➔ Fast XADD (< 2ms) ➔ Worker Daemon dispatches to MSG91
└───────────────────────────────┘
```

---

### Step 1: Parse the MSG91 Template Payload

From the provided cURL / JSON, extract:
- **`template.name`**: The exact slug approved in MSG91 (e.g., `"payment_success"`, `"visit_scheduled"`).  
  *(⚠️ Note: Slug must match character-for-character including underscores).*
- **`template.language.code`**: Usually `"en"`.
- **`components`**: Map `body_1`, `body_2`, `body_3`, etc., to meaningful business variable names based on the context of the event (e.g., `body_1` -> `amount`, `body_2` -> `beneficiaryName`, `body_3` -> `packageName`).

---

### Step 2: Register Template in `@maihoonna/notifications`

Open `packages/notifications/src/registry/whatsapp.registry.ts`:

1. Define or update the event key in `WhatsAppRegistry`:
   ```typescript
   export const WhatsAppRegistry: Record<string, WhatsAppTemplateConfig> = {
     // ... existing events
     PAYMENT_SUCCESS: {
       template: 'payment_success', // Exact slug from MSG91
       body: ['amount', 'beneficiaryName', 'packageName'], // Ordered exactly for body_1, body_2, body_3
     },
   };
   ```

> [!IMPORTANT]
> The order of string keys in the `body` array **strictly dictates** the index mapping:
> - `body[0]` ➔ `body_1`
> - `body[1]` ➔ `body_2`
> - `body[2]` ➔ `body_3`

---

### Step 3: Trigger the Event via `notificationProducer`

#### Location Architecture Rules:
- **Backend First (Recommended)**: If the marked code is in a frontend screen (such as `apps/mobile-app/app/(setup)/checkout.tsx`), find the corresponding backend controller or service endpoint that processes/verifies the action (e.g. `apps/api/app/api/subscriber/subscriptions.routes.ts` or `subscription_service.ts`). Triggering from the backend ensures security, prevents client-side tampering, and guarantees execution even if the user closes the app immediately.
- **Frontend / Client Trigger (When Explicitly Requested)**: If explicitly triggered from an app endpoint, route through the authorized API layer.

#### Trigger Implementation Snippet:
```typescript
import { notificationProducer } from '@maihoonna/notifications';

// Execute non-blocking Redis Streams XADD (< 2ms)
await notificationProducer.publish({
  idempotencyKey: `payment-${paymentId || orderId}-success`, // Prevents duplicate WhatsApp alerts
  channel: 'whatsapp',
  event: 'PAYMENT_SUCCESS', // Must match the key in WhatsAppRegistry
  recipient: {
    phone: subscriberPhone, // Formats automatically to E.164 (e.g. '919876543210')
  },
  variables: {
    amount: String(paidAmount),
    beneficiaryName: beneficiary.name,
    packageName: selectedPackage.name,
  },
});
```

---

### Step 4: Verification & Diagnostic Checklist

1. **Redis Streams Ingestion**:
   - Ensure the event is enqueued to `stream:notifications:whatsapp`.
   - Idempotency key guarantees no duplicate message if retried within 60 seconds.
2. **Worker Daemon**:
   - Ensure worker is running:
     ```bash
     npm run dev:notifications
     ```
   - Worker log output will show:
     ```
     [NotificationConsumer] Processing WHATSAPP [PAYMENT_SUCCESS] (ID: 172535...-0)
     ✅ [NotificationConsumer] Successfully delivered PAYMENT_SUCCESS to 919876543210
     ```
3. **Dead Letter Queue (DLQ)**:
   - If MSG91 fails (e.g. invalid phone number or unapproved template slug), worker retries up to 5 times before moving to `stream:notifications:dlq`.

---

## 3. Minimal Developer Input Example

To trigger this entire flow in any future conversation, the developer simply needs to send:

> **Event Location**: `@[apps/mobile-app/app/(setup)/checkout.tsx:L669]`  
> **Template**:
> ```json
> {
>   "integrated_number": "918527070049",
>   "content_type": "template",
>   "payload": {
>     "messaging_product": "whatsapp",
>     "type": "template",
>     "template": {
>       "name": "payment_success",
>       "language": { "code": "en", "policy": "deterministic" },
>       "namespace": "bf28acb3_8719_4168_9ed4_bc225dcfe30d",
>       "to_and_components": [
>         {
>           "to": ["<phone_number>"],
>           "components": {
>             "body_1": { "type": "text", "value": "1999" },
>             "body_2": { "type": "text", "value": "Ramesh Kumar" },
>             "body_3": { "type": "text", "value": "Silver Plan" }
>           }
>         }
>       ]
>     }
>   }
> }
> ```
