import { useEffect } from "react";

/**
 * Page-by-page SEO Metadata Configuration Map
 */
const SEO_CONFIG = {
  home: {
    title: "MaiHoonNa | Connected Senior Care & Elder Companionship Platform",
    description:
      "MaiHoonNa provides senior companionship, health monitoring, emotional wellness support, medication adherence tracking, and connected family care for elderly individuals in India.",
    canonical: "https://maihoonna.in/",
    robots: "index, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "MaiHoonNa Eldercare Private Limited",
        "url": "https://maihoonna.in",
        "logo": "https://maihoonna.in/logo.svg",
        "description":
          "India's connected senior care ecosystem — blending human companionship with smart healthcare technology.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Gurugram Sectors 54-57",
          "addressLocality": "Gurugram",
          "addressRegion": "Haryana",
          "addressCountry": "IN"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "info@maihoonna.in",
          "contactType": "customer service"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "MaiHoonNa",
        "url": "https://maihoonna.in",
        "description":
          "MaiHoonNa is India's first connected senior care ecosystem. We keep your parents safe, healthy, and emotionally fulfilled."
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is a Care Mitra?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Our team will help you understand the right care flow, plan, and support model for your family."
            }
          },
          {
            "@type": "Question",
            "name": "How is MaiHoonNa different from hiring a caregiver directly?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Our team will help you understand the right care flow, plan, and support model for your family."
            }
          },
          {
            "@type": "Question",
            "name": "Can I manage care from abroad as an NRI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Our team will help you understand the right care flow, plan, and support model for your family."
            }
          }
        ]
      }
    ]
  },

  services: {
    title: "Senior Care Services & Elderly Health Monitoring | MaiHoonNa",
    description:
      "Explore MaiHoonNa's senior care services in India: Care Mitra visits, vitals monitoring, medication adherence tracking, clinic accompaniment, and emergency response.",
    canonical: "https://maihoonna.in/",
    robots: "index, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Senior Home Care & Vitals Monitoring",
        "provider": {
          "@type": "Organization",
          "name": "MaiHoonNa",
          "url": "https://maihoonna.in"
        },
        "areaServed": {
          "@type": "Country",
          "name": "India"
        },
        "description":
          "In-home senior care including vitals tracking, prescription-linked medication reminders, mood logging, clinic accompaniment, and 24/7 emergency alert chain."
      }
    ]
  },

  saathi: {
    title: "Saathi Network | Senior Companionship & Volunteer Support | MaiHoonNa",
    description:
      "Connect your elderly parents with verified Saathi community companions for meaningful conversations, walks, hobbies, and loneliness support across India.",
    canonical: "https://maihoonna.in/",
    robots: "index, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Elderly Companionship & Volunteer Support",
        "provider": {
          "@type": "Organization",
          "name": "MaiHoonNa",
          "url": "https://maihoonna.in"
        },
        "description":
          "Community companionship program connecting verified volunteers with senior citizens for social interactions, walks, hobby sharing, and loneliness relief."
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who can become a Saathi volunteer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Anyone aged 18 and above with empathy, a commitment to senior care, and clean background records can apply. We welcome college students, working professionals, homemakers, and active retirees looking to make a meaningful difference."
            }
          },
          {
            "@type": "Question",
            "name": "How does the background verification (BGV) process work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "We perform an Aadhaar-linked identity verification, criminal record background check, and contact two personal/professional references. Approval usually takes 3 to 5 working days before your first senior visit."
            }
          },
          {
            "@type": "Question",
            "name": "Are Saathi volunteers paid, or how are rewards earned?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Saathis are community volunteers. For every verified hour spent with a senior, you earn Saathi Credit Points. Points can be redeemed for brand vouchers, merchandise, volunteer certificates for resumes, or donated to senior wellness funds."
            }
          },
          {
            "@type": "Question",
            "name": "How are visit locations and seniors assigned to me?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Saathis are paired with seniors residing in their local area or sector (typically within a 3–5 km radius). Matching considers shared languages, hobbies, and your selected weekly availability schedule."
            }
          }
        ]
      }
    ]
  },

  plans: {
    title: "Senior Care Plans & Pricing | Transparent Elder Care | MaiHoonNa",
    description:
      "Transparent senior care subscription plans built around prepaid hours with 30-day rollover, no hidden fees, and full family connect app access for NRI families.",
    canonical: "https://maihoonna.in/",
    robots: "index, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "OfferCatalog",
        "name": "MaiHoonNa Senior Care Plans",
        "url": "https://maihoonna.in/",
        "numberOfItems": 3,
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Saathi Starter Plan",
            "description": "Essential senior companionship and parameter logging hours."
          },
          {
            "@type": "Offer",
            "name": "Saathi Plus Plan",
            "description": "Comprehensive elderly home visits with vitals and medication adherence."
          },
          {
            "@type": "Offer",
            "name": "Saathi Premium Plan",
            "description": "Full senior care ecosystem support with priority emergency response."
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is a Care Mitra?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Our team will help you understand the right care flow, plan, and support model for your family."
            }
          },
          {
            "@type": "Question",
            "name": "How does the Happiness Score work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Our team will help you understand the right care flow, plan, and support model for your family."
            }
          }
        ]
      }
    ]
  },

  auth: {
    title: "Sign Up & Login | MaiHoonNa Senior Care",
    description:
      "Sign up or log in to MaiHoonNa to access family connect dashboard, manage parent care, and track companion visits.",
    canonical: "https://maihoonna.in/",
    robots: "noindex, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg"
  },

  account: {
    title: "My Account Dashboard | MaiHoonNa",
    description:
      "Manage active senior care subscriptions, view visit logs, and update parent care details.",
    canonical: "https://maihoonna.in/",
    robots: "noindex, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg"
  },

  checkout: {
    title: "Complete Subscription | MaiHoonNa",
    description:
      "Securely finalize senior care plan subscription for your parents.",
    canonical: "https://maihoonna.in/",
    robots: "noindex, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg"
  },

  "not-found": {
    title: "Page Not Found (404) | MaiHoonNa Senior Care",
    description:
      "The requested page does not exist on MaiHoonNa. Explore our senior care services, Saathi network, and subscription plans.",
    canonical: "https://maihoonna.in/",
    robots: "noindex, follow",
    ogType: "website",
    ogImage: "https://maihoonna.in/og-image.jpg"
  }
};

