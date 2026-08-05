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
import piccImg from "./assets/picc.png";
import SaathiPage from "./pages/SaathiPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import PlansPage from "./pages/PlansPage";
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
    text: "Share your loved one's routine, health conditions, and the kind of support they need. Takes less than 5 minutes.",
  },
  {
    title: "Choose a plan",
    text: "Pick Starter, Plus, or Premium. Adjust any time as your needs evolve.",
  },
  {
    title: "Meet your Care Mitra",
    text: "We match a BGV-verified Care Mitra by location, language, gender preference, and specific needs.",
  },
  {
    title: "Visits begin on schedule",
    text: "Geo-fenced check-ins confirm every visit. Vitals, mood, and medication adherence logged each time.",
  },
  {
    title: "Stay connected from anywhere",
    text: "Family Connect shows visit history, vitals trends, and a live Happiness Score – from any time zone.",
  },
];

const services = [
  {
    emoji: "🤝",
    title: "Care Mitra Visits",
    text: "Trained, verified companions who visit on schedule and log everything in real time – vitals, mood, medication, and daily tasks.",
  },
  {
    emoji: "🌸",
    title: "Saathi Network",
    text: "Community volunteers for companionship between Care Mitra visits. No senior should feel alone between scheduled visits.",
  },
  {
    emoji: "🏆",
    title: "Legacy Circles",
    text: "A platform for seniors to share decades of expertise and rediscover purpose. Their wisdom deserves an audience.",
  },
  {
    emoji: "🎨",
    title: "Hobby Circles",
    text: "Peer connections built around shared interests – chess, gardening, music, cooking. Joy comes from belonging.",
  },
];

