import React from "react";
import heroBg from "../../assets/herobg.png";
import healthcareIcon from "../../assets/healthcare1.png";

/**
 * HeroSection Component
 */
const HeroSection = ({ openForm }) => {
  return (
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
              onClick={openForm}
              readOnly
            />
            <button onClick={openForm}>Join Waitlist</button>
          </div>

          <p className="hero-location">Launching in Gurugram Sectors 54-57 - Limited early access</p>

          <div className="hero-stats" aria-label="MaiHoonNa benefits">
            <span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              100% BGV-Verified Mitras
            </span>
            <span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              24/7 Emergency Support
            </span>
            <span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              NCR Pilot Underway
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
  );
};

export default HeroSection;
