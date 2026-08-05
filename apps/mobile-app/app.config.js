export default ({ config }) => {
  // ── Razorpay key resolution ─────────────────────────────────────────────────
  // Strip any accidental surrounding quotes that some .env parsers leave in.
  const rawRazorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
  const razorpayKeyId = rawRazorpayKey.replace(/^["']|["']$/g, '').trim();

  return {
    ...config,

    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || config.ios?.config?.googleMapsApiKey,
      },
    },

    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || config.android?.config?.googleMaps?.apiKey,
        },
      },
    },

    // ── Bake env vars into the bundle so they work in ALL Expo environments ───
    // (Expo Go dev builds, EAS preview APKs, and production builds)
    extra: {
      ...config.extra,
      razorpayKeyId,
      firebase: {
        projectNumber: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER || "1024621796653",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "maihoonna-999af",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "maihoonna-999af.firebasestorage.app",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1024621796653:android:468a40329e2f9066fc07a4",
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAgQPAScwUnUfSLcehCRwyhsVQFSlesaCQ",
      },
    },
  };
};

