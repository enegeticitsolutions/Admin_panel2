/**
 * Site-wide Hyperlinks and Configuration
 * Centralized links for social media, app store downloads, contact info, and site policies.
 */
export const SITE_LINKS = {
  // Social Media Channels
  social: {
    instagram: "https://www.instagram.com/maihoonna_eldercare/",
    twitter: "https://x.com/MaihoonnaElderC",
    facebook: "https://www.facebook.com/maihoonnaeldercare",
    youtube: "https://youtube.com/@maihoonna",
    linkedin: "https://www.linkedin.com/company/maihoonna-eldercare-private-limited/?viewAsMember=true",
  },

  // Mobile App Download Links
  appStore: {
    googlePlay: "https://play.google.com/store/apps/details?id=com.rajeev_23.maihoonna",
    appleAppStore: "https://apps.apple.com/app/maihoonna/id1234567890",
  },

  // Contact Info
  contact: {
    email: "info@maihoonna.in",
    phone: "+91 98765 43210",
    supportEmail: "support@maihoonna.in",
    address: "Gurugram Sectors 53 to 57, Haryana, India",
  },

  // About Us Links
  about: [
    { label: "Our Story", page: "story" },
    // { label: "Mission and Vision", page: "story" },
    // { label: "Leadership Team", href: "#team" },
    // { label: "Careers", href: "#careers" },
    // { label: "Press and Media", href: "#press" },
    // { label: "Investors", href: "#investors" },
    { label: "Contact Us", href: "mailto:info@maihoonna.in" },
  ],

  // Services Links
  services: [
    { label: "Care Mitra Visits", page: "services" },
    { label: "Saathi Network", page: "saathi" },
    // { label: "Legacy Circles", page: "services" },
    // { label: "Hobby Circles", page: "services" },
    { label: "Plans and Pricing", page: "plans" },
    // { label: "Become a Partner", href: "#partner" },
  ],

  // Legal & Terms Policies
  policies: [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    // { label: "Subscription Terms", href: "#subscription-terms" },
    { label: "Refund Policy", href: "#refund-policy" },
    // { label: "Care Mitra Code of Conduct", href: "#code-of-conduct" },
    { label: "Cookie Policy", href: "#cookie-policy" },
    // { label: "Grievance Redressal", href: "#grievance" },
  ],

  // Footer Bottom Legal Links
  footerLegal: [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Cookies", href: "#cookie-policy" },
    { label: "Sitemap", href: "#sitemap" },
  ],
};

export default SITE_LINKS;