/**
 * SeoHead Component - Dynamic Metadata & Schema Manager
 */
const SeoHead = ({ activePage = "home" }) => {
  useEffect(() => {
    const config = SEO_CONFIG[activePage] || SEO_CONFIG.home;

    // 1. Update Document Title
    document.title = config.title;

    // 2. Helper to set or create meta element
    const setMeta = (selector, attribute, attrName, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, attrName);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 3. Update Standard Meta Tags
    setMeta('meta[name="description"]', "name", "description", config.description);
    setMeta('meta[name="robots"]', "name", "robots", config.robots);

    // 4. Update Open Graph Meta Tags
    setMeta('meta[property="og:title"]', "property", "og:title", config.title);
    setMeta('meta[property="og:description"]', "property", "og:description", config.description);
    setMeta('meta[property="og:url"]', "property", "og:url", config.canonical);
    setMeta('meta[property="og:type"]', "property", "og:type", config.ogType || "website");
    setMeta('meta[property="og:image"]', "property", "og:image", config.ogImage);

    // 5. Update Twitter Card Meta Tags
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", config.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", config.description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", config.ogImage);
    setMeta('meta[name="twitter:url"]', "name", "twitter:url", config.canonical);

    // 6. Update Canonical Link Element (points to clean root canonical https://maihoonna.in/)
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", config.canonical);

    // 7. Inject / Update Dynamic JSON-LD Structured Data
    const existingScript = document.getElementById("mhn-dynamic-jsonld");
    if (existingScript) {
      existingScript.remove();
    }

    if (Array.isArray(config.schemas) && config.schemas.length > 0) {
      const script = document.createElement("script");
      script.id = "mhn-dynamic-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": config.schemas
      });
      document.head.appendChild(script);
    }
  }, [activePage]);

  return null;
};

export default SeoHead;
