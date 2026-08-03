import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import missionIcon from "./assets/mission.png";
import visionIcon from "./assets/vision.png";
import empathyIcon from "./assets/empathy.png";
import connectionIcon from "./assets/connection.png";
import demoVideo from "./assets/Video.mp4";
import heroBg from "./assets/herobg.png";
import appBanner from "./assets/AppBanner.png";
import googlePlayImg from "./assets/googleplay.png";
import appStoreImg from "./assets/appstore.png";
import logo from "./assets/logo.svg";
import healthcareIcon from "./assets/healthcare1.png";
import SaathiPage from "./pages/SaathiPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import { fetchSubscriptionPackages } from "./services/api";
import "./style.css";

const promiseStats = [
  { value: "90 day", label: "wellness loop" },
  { value: "24/7", label: "emergency support" },
  { value: "15K+", label: "families onboarded" },
];

const trustSignals = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "100% BGV Verified",
    text: "Every Care Mitra"
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Geo-fenced Visits",
    text: "Every check-in confirmed"
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    title: "Registered Company",
    text: "Gurugram, India"
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "4.9 / 5 Rating",
    text: "From real families"
  }
];

const impactStats = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    value: "72M+",
    label: "Seniors living alone in India"
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    value: "30M+",
    label: "NRI families away from parents"
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    value: "1 in 3",
    label: "Seniors experience loneliness"
  }
];

const processSteps = [
  {
    title: "Tell us about your family",
    text: "Share your loved one's routine, health conditions, and the kind of support they need.",
  },
  {
    title: "Choose a plan",
    text: "Pick Senior, Pro, or Premium. Adjust any time as your needs evolve.",
  },
  {
    title: "Meet your Care Mitra",
    text: "We match a trained Care Mitra by location, language, gender preference, and specific needs.",
  },
  {
    title: "Visits begin on schedule",
    text: "Care happens at home with vitals, mood, and medication adherence logged each visit.",
  },
  {
    title: "Stay connected from anywhere",
    text: "Family CareOS shares visit history, alerts, trends, and a live Happiness Score.",
  },
];

const services = [
  {
    icon: missionIcon,
    title: "Care Mitra Visits",
    text: "Trained, verified companions who visit on schedule and help with daily wellbeing.",
  },
  {
    icon: empathyIcon,
    title: "Health Network",
    text: "Community volunteers for companionship between Care Mitra visits.",
  },
  {
    icon: visionIcon,
    title: "Legacy Circles",
    text: "A platform for seniors to share decades of expertise and rediscover purpose.",
  },
  {
    icon: connectionIcon,
    title: "Hobby Circles",
    text: "Peer connections built around shared interests like chess, gardening, music, cooking, or fitness.",
  },
];

const visitFeatures = [
  "Real-time family visibility",
  "Multilingual alerts",
  "Vitals trends dashboard",
  "Care happiness score",
  "App and email access",
];

const faqs = [
  "What is a Care Mitra?",
  "How is MaiHoonNa different from hiring a caregiver directly?",
  "What happens if I am not happy with my Care Mitra?",
  "How does the Happiness Score work?",
  "Can I manage care from abroad as an NRI?",
  "Is MaiHoonNa available outside Gurugram?",
  "What does the Saathi Network do?",
  "Can I change or cancel my plan?",
];

const pricingPlans = [
  {
    name: "Saathi Starter",
    description: "For families who want a regular check-in and peace of mind.",
    hours: "10",
    tone: "light",
    features: [
      "Monthly Care Mitra hours",
      "Vitals monitoring (BP, O2, weight)",
      "Medication reminders",
      "Emergency support button",
      "Visit history in Family Connect",
      "WhatsApp alerts to family",
    ],
    muted: ["Mood tracking & Happiness Score", "Saathi Network access"],
  },
  {
    name: "Saathi Plus",
    description: "For loved ones who need more frequent, family-first support.",
    hours: "25",
    tone: "featured",
    badge: "Most Popular",
    features: [
      "Monthly Care Mitra hours",
      "Vitals monitoring (BP, O2, weight)",
      "Medication reminders",
      "Emergency support button",
      "Visit history in Family Connect",
      "WhatsApp alerts to family",
      "Mood tracking & Happiness Score",
    ],
    muted: ["Dedicated Field Manager", "Hospital & lab coordination"],
  },
  {
    name: "Saathi Premium",
    description: "For higher-acuity care needs, wanting maximum coverage.",
    hours: "50",
    tone: "light",
    features: [
      "Monthly Care Mitra hours",
      "Vitals monitoring (BP, O2, weight)",
      "Medication reminders",
      "Emergency support button",
      "Visit history in Family Connect",
      "WhatsApp alerts to family",
      "Mood tracking & Happiness Score",
    ],
  },
];

const comparisonRows = [
  ["Monthly Care Mitra hours", true, true, true],
  ["Vitals monitoring (BP, O2, weight)", true, true, true],
  ["Medication reminders", true, true, true],
  ["Emergency support button", true, true, true],
  ["Visit history in Family Connect", true, true, true],
  ["WhatsApp alerts to family", true, true, true],
  ["Mood tracking & Happiness Score", false, true, true],
  ["Saathi Network access", false, true, true],
  ["Priority rescheduling", false, true, true],
  ["Clinic visit accompaniment", false, true, true],
  ["Dedicated Field Manager", false, false, true],
  ["Hospital & lab coordination", false, false, true],
];

