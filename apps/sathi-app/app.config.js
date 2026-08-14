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
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || config.ios?.config?.googleMapsApiKey,
      },
    },

    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || config.android?.config?.googleMaps?.apiKey,
        },
      },
    },

    // ── Bake env vars into the bundle so they work in ALL Expo environments ───
    // (Expo Go dev builds, EAS preview APKs, and production builds)
    // Read in checkout.tsx via: Constants.expoConfig?.extra?.razorpayKeyId
    extra: {
      ...config.extra,
      razorpayKeyId,
      eas: {
        projectId: "dfb5a3f3-6dfe-47b6-8418-df1bd2e27bc3"
      }
    },
  };
};