const visitFeatures = [
  "Real-time visit logs",
  "WhatsApp alerts",
  "Vitals trends dashboard",
  "Live Happiness Score",
  "Any time zone access",
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

const testimonials = [
  {
    name: "Anita Kapoor",
    role: "Daughter · caring for her 82-year-old mother",
    location: "New Delhi",
    tag: "Found a Care Mitra in 2 days",
    quote: "MaiHoonNa found us a wonderful Care Mitra in just 2 days. She is now like family to my mother. What gave us the most peace of mind was the 24/7 support line — knowing someone is always there, even at 2 AM.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=600",
  },
  {
    name: "Rajesh Menon",
    role: "Son · caring for his 78-year-old father",
    location: "Bengaluru",
    tag: "Matched with Hindi & Malayalam speaker",
    quote: "Finding a Care Mitra who could speak both Hindi and Malayalam was a blessing. The weekly vitals reports give me real peace of mind since I reside in Chicago. The live Happiness Score is genuine transparency.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600",
  },
  {
    name: "Sunita Sharma",
    role: "Daughter · caring for her 85-year-old father",
    location: "Mumbai",
    tag: "Daily walks & medicine tracking",
    quote: "My father looks forward to his Saathi visits every Tuesday and Friday. From medicine tracking to daily walks, the Care Mitra manages everything professionally. It feels like having a second family member in India.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=600",
  }
];

const App = () => {
  const [activePage, setActivePage] = useState("home");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
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

  // Services page active tabs
  const [activeServiceTab, setActiveServiceTab] = useState(0);
  const [activeTierTab, setActiveTierTab] = useState(0);

  // Billing cycle toggle: '1' | '3' | '6' | '12'
  const [selectedCycle, setSelectedCycle] = useState('1');

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
    } catch (e) { }

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
    } catch (e) { }
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
          <button className={`view-plan-button ${activePage === "plans" ? "active" : ""}`} onClick={() => setActivePage("plans")}>View Plans</button>

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
          <section className="hero" id="home" style={{ "--hero-bg": `url(${heroBg})` }}>
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
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 11 12 14 17 9" />
                    </svg>
                    <strong>100%</strong> BGV-Verified Mitras
                  </span>
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <strong>24/7</strong> Emergency Support
                  </span>
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <strong>NCR</strong> Pilot Underway
                  </span>
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
                  <li>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 11 12 14 17 9" />
                    </svg>
                    Background-verified Care Mitras
                  </li>
                  <li>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 11 12 14 17 9" />
                    </svg>
                    Geo-fenced visit tracking
                  </li>
                  <li>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 11 12 14 17 9" />
                    </svg>
                    Real-time Family Connect app
                  </li>
                  <li>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 11 12 14 17 9" />
                    </svg>
                    Registered company, Gurugram
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="video-section">
            <div className="section-heading">
              <span>OUR STORY</span>
              <h2>
                See Why Families Trust <span style={{ display: "block", color: "var(--orange)" }}>MaiHoonNa</span>
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
              <span>THE CHALLENGE</span>
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
              <span>HOW IT WORKS</span>
              <h2>From the first call to the first visit</h2>
              <p>Simple, transparent, and human - every step of the way.</p>
            </div>

            <div className="timeline">
              {processSteps.map((step, index) => (
                <div className="timeline__item" key={step.title}>
                  <div className="timeline__number">{index + 1}</div>
                  <div className="timeline__content">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="visits" id="services">
            <div className="section-heading">
              <span>OUR ECOSYSTEM</span>
              <h2>More than visits</h2>
              <p>A full ecosystem designed to help seniors live with dignity, connection, and joy - not just receive care.</p>
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <span className="service-card__emoji">{service.emoji}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <button onClick={openForm}>Learn more →</button>
                </article>
              ))}
            </div>

            <div className="nri-banner">
              <div>
                <div className="nri-eyebrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Managing care from abroad?
                </div>
                <h2>
                  Built for NRI Families Who Want to Stay <em>Genuinely Involved</em>
                </h2>
                <p>
                  Real-time visit logs, WhatsApp alerts, vitals trends, and a Happiness Score that tells you how your parent is actually feeling today — not just informed after something goes wrong.
                </p>
                <button onClick={openForm}>Join as NRI Family &rarr;</button>
              </div>
              <ul className="nri-list" style={{ listStyle: "none", padding: 0 }}>
                {visitFeatures.map((feature) => (
                  <li key={feature}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 11 12 14 17 9" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Care Mitra Home Visits ── */}
          {(() => {
            const serviceTabs = [
              {
                title: "Vitals Monitoring",
                summary: "BP, O2, temperature, weight — logged with date, time, and location after every visit.",
                detail: "All vitals are stored in your Family Connect app with trend graphs. Sudden deviations trigger an immediate alert to the family.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                )
              },
              {
                title: "Medication Adherence",
                summary: "Reminders set per schedule, adherence tracked and reported automatically.",
                detail: "Your Care Mitra follows a prescription-linked schedule, ensuring your parent takes the right doses on time, logging any anomalies immediately.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                )
              },
              {
                title: "Mood & Happiness Logging",
                summary: "If something seems off, your Family Connect app alerts you immediately.",
                detail: "Mitras perform interactive mood assessments and logging. Positive indicators help gauge long-term mental well-being.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                )
              },
              {
                title: "Clinic Accompaniment",
                summary: "Care Mitra accompanies your parent to appointments and shares a structured summary.",
                detail: "Includes transport booking assistance, waiting queue support, doctor instruction recording, and updating files post-consultation.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                )
              }
            ];

            const tiersData = [
              {
                tierCode: "TIER 01",
                title: "Saathi Volunteer",
                subtitle: "Community Companion",
                desc: "Warm, background-verified community volunteers who provide companionship, conversation, and accompany seniors on walks or errands. No medical duties.",
                tags: ["Companionship", "Conversation", "Walks & Errands"],
                suitability: "Suitable for: Socially isolated seniors, mild loneliness, post-retirement adjustment",
                icon: "🤝",
                complexity: 1
              },
              {
                tierCode: "TIER 02",
                title: "MAA",
                subtitle: "Basic Care Associate",
                desc: "Trained associates assisting with daily living activities, nutrition tracking, light mobility support, and basic health parameter check-ins.",
                tags: ["Daily Assist", "Nutrition Help", "Basic Param Check"],
                suitability: "Suitable for: Seniors needing light assistance with routine tasks, meal monitoring",
                icon: "👵",
                complexity: 2
              },
              {
                tierCode: "TIER 03",
                title: "GHM",
                subtitle: "General Health Mitra",
                desc: "Experienced health caretakers trained in standard parameter checks, vitals logging, medication reminders, and general care plan coordination.",
                tags: ["Vitals Checks", "Meds Logging", "Health Reports"],
                suitability: "Suitable for: Seniors with managed chronic conditions requiring regular check-ups",
                icon: "🩺",
                complexity: 3
              },
              {
                tierCode: "TIER 04",
                title: "B To Nurse",
                subtitle: "Advanced Care Associate",
                desc: "Highly trained clinical care associates capable of managing complex parameter tracking, recovery schedules, and basic nursing supports under supervision.",
                tags: ["Complex Track", "Recovery Assist", "Supervised Nursing"],
                suitability: "Suitable for: Post-operative recovery support, moderate physical dependencies",
                icon: "🩹",
                complexity: 4
              },
              {
                tierCode: "TIER 05",
                title: "Specialist Mitra",
                subtitle: "Specialized Clinical Mitra",
                desc: "Certified clinical specialists, nurses, or therapists managing intensive recovery protocols, therapy exercises, and specialized elder care plans.",
                tags: ["Intensive Care", "Therapy Assist", "Clinical Plans"],
                suitability: "Suitable for: Seniors requiring specialized rehabilitation, advanced chronic care, or therapy routines",
                icon: "🏥",
                complexity: 5
              }
            ];

            return (
              <section className="svc-visits">
                <div className="svc-visits__header-main">
                  <span className="svc-visits__eyebrow-top">CORE SERVICE</span>
                  <h2>Care Mitra Home Visits</h2>
                  <p>
                    Your parent's Care Mitra visits on a schedule you set. Every visit is
                    geo-fenced, encounter-tracked, and logged — so you always know what happened.
                  </p>
                </div>

                <div className="svc-visits__container-grid">
                  {/* Left Column */}
                  <div className="svc-visits__left-col">
                    <div className="svc-visits__alert-banner">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span>Every visit is <strong>geo-fenced</strong> and confirmed within 50m of home address</span>
                    </div>

                    <div className="svc-visits__tabs-list">
                      {serviceTabs.map((tab, index) => {
                        const isActive = activeServiceTab === index;
                        return (
                          <div
                            key={index}
                            className={`svc-visits__tab-card ${isActive ? "svc-visits__tab-card--active" : ""}`}
                            onClick={() => setActiveServiceTab(index)}
                          >
                            <div className="tab-card__header">
                              <div className="tab-card__icon-wrap">
                                {tab.icon}
                              </div>
                              <div className="tab-card__title-area">
                                <strong>{tab.title}</strong>
                                <p>{tab.summary}</p>
                              </div>
                              <div className="tab-card__status-check">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#FE6700" : "#E5E5E5"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                            </div>
                            {isActive && (
                              <div className="tab-card__expanded">
                                <p>💡 {tab.detail}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="svc-visits__right-col">
                    {/* Grading Ladder Card */}
                    <div className="svc-grading-card">
                      <div className="svc-grading-card__header">
                        <div className="svc-grading-card__icon-box">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </div>
                        <div className="svc-grading-card__title">
                          <h3>Care Mitra Grading Ladder</h3>
                          <span>5 tiers · matched to your care needs</span>
                        </div>
                      </div>

                      <div className="svc-grading-card__pills">
                        {tiersData.map((tier, index) => {
                          const isActive = activeTierTab === index;
                          return (
                            <button
                              key={index}
                              className={`svc-tier-pill ${isActive ? "svc-tier-pill--active" : ""}`}
                              onClick={() => setActiveTierTab(index)}
                            >
                              {tier.title}
                            </button>
                          );
                        })}
                      </div>

                      {(() => {
                        const activeTier = tiersData[activeTierTab];
                        return (
                          <>
                            <div className="svc-tier-detail-box">
                              <div className="svc-tier-detail-header">
                                <div className="svc-tier-emoji-box">{activeTier.icon}</div>
                                <div className="svc-tier-header-info">
                                  <span className="svc-tier-badge">{activeTier.tierCode}</span>
                                  <h4>{activeTier.title}</h4>
                                  <p className="svc-tier-subtitle">{activeTier.subtitle}</p>
                                </div>
                              </div>
                              <p className="svc-tier-description">{activeTier.desc}</p>
                              <div className="svc-tier-tags">
                                {activeTier.tags.map((tag, idx) => (
                                  <span key={idx} className="svc-tier-tag-pill">{tag}</span>
                                ))}
                              </div>
                              <div className="svc-tier-suitability">🎯 {activeTier.suitability}</div>
                            </div>
                            <div className="svc-complexity-section">
                              <div className="svc-complexity-header"><span>CARE COMPLEXITY</span></div>
                              <div className="svc-complexity-bar">
                                {[1, 2, 3, 4, 5].map((step) => (
                                  <div key={step} className={`svc-complexity-dot-bar ${step <= activeTier.complexity ? "svc-complexity-dot-bar--filled" : ""}`} />
                                ))}
                              </div>
                              <div className="svc-complexity-labels">
                                <span>Companion</span>
                                <span>Specialist</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Geo-fenced live visit image card */}
                    <div className="svc-visit-live-card">
                      <img src={piccImg} alt="Care Mitra visiting parent" />
                      <div className="svc-visit-live-card__overlay">
                        <div className="svc-live-pulsing-badge">
                          <span className="pulsing-circle" />
                          <strong>Geo-fenced visit in progress</strong>
                        </div>
                        <p>Vitals logged · Happiness Score updated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}


          <section className="testimonial">
            <div className="section-heading section-heading--dark">
              <span>TESTIMONIALS</span>
              <h2>Families Who Trust Us</h2>
            </div>

            <div className="testimonial-card-container">
              <div className="testimonial-card">
                {/* Left Side: Portrait */}
                <div
                  className="testimonial-portrait"
                  style={{ backgroundImage: `url(${testimonials[activeTestimonial].image})` }}
                >
                  <div className="testimonial-tag">
                    <span className="status-dot"></span>
                    <span>{testimonials[activeTestimonial].tag}</span>
                  </div>
                </div>

                {/* Right Side: Quote Details */}
                <div className="testimonial-content">
                  {/* Large Quote Icon background decoration */}
                  <div className="quote-mark">&ldquo;</div>

                  {/* 5 star rating */}
                  <div className="stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#FE6700" stroke="#FE6700" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="quote-body">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </blockquote>

                  {/* Author Information */}
                  <div className="testimonial-author">
                    <div
                      className="author-avatar"
                      style={{ backgroundImage: `url(${testimonials[activeTestimonial].image})` }}
                    />
                    <div className="author-info">
                      <h3>{testimonials[activeTestimonial].name}</h3>
                      <p>{testimonials[activeTestimonial].role}</p>
                      <span className="location">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {testimonials[activeTestimonial].location}
                      </span>
                    </div>
                  </div>

                  {/* Controls (Arrows and dots) */}
                  <div className="testimonial-controls">
                    <div className="dots-container">
                      {testimonials.map((_, idx) => (
                        <button
                          key={idx}
                          className={`dot ${idx === activeTestimonial ? 'active' : ''}`}
                          onClick={() => setActiveTestimonial(idx)}
                          aria-label={`Go to testimonial ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="arrows-container">
                      <button
                        className="arrow-btn"
                        onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                        aria-label="Previous testimonial"
                      >
                        &larr;
                      </button>
                      <button
                        className="arrow-btn"
                        onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                        aria-label="Next testimonial"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar Indicator below card */}
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${((activeTestimonial + 1) / testimonials.length) * 100}%` }}
                />
              </div>

              {/* Avatar Selector Switcher below line */}
              <div className="avatar-switcher">
                {testimonials.map((t, idx) => (
                  <button
                    key={idx}
                    className={`switcher-btn ${idx === activeTestimonial ? 'active' : ''}`}
                    onClick={() => setActiveTestimonial(idx)}
                    style={{ backgroundImage: `url(${t.image})` }}
                    aria-label={`Switch to ${t.name}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="app-cta">
            <div className="app-cta__container">
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
                <div className="services-hero__eyebrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>Our Services</span>
                </div>
                <h1>
                  Everything your loved one needs, <br />
                  <em>delivered at their door.</em>
                </h1>
                <p>
                  A full ecosystem of in-home care, health monitoring, community connection, and family transparency — all in one subscription.
                </p>
                <div className="services-hero__actions">
                  <button className="services-btn-explore" onClick={openForm}>
                    Explore Services
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                  <button className="services-btn-plans" onClick={() => setActivePage("plans")}>
                    View Plans
                  </button>
                </div>
              </div>
              <div className="services-hero__features">
                {[
                  {
                    title: "Vitals Monitoring",
                    desc: "Every visit · Date, time, location logged",
                    color: "#10B981",
                    bg: "rgba(16, 185, 129, 0.133)",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    )
                  },
                  {
                    title: "Medication Adherence",
                    desc: "Zero missed doses · Auto-tracked",
                    color: "#0EA5E9",
                    bg: "rgba(14, 165, 233, 0.133)",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    )
                  },
                  {
                    title: "100% BGV Verified Mitras",
                    desc: "Police + Aadhaar + reference verified",
                    color: "#FE6700",
                    bg: "rgba(254, 103, 0, 0.133)",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    )
                  },
                  {
                    title: "Family Connect App",
                    desc: "Real-time visibility from any time zone",
                    color: "#7C3AED",
                    bg: "rgba(124, 58, 237, 0.133)",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    )
                  },
                  {
                    title: "24/7 Emergency Response",
                    desc: "One tap alerts entire care chain",
                    color: "#EF4444",
                    bg: "rgba(239, 68, 68, 0.133)",
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    )
                  }
                ].map((item, idx) => (
                  <div className="services-hero__feature-card" key={idx}>
                    <div className="feature-card__icon-box" style={{ background: item.bg }}>
                      {item.icon}
                    </div>
                    <div className="feature-card__text">
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Care Mitra Home Visits ── */}
          {(() => {
            const serviceTabs = [
              {
                title: "Vitals Monitoring",
                summary: "BP, O2, temperature, weight — logged with date, time, and location after every visit.",
                detail: "All vitals are stored in your Family Connect app with trend graphs. Sudden deviations trigger an immediate alert to the family.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                )
              },
              {
                title: "Medication Adherence",
                summary: "Reminders set per schedule, adherence tracked and reported automatically.",
                detail: "Your Care Mitra follows a prescription-linked schedule, ensuring your parent takes the right doses on time, logging any anomalies immediately.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                )
              },
              {
                title: "Mood & Happiness Logging",
                summary: "If something seems off, your Family Connect app alerts you immediately.",
                detail: "Mitras perform interactive mood assessments and logging. Positive indicators help gauge long-term mental well-being.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                )
              },
              {
                title: "Clinic Accompaniment",
                summary: "Care Mitra accompanies your parent to appointments and shares a structured summary.",
                detail: "Includes transport booking assistance, waiting queue support, doctor instruction recording, and updating files post-consultation.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                )
              }
            ];

            const tiersData = [
              {
                tierCode: "TIER 01",
                title: "Saathi Volunteer",
                subtitle: "Community Companion",
                desc: "Warm, background-verified community volunteers who provide companionship, conversation, and accompany seniors on walks or errands. No medical duties.",
                tags: ["Companionship", "Conversation", "Walks & Errands"],
                suitability: "Suitable for: Socially isolated seniors, mild loneliness, post-retirement adjustment",
                icon: "🤝",
                complexity: 1
              },
              {
                tierCode: "TIER 02",
                title: "MAA",
                subtitle: "Basic Care Associate",
                desc: "Trained associates assisting with daily living activities, nutrition tracking, light mobility support, and basic health parameter check-ins.",
                tags: ["Daily Assist", "Nutrition Help", "Basic Param Check"],
                suitability: "Suitable for: Seniors needing light assistance with routine tasks, meal monitoring",
                icon: "👵",
                complexity: 2
              },
              {
                tierCode: "TIER 03",
                title: "GHM",
                subtitle: "General Health Mitra",
                desc: "Experienced health caretakers trained in standard parameter checks, vitals logging, medication reminders, and general care plan coordination.",
                tags: ["Vitals Checks", "Meds Logging", "Health Reports"],
                suitability: "Suitable for: Seniors with managed chronic conditions requiring regular check-ups",
                icon: "🩺",
                complexity: 3
              },
              {
                tierCode: "TIER 04",
                title: "B To Nurse",
                subtitle: "Advanced Care Associate",
                desc: "Highly trained clinical care associates capable of managing complex parameter tracking, recovery schedules, and basic nursing supports under supervision.",
                tags: ["Complex Track", "Recovery Assist", "Supervised Nursing"],
                suitability: "Suitable for: Post-operative recovery support, moderate physical dependencies",
                icon: "🩹",
                complexity: 4
              },
              {
                tierCode: "TIER 05",
                title: "Specialist Mitra",
                subtitle: "Specialized Clinical Mitra",
                desc: "Certified clinical specialists, nurses, or therapists managing intensive recovery protocols, therapy exercises, and specialized elder care plans.",
                tags: ["Intensive Care", "Therapy Assist", "Clinical Plans"],
                suitability: "Suitable for: Seniors requiring specialized rehabilitation, advanced chronic care, or therapy routines",
                icon: "🏥",
                complexity: 5
              }
            ];

            return (
              <section className="svc-visits">
                <div className="svc-visits__header-main">
                  <span className="svc-visits__eyebrow-top">CORE SERVICE</span>
                  <h2>Care Mitra Home Visits</h2>
                  <p>
                    Your parent's Care Mitra visits on a schedule you set. Every visit is
                    geo-fenced, encounter-tracked, and logged — so you always know what happened.
                  </p>
                </div>

                <div className="svc-visits__container-grid">
                  {/* Left Column */}
                  <div className="svc-visits__left-col">
                    <div className="svc-visits__alert-banner">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span>Every visit is <strong>geo-fenced</strong> and confirmed within 50m of home address</span>
                    </div>

                    <div className="svc-visits__tabs-list">
                      {serviceTabs.map((tab, index) => {
                        const isActive = activeServiceTab === index;
                        return (
                          <div
                            key={index}
                            className={`svc-visits__tab-card ${isActive ? "svc-visits__tab-card--active" : ""}`}
                            onClick={() => setActiveServiceTab(index)}
                          >
                            <div className="tab-card__header">
                              <div className="tab-card__icon-wrap">
                                {tab.icon}
                              </div>
                              <div className="tab-card__title-area">
                                <strong>{tab.title}</strong>
                                <p>{tab.summary}</p>
                              </div>
                              <div className="tab-card__status-check">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#FE6700" : "#E5E5E5"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                            </div>
                            {isActive && (
                              <div className="tab-card__expanded">
                                <p>💡 {tab.detail}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="svc-visits__right-col">
                    {/* Grading Ladder Card */}
                    <div className="svc-grading-card">
                      <div className="svc-grading-card__header">
                        <div className="svc-grading-card__icon-box">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </div>
                        <div className="svc-grading-card__title">
                          <h3>Care Mitra Grading Ladder</h3>
                          <span>5 tiers · matched to your care needs</span>
                        </div>
                      </div>

                      {/* Horizontal pill selectors */}
                      <div className="svc-grading-card__pills">
                        {tiersData.map((tier, index) => {
                          const isActive = activeTierTab === index;
                          return (
                            <button
                              key={index}
                              className={`svc-tier-pill ${isActive ? "svc-tier-pill--active" : ""}`}
                              onClick={() => setActiveTierTab(index)}
                            >
                              {tier.title}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Tier Details */}
                      {(() => {
                        const activeTier = tiersData[activeTierTab];
                        return (
                          <>
                            <div className="svc-tier-detail-box">
                              <div className="svc-tier-detail-header">
                                <div className="svc-tier-emoji-box">
                                  {activeTier.icon}
                                </div>
                                <div className="svc-tier-header-info">
                                  <span className="svc-tier-badge">{activeTier.tierCode}</span>
                                  <h4>{activeTier.title}</h4>
                                  <p className="svc-tier-subtitle">{activeTier.subtitle}</p>
                                </div>
                              </div>

                              <p className="svc-tier-description">{activeTier.desc}</p>

                              <div className="svc-tier-tags">
                                {activeTier.tags.map((tag, idx) => (
                                  <span key={idx} className="svc-tier-tag-pill">{tag}</span>
                                ))}
                              </div>

                              <div className="svc-tier-suitability">
                                🎯 {activeTier.suitability}
                              </div>
                            </div>

                            {/* Complexity Meter */}
                            <div className="svc-complexity-section">
                              <div className="svc-complexity-header">
                                <span>CARE COMPLEXITY</span>
                              </div>
                              <div className="svc-complexity-bar">
                                {[1, 2, 3, 4, 5].map((step) => {
                                  const isFilled = step <= activeTier.complexity;
                                  return (
                                    <div
                                      key={step}
                                      className={`svc-complexity-dot-bar ${isFilled ? "svc-complexity-dot-bar--filled" : ""}`}
                                    />
                                  );
                                })}
                              </div>
                              <div className="svc-complexity-labels">
                                <span>Companion</span>
                                <span>Specialist</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Geo-fenced live visit image card */}
                    <div className="svc-visit-live-card">
                      <img src={piccImg} alt="Care Mitra visiting parent" />
                      <div className="svc-visit-live-card__overlay">
                        <div className="svc-live-pulsing-badge">
                          <span className="pulsing-circle" />
                          <strong>Geo-fenced visit in progress</strong>
                        </div>
                        <p>Vitals logged · Happiness Score updated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}


          {/* ── Full Ecosystem ── */}
          <section className="svc-ecosystem">
            <div className="svc-visits__header-main">
              <span className="svc-visits__eyebrow-top">BEYOND VISITS</span>
              <h2>The full MaiHoonNa ecosystem</h2>
              <p>
                Care visits are just the beginning. Every service below is
                coordinated through your single Care Mitra relationship.
              </p>
            </div>

            <div className="svc-eco-grid-container">
              {/* Row 1: Flagship + Emergency */}
              <div className="svc-eco-top-row">
                {/* Family Connect Card */}
                <div className="svc-eco-card-flagship">
                  <div className="svc-eco-card-flagship__left">
                    <span className="flagship-icon">📱</span>
                    <span className="flagship-badge">FLAGSHIP FEATURE</span>
                    <h3>Family Connect App</h3>
                    <p>
                      Real-time visit logs, vitals trends, medication adherence, and a
                      Happiness Score — built for families managing care remotely from
                      any time zone.
                    </p>
                    <div className="flagship-tags">
                      <span>Real-time</span>
                      <span>Vitals Trends</span>
                      <span>Happiness Score</span>
                      <span>NRI-ready</span>
                    </div>
                  </div>
                  <div className="svc-eco-card-flagship__right">
                    <div className="flagship-widget">
                      <div className="widget-score-box">
                        <span>Happiness Score</span>
                        <strong>82</strong>
                      </div>
                      <div className="widget-row">
                        <span>BP</span>
                        <strong>120/80</strong>
                      </div>
                      <div className="widget-row">
                        <span>SpO2</span>
                        <strong>98%</strong>
                      </div>
                      <div className="widget-row">
                        <span>Mood</span>
                        <strong>😊 Happy</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Card */}
                <div className="svc-eco-card-emergency">
                  <span className="emergency-icon">🚨</span>
                  <h3>Emergency Response</h3>
                  <p>
                    A single emergency button triggers immediate alerts to your Care
                    Mitra, Field Manager, Operations team, and family.
                  </p>
                  <div className="emergency-tags">
                    <span>One tap</span>
                    <span>24/7</span>
                    <span>Full chain alert</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Saathi + Hobby + Health + Celebrations */}
              <div className="svc-eco-bottom-grid">
                {/* Saathi Network */}
                <div className="svc-eco-small-card">
                  <span className="small-card-icon">🤝</span>
                  <h3>Saathi Network</h3>
                  <p>
                    Community volunteers who visit between scheduled Care Mitra
                    appointments. Every interaction is tracked.
                  </p>
                  <div className="small-card-tags small-card-tags--green">
                    <span>Companionship</span>
                    <span>Tracked</span>
                    <span>Community</span>
                  </div>
                </div>

                {/* Hobby Circles */}
                <div className="svc-eco-small-card">
                  <span className="small-card-icon">🎨</span>
                  <h3>Hobby Circles</h3>
                  <p>
                    Peer connections built around shared interests with nearby neighbors.
                    Privacy protected by design.
                  </p>
                  <div className="small-card-tags small-card-tags--purple">
                    <span>Social</span>
                    <span>Interests</span>
                    <span>Privacy-first</span>
                  </div>
                </div>

                {/* Healthcare Partner Network */}
                <div className="svc-eco-small-card">
                  <span className="small-card-icon">🏥</span>
                  <h3>Healthcare Partner Network</h3>
                  <p>
                    Pharmacy orders, lab appointments, physio, tele-consultations, and
                    ambulance — all coordinated through your Care Mitra.
                  </p>
                  <div className="small-card-tags small-card-tags--blue">
                    <span>Pharmacy</span>
                    <span>Labs</span>
                    <span>Tele-consult</span>
                  </div>
                </div>

                {/* Celebrations & Milestones */}
                <div className="svc-eco-small-card">
                  <span className="small-card-icon">🎂</span>
                  <h3>Celebrations & Milestones</h3>
                  <p>
                    Birthdays and anniversaries flagged to your Care Mitra so the small
                    moments that matter don't get missed.
                  </p>
                  <div className="small-card-tags small-card-tags--orange">
                    <span>Birthdays</span>
                    <span>Anniversaries</span>
                    <span>Moments</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA Banner ── */}
          <section className="svc-cta">
            <div className="svc-cta__inner">
              <span className="svc-cta__eyebrow">GET STARTED</span>
              <h2>Ready to bring care home?</h2>
              <p>
                Join the waitlist for Gurugram Sectors 54–57. Limited early access. We'll match your first Care Mitra within 24 hours of onboarding.
              </p>
              <div className="svc-cta__actions">
                <button className="svc-cta-btn-plans" onClick={() => setActivePage("plans")}>View Plans</button>
                <button className="svc-cta-btn-callback" onClick={openForm}>Request a Callback</button>
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
        <PlansPage
          livePackages={livePackages}
          onSelectPackage={handleSelectPackageForBuy}
          openForm={openForm}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          showSuccess={showSuccess}
        />
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="5" ry="5" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
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