const App = () => {
  const [activePage, setActivePage] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pinCode: "",
    email: "",
  });

  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("mhn_user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("mhn_token") || "");

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedPackageForCheckout, setSelectedPackageForCheckout] = useState(null);
  const [pendingPackageForCheckout, setPendingPackageForCheckout] = useState(null);

  // Live Subscription Packages from API
  const [livePackages, setLivePackages] = useState([]);

  useEffect(() => {
    fetchSubscriptionPackages()
      .then((pkgs) => {
        if (Array.isArray(pkgs) && pkgs.length > 0) {
          setLivePackages(pkgs);
        }
      })
      .catch((err) => console.log("Backend offline or packages endpoint unavailable, falling back to static plans.", err));
  }, []);

  const handleAuthSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    try {
      localStorage.setItem("mhn_user", JSON.stringify(userData));
      localStorage.setItem("mhn_token", tokenData);
    } catch (e) {}

    // If user attempted to buy a package before logging in, proceed to full-page checkout
    if (pendingPackageForCheckout) {
      setSelectedPackageForCheckout(pendingPackageForCheckout);
      setPendingPackageForCheckout(null);
      setActivePage("checkout");
    } else {
      setActivePage("account");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    try {
      localStorage.removeItem("mhn_user");
      localStorage.removeItem("mhn_token");
    } catch (e) {}
    setActivePage("home");
  };

  const handleSelectPackageForBuy = (plan) => {
    if (!token || !user) {
      setPendingPackageForCheckout(plan);
      setActivePage("auth");
    } else {
      setSelectedPackageForCheckout(plan);
      setActivePage("checkout");
    }
  };

  const openForm = () => setIsModalOpen(true);
  const closeForm = () => {
    setIsModalOpen(false);
    setShowSuccess(false);
    setSubmitError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const apiBase = import.meta.env.VITE_API_URL || "";
    const payload = {
      name: formData.name,
      phone: formData.phone,
      pinCode: formData.pinCode,
      email: formData.email,
    };

    try {
      const response = await fetch(`${apiBase}/submit-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({ name: "", phone: "", pinCode: "", email: "" });
        setShowSuccess(true);
        setTimeout(() => {
          closeForm();
        }, 3000);
      } else {
        setSubmitError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please make sure the backend server is running on port 3000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Full-page Views for Auth, Account, and Checkout
  if (activePage === "auth") {
    return <AuthPage onAuthSuccess={handleAuthSuccess} onGoBack={() => setActivePage("home")} />;
  }

  if (activePage === "account") {
    return (
      <AccountPage
        user={user}
        token={token}
        onLogout={handleLogout}
        onNavigateToPlans={() => setActivePage("plans")}
        onGoHome={() => setActivePage("home")}
      />
    );
  }

  if (activePage === "checkout") {
    return (
      <CheckoutPage
        selectedPackage={selectedPackageForCheckout}
        token={token}
        user={user}
        onSuccess={() => setActivePage("account")}
        onGoBack={() => setActivePage("plans")}
      />
    );
  }

  return (
    <div className="site-shell">
      <noscript>
        <div className="noscript">
          MaiHoonNa - India's first connected senior care ecosystem. Please enable JavaScript to use the full site experience.
        </div>
      </noscript>

      <header className="topbar" role="banner">
        <a href="/" aria-label="MaiHoonNa home" className="topbar__brand">
          <img src={logo} alt="MaiHoonNa" />
        </a>
        <nav className="topbar__nav" aria-label="Main navigation">
          <button className={activePage === "home" ? "active" : ""} onClick={() => setActivePage("home")}>Home</button>
          <button className={activePage === "services" ? "active" : ""} onClick={() => setActivePage("services")}>Our Services</button>
          <button className={activePage === "saathi" ? "active" : ""} onClick={() => setActivePage("saathi")}>Saathi Network</button>
        </nav>
        <div className="topbar__actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="view-plan-button" onClick={() => setActivePage("plans")}>View Plans</button>
          
          {user ? (
            <button
              onClick={() => setActivePage("account")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "var(--orange-soft, #fff0e7)",
                color: "var(--orange, #fe6700)",
                fontWeight: "700",
                fontSize: "13px",
                border: "1px solid rgba(254, 103, 0, 0.2)",
                cursor: "pointer",
              }}
            >
              👤 {user.name || "My Account"}
            </button>
          ) : (
            <button
              className="pill-button"
              onClick={() => setActivePage("auth")}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                background: "var(--orange, #fe6700)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Login / Sign Up
            </button>
          )}

          <button className="pill-button pill-button--light" onClick={openForm}>
            Join Waitlist
          </button>
        </div>
      </header>

      {activePage === "home" ? (
        <main>
          <section className="hero" id="home" style={{ backgroundImage: `url(${heroBg})` }}>
            <div className="hero__inner">
              <div className="hero__copy">
                <div className="eyebrow">
                  <img src={healthcareIcon} alt="" />
                  India's connected senior care ecosystem
                </div>
                <h1>
                  We don't just care for your parents.
                  <span>We help them live with purpose.</span>
                </h1>
                <p>
                  Compassionate Care Mitras, a volunteer Saathi Network, real-time family visibility, and a community ecosystem — all in one subscription.
                </p>

                <div className="hero-form" aria-label="Join the waitlist">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <button onClick={openForm}>Join Waitlist</button>
                </div>

                <p className="hero-location">Launching in Gurugram Sectors 54-57 - Limited early access</p>

                <div className="hero-stats" aria-label="MaiHoonNa benefits">
                  <span><strong>100%</strong> BGV-Verified Mitras</span>
                  <span><strong>24/7</strong> Emergency Support</span>
                  <span><strong>NCR</strong> Pilot Underway</span>
                </div>
              </div>

              <div className="hero-card" aria-label="Care status summary">
                <div className="hero-card__top">
                  <div>
                    <span className="status-dot" />
                    <strong>Live Care Mitra Visit</strong>
                  </div>
                  <small>Today 10:30 AM</small>
                </div>

                <div className="hero-card__mitra">
                  <div className="hero-card__mitra-avatar">M</div>
                  <div className="hero-card__mitra-info">
                    <strong>Meena Sharma is here</strong>
                    <small>Care Mitra · 48 min in</small>
                  </div>
                </div>

                <div className="score-panel">
                  <small>Happiness Score</small>
                  <div className="score-panel__value">
                    <strong>82</strong>
                    <span>/100 · Doing great today</span>
                  </div>
                  <div className="score-panel__bar">
                    <div className="score-panel__bar-fill" />
                  </div>
                </div>

                <ul className="mini-list">
                  <li>Background-verified Care Mitras</li>
                  <li>Geo-fenced visit tracking</li>
                  <li>Real-time Family Connect app</li>
                  <li>Registered company, Gurugram</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="video-section">
            <div className="section-heading">
              <span>Our Story</span>
              <h2>
                See Why Families Trust <em>MaiHoonNa</em>
              </h2>
              <p>A 2-minute story about what it means to care — and why we built an entire ecosystem around it.</p>
            </div>

            <div className="video-frame">
              <video src={demoVideo} autoPlay loop muted playsInline />
              <div className="play-button" aria-hidden="true" />
              <p>"Mai Hoon Na - We are here for you."</p>
            </div>

            <div className="trust-row">
              {trustSignals.map((item) => (
                <div className="trust-item" key={item.title}>
                  <div className="trust-item__icon">{item.icon}</div>
                  <div className="trust-item__text">
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="challenge">
            <div className="section-heading">
              <span>The Challenge</span>
              <h2>Growing old shouldn't mean growing lonely</h2>
              <p>
                Millions of seniors in India live alone while their adult children live far away. MaiHoonNa brings human companionship, connected health monitoring, and family transparency into one trusted subscription.
              </p>
            </div>

            <div className="impact-grid">
              {impactStats.map((item) => (
                <div className="impact-card" key={item.value}>
                  <div className="impact-card__icon">{item.icon}</div>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="process">
            <div className="section-heading">
              <span>How It Works</span>
              <h2>From the first call to the first visit</h2>
              <p>Simple, transparent, and human - every step of the way.</p>
            </div>

            <div className="timeline">
              {processSteps.map((step, index) => (
                <div className="timeline__item" key={step.title}>
                  <div className="timeline__number">{index + 1}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="visits" id="services">
            <div className="section-heading">
              <span>Our Ecosystem</span>
              <h2>More than visits</h2>
              <p>A full ecosystem designed to help seniors live with dignity, connection, and joy - not just receive care.</p>
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <img src={service.icon} alt="" />
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <button onClick={openForm}>Learn more</button>
                </article>
              ))}
            </div>

            <div className="nri-banner">
              <div>
                <span>Built for NRI families</span>
                <h2>
                  Built for NRI Families Who Want to Stay <em>Genuinely Involved</em>
                </h2>
                <p>
                  Real-time visit logs, WhatsApp alerts, vitals trends, and a Happiness Score that tells you how your parent is actually feeling today.
                </p>
                <button onClick={openForm}>Join an NRI family</button>
              </div>
              <ul>
                {visitFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Care Mitra Home Visits ── */}
          {/* ── Care Mitra Home Visits ── */}
          <section className="svc-visits">
            <div className="svc-visits__header">
              <div className="svc-visits__heading">
                <span className="svc-visits__eyebrow">Services</span>
                <h2>Care Mitra<br /><em>Home Visits</em></h2>
              </div>
              <p className="svc-visits__desc">
                Your parent's Care Mitra visits on a schedule you set. Every visit is geo-fenced, encounter-tracked, and logged — so you always know what happened, not just that someone showed up.
              </p>
            </div>

            <div className="svc-visits__grid">
              {/* Left: Feature List */}
              <div className="svc-visits__features">

                {/* Active card — Vitals Monitoring */}
                <div className="svc-fcard svc-fcard--active">
                  <div className="svc-fcard__top">
                    <div className="svc-fcard__icon-wrap">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </div>
                    <div className="svc-fcard__info">
                      <div className="svc-fcard__title-row">
                        <strong>Vitals Monitoring</strong>
                        <span className="svc-fcard__badge">Every visit</span>
                      </div>
                      <p className="svc-fcard__sub">Medical-grade logging</p>
                    </div>
                    <span className="svc-fcard__dot svc-fcard__dot--active" />
                  </div>
                  <p className="svc-fcard__detail">
                    BP, O2, temperature, weight — logged with date, time, and location after every single visit. Trends visible on your Family Connect dashboard.
                  </p>
                </div>

                {/* Collapsed cards */}
                {[
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, title: "Medication Adherence", badge: "Automated", sub: "Zero missed doses" },
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, title: "Mood & Happiness Logging", badge: "Real-time alerts", sub: "Feel the difference" },
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 1 0 7.75" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, title: "Clinic Accompaniment", badge: "On request", sub: "Never go alone" },
                ].map((item) => (
                  <div className="svc-fcard" key={item.title}>
                    <div className="svc-fcard__top">
                      <div className="svc-fcard__icon-wrap svc-fcard__icon-wrap--muted">
                        {item.icon}
                      </div>
                      <div className="svc-fcard__info">
                        <div className="svc-fcard__title-row">
                          <strong>{item.title}</strong>
                          <span className="svc-fcard__badge svc-fcard__badge--muted">{item.badge}</span>
                        </div>
                        <p className="svc-fcard__sub">{item.sub}</p>
                      </div>
                      <span className="svc-fcard__dot" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Dashboard mock */}
              <div className="svc-visits__mock">
                <div className="svc-dash">
                  {/* Orange vitals header */}
                  <div className="svc-dash__header">
                    <div className="svc-dash__header-top">
                      <div className="svc-dash__header-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                      </div>
                      <div>
                        <strong>Vitals Monitoring</strong>
                        <span>Medical-grade logging</span>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="svc-dash__metrics">
                      <div className="svc-dash__metric">
                        <small>BP</small>
                        <strong>120/80</strong>
                        <span>Normal</span>
                      </div>
                      <div className="svc-dash__metric">
                        <small>SPO2</small>
                        <strong>98%</strong>
                        <span>Excellent</span>
                      </div>
                      <div className="svc-dash__metric">
                        <small>TEMP</small>
                        <strong>98.4°F</strong>
                        <span>Normal</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Visit Log */}
                  <div className="svc-dash__log">
                    <div className="svc-dash__log-header">
                      <span>RECENT VISIT LOG</span>
                      <span className="svc-dash__auto-sync">
                        <span className="svc-dash__sync-dot" />
                        Auto-synced
                      </span>
                    </div>

                    {[
                      { date: "Today, 10:30 AM", name: "Meena S. · 52 min" },
                      { date: "Yesterday, 9:45 AM", name: "Meena S. · 48 min" },
                      { date: "Mon, 10:10 AM", name: "Meena S. · 55 min" },
                    ].map((visit) => (
                      <div className="svc-dash__visit" key={visit.date}>
                        <div className="svc-dash__avatar">M</div>
                        <div className="svc-dash__visit-info">
                          <strong>{visit.date}</strong>
                          <span>{visit.name}</span>
                        </div>
                        <span className="svc-dash__completed">Completed</span>
                      </div>
                    ))}

                    {/* Geo-fenced note */}
                    <div className="svc-dash__geo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <div>
                        <strong>Geo-fenced &amp; verified</strong>
                        <span>Every visit confirmed within 50m of home address</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="testimonial">
            <div className="section-heading section-heading--dark">
              <span>Testimonials</span>
              <h2>Families Who Trust Us</h2>
            </div>
            <div className="testimonial-card">
              <div className="portrait" />
              <div className="quote">
                <div className="stars" aria-label="5 star rating">+ + + + +</div>
                <blockquote>
                  MaiHoonNa found us a wonderful Care Mitra in just 2 days. She is now like family to my mother. What gave us the most peace of mind was the 24/7 support line - knowing someone is always there, even at 2 AM.
                </blockquote>
                <strong>Ankit Kapoor</strong>
                <small>Family subscriber</small>
              </div>
            </div>
          </section>

          <section className="app-cta">
            <div className="app-cta__content">
              <div className="app-cta__eyebrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                <span>Family Connect App</span>
              </div>
              <h2 className="app-cta__title">
                Stay Connected to Your Parent's World —
                <em>From Anywhere</em>
              </h2>
              <p className="app-cta__desc">
                Real-time visit logs, vitals trends, and a Happiness Score that tells you how your parent is actually feeling today — not just informed after something goes wrong.
              </p>

              <ul className="app-cta__list">
                <li>
                  <div className="app-cta__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  </div>
                  <span>Instant WhatsApp alerts on every visit</span>
                </li>
                <li>
                  <div className="app-cta__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  </div>
                  <span>Live Happiness Score updated after each visit</span>
                </li>
                <li>
                  <div className="app-cta__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <span>Geo-fenced check-ins — know Mitra arrived</span>
                </li>
                <li>
                  <div className="app-cta__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  </div>
                  <span>Access from any time zone, anywhere in the world</span>
                </li>
                <li>
                  <div className="app-cta__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </div>
                  <span>Download care reports as PDFs for doctors</span>
                </li>
              </ul>

              <div className="store-row">
                <a href="#" className="store-badge-card">
                  <img src={googlePlayImg} alt="Get it on Google Play" />
                </a>
                <a href="#" className="store-badge-card">
                  <img src={appStoreImg} alt="Download on the App Store" />
                </a>
              </div>
            </div>

            <div className="phone-mock">
              {/* Card 1: Dark Phone Mockup */}
              <div className="phone-mock__dark">
                <div className="phone-mock__score-card">
                  <small>Happiness Score</small>
                  <strong>82</strong>
                  <span>Feeling great today ✨</span>
                </div>
                <div className="phone-mock__info-list">
                  <div className="phone-mock__info-row">
                    <small>Last visit</small>
                    <strong>Today 10:30 AM</strong>
                  </div>
                  <div className="phone-mock__info-row">
                    <small>Mitra</small>
                    <strong>Meena S.</strong>
                  </div>
                  <div className="phone-mock__info-row">
                    <small>Duration</small>
                    <strong>48 min</strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Floating Bright Orange Alert Card */}
              <div className="phone-mock__orange">
                <div className="phone-mock__alert-header">
                  <span>Live Visit Alert</span>
                </div>
                <div className="phone-mock__bell-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                </div>
                <strong className="phone-mock__alert-title">Meena has arrived</strong>
                <span className="phone-mock__alert-sub">Geo-verified · 10:31 AM</span>
                <div className="phone-mock__vitals-pill">
                  <span>BP: 120/80 · SpO2: 98% · Mood: Happy</span>
                </div>
              </div>
            </div>
          </section>

          <section className="faq">
            <div className="section-heading">
              <span>FAQ</span>
              <h2>Questions we hear often</h2>
              <p>Can't find what you're looking for? Write to us at <a href="mailto:hello@maihoonna.in">hello@maihoonna.in</a></p>
            </div>

            <div className="faq-list">
              {faqs.map((question) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>Our team will help you understand the right care flow, plan, and support model for your family.</p>
                </details>
              ))}
            </div>
          </section>
        </main>
      ) : activePage === "services" ? (
        <main className="services-page">
          {/* ── Services Hero ── */}
          <section className="services-hero">
            <div className="services-hero__inner">
              <div className="services-hero__copy">
                <span>Our Services</span>
                <h1>
                  Everything your loved one needs,
                  <em> delivered at their door.</em>
                </h1>
                <p>
                  Care Mitra home visits, health monitoring, emergency support, and a full family ecosystem — all under one trusted subscription.
                </p>
                <div className="services-hero__actions">
                  <button className="pill-button pill-button--orange" onClick={openForm}>Get Started</button>
                  <button className="pill-button pill-button--ghost" onClick={() => setActivePage("plans")}>View Plans</button>
                </div>
              </div>
              <div className="services-hero__features">
                {[
                  { icon: "🏠", label: "Care Mitra Home Visits" },
                  { icon: "📊", label: "Vitals & Health Monitoring" },
                  { icon: "🚨", label: "24/7 Emergency Support" },
                  { icon: "📱", label: "Family Connect App" },
                  { icon: "😊", label: "Happiness Score" },
                  { icon: "🤝", label: "Saathi Network" },
                ].map((item) => (
                  <div className="services-hero__feature-item" key={item.label}>
                    <span>{item.icon}</span>
                    <strong>{item.label}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Care Mitra Home Visits ── */}
          <section className="svc-visits">
            <div className="svc-visits__inner">

              {/* Col 1: Copy */}
              <div className="svc-visits__copy">
                <span className="svc-visits__eyebrow">Services</span>
                <h2>Care Mitra<br /><em>Home Visits</em></h2>
                <p>Your parent's Care Mitra visits on a schedule you set. Every visit is geo-fenced, encounter-tracked, and logged — so you always know what happened, not just that someone showed up.</p>
              </div>

              {/* Col 2: Tab list */}
              <div className="svc-visits__tabs">
                <div className="svc-tab svc-tab--active">
                  <div className="svc-tab__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  </div>
                  <div className="svc-tab__body">
                    <div className="svc-tab__title-row">
                      <strong>Vitals Monitoring</strong>
                      <span className="svc-tab__badge">Every visit</span>
                    </div>
                    <p className="svc-tab__sub">Medical-grade logging</p>
                    <p className="svc-tab__detail">BP, O2, temperature, weight — logged with date, time, and location after every single visit. Trends visible on your Family Connect dashboard.</p>
                  </div>
                  <span className="svc-tab__dot svc-tab__dot--active" />
                </div>

                <div className="svc-tab">
                  <div className="svc-tab__icon svc-tab__icon--muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <div className="svc-tab__body">
                    <div className="svc-tab__title-row">
                      <strong>Medication Adherence</strong>
                      <span className="svc-tab__badge svc-tab__badge--muted">Automated</span>
                    </div>
                    <p className="svc-tab__sub">Zero missed doses</p>
                  </div>
                  <span className="svc-tab__dot" />
                </div>

                <div className="svc-tab">
                  <div className="svc-tab__icon svc-tab__icon--muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  </div>
                  <div className="svc-tab__body">
                    <div className="svc-tab__title-row">
                      <strong>Mood &amp; Happiness Logging</strong>
                      <span className="svc-tab__badge svc-tab__badge--muted">Real-time alerts</span>
                    </div>
                    <p className="svc-tab__sub">Feel the difference</p>
                  </div>
                  <span className="svc-tab__dot" />
                </div>

                <div className="svc-tab">
                  <div className="svc-tab__icon svc-tab__icon--muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div className="svc-tab__body">
                    <div className="svc-tab__title-row">
                      <strong>Clinic Accompaniment</strong>
                      <span className="svc-tab__badge svc-tab__badge--muted">On request</span>
                    </div>
                    <p className="svc-tab__sub">Never go alone</p>
                  </div>
                  <span className="svc-tab__dot" />
                </div>
              </div>

              {/* Col 3: Dashboard card */}
              <div className="svc-dash-wrap">
                <div className="svc-dash">
                  {/* Orange header */}
                  <div className="svc-dash__header">
                    <div className="svc-dash__header-top">
                      <div className="svc-dash__header-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                      </div>
                      <div>
                        <strong>Vitals Monitoring</strong>
                        <span>Medical-grade logging</span>
                      </div>
                    </div>
                    <div className="svc-dash__metrics">
                      <div className="svc-dash__metric">
                        <small>BP</small>
                        <strong>120/80</strong>
                        <span>Normal</span>
                      </div>
                      <div className="svc-dash__metric">
                        <small>SpO2</small>
                        <strong>98%</strong>
                        <span>Excellent</span>
                      </div>
                      <div className="svc-dash__metric">
                        <small>Temp</small>
                        <strong>98.4°F</strong>
                        <span>Normal</span>
                      </div>
                    </div>
                  </div>

                  {/* Visit log */}
                  <div className="svc-dash__log">
                    <div className="svc-dash__log-header">
                      <span>Recent Visit Log</span>
                      <span className="svc-dash__auto-sync">
                        <span className="svc-dash__sync-dot" />
                        Auto-synced
                      </span>
                    </div>
                    {[
                      { date: "Today, 10:30 AM", name: "Meena S. · 52 min" },
                      { date: "Yesterday, 9:45 AM", name: "Meena S. · 48 min" },
                      { date: "Mon, 10:10 AM", name: "Meena S. · 55 min" },
                    ].map((visit) => (
                      <div className="svc-dash__visit" key={visit.date}>
                        <div className="svc-dash__avatar">M</div>
                        <div className="svc-dash__visit-info">
                          <strong>{visit.date}</strong>
                          <span>{visit.name}</span>
                        </div>
                        <span className="svc-dash__completed">Completed</span>
                      </div>
                    ))}
                    <div className="svc-dash__geo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <div>
                        <strong>Geo-fenced &amp; verified</strong>
                        <span>Every visit confirmed within 50m of home address</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>


          {/* ── Full Ecosystem ── */}
          <section className="svc-ecosystem">
            <div className="section-heading">
              <span>The Ecosystem</span>
              <h2>The full MaiHoonNa ecosystem</h2>
              <p>Every service is connected through the Family Connect App and the Care OS — giving you complete visibility.</p>
            </div>

            <div className="svc-eco-grid">
              {[
                { icon: "📱", title: "Family Connect App", desc: "Real-time visit logs, Happiness Score, WhatsApp alerts, and one-tap support — all in one app.", badge: "Core Product", highlight: true },
                { icon: "🚨", title: "Emergency Response", desc: "One-tap emergency button connects to our 24/7 support team within minutes.", badge: "24/7" },
                { icon: "🩺", title: "Health Monitoring", desc: "Vitals, medication adherence, and mood tracked and shared with family in real time.", badge: null },
                { icon: "👥", title: "Saathi Network", desc: "Trained community volunteers for companionship between Care Mitra visits.", badge: null },
                { icon: "🎯", title: "Legacy Circles", desc: "A platform for seniors to share expertise, mentor others, and rediscover purpose.", badge: null },
                { icon: "♟️", title: "Hobby Circles", desc: "Peer connections built around chess, gardening, music, cooking, or fitness.", badge: null },
              ].map((item) => (
                <article className={`svc-eco-card${item.highlight ? " svc-eco-card--highlight" : ""}`} key={item.title}>
                  {item.badge && <div className="svc-eco-badge">{item.badge}</div>}
                  <span className="svc-eco-icon">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <button onClick={openForm}>Learn more →</button>
                </article>
              ))}
            </div>
          </section>

          {/* ── CTA Banner ── */}
          <section className="svc-cta">
            <div className="svc-cta__inner">
              <span>Get Started Today</span>
              <h2>Ready to bring care home?</h2>
              <p>Join families across Gurugram who trust MaiHoonNa with the people they love most.</p>
              <div className="svc-cta__actions">
                <button className="pill-button pill-button--orange" onClick={openForm}>Join Waitlist</button>
                <button className="pill-button pill-button--ghost-light" onClick={() => setActivePage("plans")}>Register as Caregiver</button>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="faq">
            <div className="section-heading">
              <span>FAQ</span>
              <h2>Questions we hear often</h2>
              <p>Can't find what you're looking for? Write to us at <a href="mailto:hello@maihoonna.in">hello@maihoonna.in</a></p>
            </div>
            <div className="faq-list">
              {faqs.map((question) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>Our team will help you understand the right care flow, plan, and support model for your family.</p>
                </details>
              ))}
            </div>
          </section>
        </main>
      ) : activePage === "saathi" ? (
        <SaathiPage />
      ) : (
        <main className="plans-page">
          <section className="plans-hero">
            <div className="plans-hero__inner">
              <div className="plans-hero__copy">
                <span>Plans</span>
                <h1>
                  Built around hours,
                  <em>not fine print.</em>
                </h1>
                <p>
                  Prepaid hours of in-home care. You always know exactly what you've used and what's left - no surprises, no caps.
                </p>
                <div className="plans-hero__badges">
                  <span>No hidden fees</span>
                  <span>Hours roll over 30 days</span>
                  <span>Cancel anytime</span>
                </div>
              </div>

              <div className="hours-card" aria-label="Your hours always visible">
                <h2>Your hours - always visible</h2>
                {[
                  ["Saathi Starter", "7", "10", "3", "#10b981"],
                  ["Saathi Plus", "18", "25", "7", "#fe6700"],
                  ["Saathi Premium", "31", "50", "19", "#8b45ff"],
                ].map(([name, used, total, remaining, color]) => (
                  <div className="hours-row" key={name}>
                    <div>
                      <strong>{name}</strong>
                      <span>{used} hrs used</span>
                    </div>
                    <small>{used} / {total} hrs used</small>
                    <div className="hours-bar">
                      <span style={{ width: `${(Number(used) / Number(total)) * 100}%`, background: color }} />
                    </div>
                    <em style={{ color }}>{remaining} hrs remaining</em>
                  </div>
                ))}
                <div className="rollover-note">Unused hours roll over for 30 days automatically</div>
              </div>
            </div>
          </section>

          <section className="pricing-section" id="plans">
            <div className="pricing-toolbar">
              <strong>All prices on enquiry - GST applicable</strong>
              <div className="billing-toggle" aria-label="Billing options">
                <button className="active">Monthly</button>
                <button>Quarterly <span>Save 10%</span></button>
                <button>Annual <span>Save 20%</span></button>
              </div>
            </div>

            <div className="plan-grid">
              {(livePackages.length > 0 ? livePackages : pricingPlans).map((plan) => {
                const planName = plan.name;
                const planDesc = plan.description || "Care Mitra visits & family connectivity";
                const basePrice = plan.basePrice || 4999;
                const isFeatured = plan.isPopular || plan.tone === "featured";

                // Highlight top units (hours or visits)
                let topHighlightNum = plan.hoursPerMonth || plan.totalHours || plan.hours;
                let topHighlightUnit = "hrs";

                if (!topHighlightNum && plan.visitsPerWeek) {
                  topHighlightNum = plan.visitsPerWeek;
                  topHighlightUnit = "visits/wk";
                }

                if (!topHighlightNum && Array.isArray(plan.packageBenefits)) {
                  const hourBenefit = plan.packageBenefits.find((pb) => pb.benefit?.name?.toLowerCase().includes("hour"));
                  if (hourBenefit) {
                    topHighlightNum = hourBenefit.unitsIncluded;
                    topHighlightUnit = "hrs";
                  } else {
                    const visitBenefit = plan.packageBenefits.find((pb) => pb.benefit?.name?.toLowerCase().includes("visit"));
                    if (visitBenefit) {
                      topHighlightNum = visitBenefit.unitsIncluded;
                      topHighlightUnit = "visits";
                    }
                  }
                }

                return (
                  <article className={`plan-card ${isFeatured ? "plan-card--featured" : "plan-card--light"}`} key={plan.id || planName}>
                    {(plan.isPopular || plan.badge) && <div className="plan-badge">{plan.badge || "Most Popular"}</div>}
                    <h2>{planName}</h2>
                    <p>{planDesc}</p>
                    
                    <div className="plan-hours">
                      {topHighlightNum ? (
                        <>
                          <strong>{topHighlightNum}</strong>
                          <span>{topHighlightUnit}</span>
                        </>
                      ) : (
                        <>
                          <strong style={{ fontSize: "2rem" }}>₹{basePrice.toLocaleString("en-IN")}</strong>
                          <span>/ mo</span>
                        </>
                      )}
                      <small>₹{basePrice.toLocaleString("en-IN")} / month</small>
                    </div>

                    {/* Render Real Package Benefits from API or Features array */}
                    {Array.isArray(plan.packageBenefits) && plan.packageBenefits.length > 0 ? (
                      <ul>
                        {plan.packageBenefits.map((pb, idx) => {
                          const benefitName = pb.benefit?.name || "Included Benefit";
                          const rawLabel = (pb.benefit?.unitLabel || "").replace(/^per\s+/i, "").trim();
                          const unitText = pb.unitsIncluded ? ` (${pb.unitsIncluded}${rawLabel ? " " + rawLabel : ""})` : "";
                          return <li key={pb.id || idx}>✓ {benefitName}{unitText}</li>;
                        })}
                      </ul>
                    ) : Array.isArray(plan.features) && plan.features.length > 0 ? (
                      <ul>
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>✓ {feature}</li>
                        ))}
                        {plan.muted?.map((feature, idx) => (
                          <li className="muted" key={`muted-${idx}`}>{feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul>
                        <li>✓ Care Mitra Home Visits</li>
                        <li>✓ Vitals Monitoring (BP, SpO2, Weight)</li>
                        <li>✓ Medication Reminders & Schedule</li>
                        <li>✓ 24/7 Emergency Support Line</li>
                        <li>✓ Family Connect Mobile App Access</li>
                      </ul>
                    )}

                    <button
                      onClick={() => handleSelectPackageForBuy(plan)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "var(--orange, #fe6700)",
                        color: "#fff",
                        fontWeight: "700",
                        border: "none",
                        marginTop: "auto",
                        cursor: "pointer",
                      }}
                    >
                      Buy Subscription <span>→</span>
                    </button>
                  </article>
                );
              })}
            </div>

            <p className="pricing-note">
              No hidden caps - No surprise renewals - Plans available monthly, quarterly, and annually - Pricing on enquiry
            </p>

            <div className="comparison">
              <div className="comparison__heading">
                <h2>Full feature comparison</h2>
                <p>Everything side by side, so you can choose with clarity.</p>
              </div>
              <div className="comparison-table" role="table" aria-label="Full feature comparison">
                <div className="comparison-row comparison-row--head" role="row">
                  <span>Feature</span>
                  <strong>Saathi Starter</strong>
                  <strong>Saathi Plus</strong>
                  <strong>Saathi Premium</strong>
                </div>
                {comparisonRows.map(([feature, starter, plus, premium]) => (
                  <div className="comparison-row" role="row" key={feature}>
                    <span>{feature}</span>
                    {[starter, plus, premium].map((included, index) => (
                      <strong className={included ? "included" : "not-included"} key={`${feature}-${index}`}>
                        {included ? "✓" : "-"}
                      </strong>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="bespoke-banner">
              <div>
                <span>Bespoke Plans</span>
                <h2>Bespoke Palliative Plans</h2>
                <p>
                  For families navigating advanced illness. Custom-built hours, specialist Care Mitra matching, and coordinated multi-disciplinary support - designed together with your family.
                </p>
                <ul>
                  <li>Custom hours & schedule</li>
                  <li>Specialist Mitra matching</li>
                  <li>Palliative care coordination</li>
                  <li>Family counselling support</li>
                </ul>
              </div>
              <button onClick={openForm}>Contact Us</button>
            </div>
          </section>

          <section className="quote-section">
            <form className="quote-card" onSubmit={handleSubmit}>
              <h2>Get a personalised quote</h2>
              <p>Tell us which plan interests you and we'll call back within 2 hours with pricing and availability for your area.</p>
              <div className="quote-grid">
                <label>
                  Your name
                  <input name="name" placeholder="Rahul Gupta" value={formData.name} onChange={handleInputChange} />
                </label>
                <label>
                  Phone
                  <input name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} />
                </label>
              </div>
              <div className="plan-pills" aria-label="Interested plan">
                <button type="button">Saathi Starter</button>
                <button type="button">Saathi Plus</button>
                <button type="button">Saathi Premium</button>
                <button type="button">Bespoke</button>
              </div>
              <label>
                Your area
                <input name="pinCode" placeholder="e.g. Gurugram Sector 55" value={formData.pinCode} onChange={handleInputChange} />
              </label>
              <button type="submit" disabled={isSubmitting || showSuccess}>
                {isSubmitting ? "Requesting..." : "Request a Callback"}
              </button>
            </form>
          </section>

          <section className="faq plans-faq">
            <div className="section-heading">
              <span>FAQ</span>
              <h2>Questions we hear often</h2>
              <p>Can't find what you're looking for? Write to us at <a href="mailto:hello@maihoonna.in">hello@maihoonna.in</a></p>
            </div>

            <div className="faq-list">
              {faqs.map((question) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>Our team will help you understand the right care flow, plan, and support model for your family.</p>
                </details>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="MaiHoonNa" />
            <p>
              India's connected senior care ecosystem. Compassionate Care Mitras, Saathi Network, and real-time family visibility — all in one subscription.
            </p>
            
            <div className="social-row">
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="5" ry="5"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              </a>
            </div>

            <div className="footer-store-row">
              <a href="#" className="store-badge-card">
                <img src={googlePlayImg} alt="Get it on Google Play" />
              </a>
              <a href="#" className="store-badge-card">
                <img src={appStoreImg} alt="Download on the App Store" />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div>
              <h3>ABOUT US</h3>
              <a href="#">Our Story</a>
              <a href="#">Mission and Vision</a>
              <a href="#">Leadership Team</a>
              <a href="#">Careers</a>
              <a href="#">Press and Media</a>
              <a href="#">Investors</a>
              <a href="#">Contact Us</a>
            </div>
            <div>
              <h3>SERVICES</h3>
              <a onClick={() => setActivePage("services")} href="#">Care Mitra Visits</a>
              <a onClick={() => setActivePage("services")} href="#">Saathi Network</a>
              <a onClick={() => setActivePage("services")} href="#">Legacy Circles</a>
              <a onClick={() => setActivePage("services")} href="#">Hobby Circles</a>
              <a onClick={() => setActivePage("plans")} href="#">Plans and Pricing</a>
              <a onClick={() => setActivePage("services")} href="#">Become a Partner</a>
            </div>
            <div>
              <h3>TERMS AND POLICIES</h3>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Subscription Terms</a>
              <a href="#">Refund Policy</a>
              <a href="#">Care Mitra Code of Conduct</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Grievance Redressal</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom__left">
            <span>2026 MaiHoonNa Eldercare Private Limited. All rights reserved.</span>
            <small>Pilot area: Gurugram Sectors 54-57, Haryana</small>
          </div>
          <div className="footer-bottom__right">
            <span>Made with <span className="heart-icon">❤️</span> for every Indian family</span>
            <div className="footer-legal-links">
              <a href="#">Privacy</a>
              <span>|</span>
              <a href="#">Terms</a>
              <span>|</span>
              <a href="#">Cookies</a>
              <span>|</span>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Waitlist registration form">
          <div className="modal-card">
            <button onClick={closeForm} className="modal-close" aria-label="Close form">
              x
            </button>

            <h2>Share Your Details</h2>
            <p>Help us understand you better so we can serve you right.</p>

            {showSuccess && (
              <div className="form-message form-message--success">
                Form submitted successfully. We'll get back to you soon.
              </div>
            )}

            {submitError && (
              <div className="form-message form-message--error">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="waitlist-form" aria-label="Waitlist registration">
              <input
                id="form-name"
                type="text"
                name="name"
                placeholder="Full Name"
                required
                aria-label="Full Name"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
              />

              <input
                id="form-phone"
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                required
                aria-label="Mobile Number"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
              />

              <input
                id="form-pincode"
                type="text"
                name="pinCode"
                placeholder="Pin Code"
                required
                aria-label="Pin Code"
                autoComplete="postal-code"
                value={formData.pinCode}
                onChange={handleInputChange}
                pattern="[0-9]{6}"
                maxLength={6}
                title="Enter a valid 6-digit pin code"
              />

              <input
                id="form-email"
                type="email"
                name="email"
                placeholder="Email Address"
                required
                aria-label="Email Address"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
              />

              <button type="submit" disabled={isSubmitting || showSuccess}>
                {isSubmitting ? "Submitting..." : showSuccess ? "Done" : "Submit Details"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
