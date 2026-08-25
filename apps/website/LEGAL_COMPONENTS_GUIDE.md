# MaiHoonNa Legal Components Integration Guide

This guide explains how to use **`LegalPage.jsx`** and **`LegalModal.jsx`** in the future, how they differ, and which one to choose if you only want to keep a single implementation.

---

## 1. Component Overview

| Component | File Path | Type | Best Used For |
| :--- | :--- | :--- | :--- |
| **`LegalPage.jsx`** | `apps/website/src/pages/LegalPage.jsx` | Full Webpage | Dedicated routing (`/#terms`, `/#privacy`), mobile app redirects, footer links, and SEO |
| **`LegalModal.jsx`** | `apps/website/src/components/modals/LegalModal.jsx` | Popup Modal Dialog | In-flow reviews during signup/checkout without navigating away from the form |

Both components contain identical, legally compliant copy for:
1. **Terms of Service** (`terms`)
2. **Privacy Policy** (`privacy`)
3. **Refund & Cancellation Policy** (`refund`)
4. **Cookie Policy** (`cookie`)

---

## 2. Recommendation: Which One to Keep?

### **Recommended: Keep `LegalPage.jsx`**
If you want **one single unified solution**, keep **`LegalPage.jsx`** and remove **`LegalModal.jsx`**.

**Why `LegalPage.jsx` is preferred:**
- Handles external links directly (e.g., when the mobile app opens `https://maihoonna.in/#privacy`).
- Works seamlessly with the site header, footer, and back-to-home breadcrumbs.
- Avoids mobile viewport modal clipping and nested scrollbar issues.
- Provides direct bookmarkable URLs for search engines and compliance audits.

---

## 3. How to Activate `LegalPage.jsx` (Standalone Page Route)

To enable `/#terms`, `/#privacy`, `/#refund-policy`, and `/#cookie-policy` as full pages on the website:

### Step 1: Update [`App.jsx`](file:///c:/Users/91930/OneDrive/Desktop/Mai-Hoonaa/apps/website/src/App.jsx)

1. Import `LegalPage`:
```javascript
import LegalPage from "./pages/LegalPage";
```

2. Add legal routes to `validPages` inside `getPageFromHash()`:
```javascript
const getPageFromHash = () => {
  const rawHash = (window.location.hash || "").replace("#", "").toLowerCase();
  if (!rawHash) return "home";

  // Legal routes
  if (["terms", "privacy", "refund-policy", "cookie-policy"].includes(rawHash)) {
    return rawHash;
  }

  const validPages = ["home", "services", "saathi", "plans", "auth", "account", "checkout", "story"];
  return validPages.includes(rawHash) ? rawHash : "not-found";
};
```

3. Render `LegalPage` inside `renderAppContent()`:
```javascript
{["terms", "privacy", "refund-policy", "cookie-policy"].includes(activePage) ? (
  <LegalPage initialTab={activePage} setActivePage={setActivePage} />
) : activePage === "home" ? (
  <HomePage openForm={openForm} />
) : ...
```

---

## 4. How to Activate `LegalModal.jsx` (In-Place Popup Modal)

If you instead want a popup overlay on the signup page (`AuthPage.jsx`):

### Step 1: Update [`AuthPage.jsx`](file:///c:/Users/91930/OneDrive/Desktop/Mai-Hoonaa/apps/website/src/pages/AuthPage.jsx)

1. Import `LegalModal`:
```javascript
import LegalModal from "../components/modals/LegalModal";
```

2. Add state inside `AuthPage`:
```javascript
const [legalModal, setLegalModal] = useState({ isOpen: false, tab: "terms" });
```

3. Connect the links in the consent label:
```javascript
<a
  href="#terms"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setLegalModal({ isOpen: true, tab: "terms" });
  }}
  style={{ color: "var(--orange, #fe6700)", fontWeight: "700", textDecoration: "underline" }}
>
  Terms of Service
</a>
```

4. Render the modal before closing the component:
```javascript
<LegalModal
  isOpen={legalModal.isOpen}
  initialTab={legalModal.tab}
  onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
  onAccept={() => setConsentGiven(true)}
/>
```

---

## 5. How to Safely Remove the Unused File

When you decide which one you want:

- **If keeping `LegalPage.jsx`**: Delete `apps/website/src/components/modals/LegalModal.jsx`.
- **If keeping `LegalModal.jsx`**: Delete `apps/website/src/pages/LegalPage.jsx`.

Neither file is imported in the production bundle right now, so having both present in the codebase causes zero build errors or runtime overhead until you choose to wire them up.
