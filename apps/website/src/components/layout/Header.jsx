import React, { useState } from "react";
import logo from "../../assets/logo.svg";

/**
 * Header Component - Site Navigation and User Actions Bar
 */
const Header = ({ activePage, setActivePage, user, openForm }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="topbar" role="banner">
      <a
        href="#home"
        aria-label="MaiHoonNa home"
        className="topbar__brand"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick("home");
        }}
      >
        <img src={logo} alt="MaiHoonNa - Connected Senior Care & Elder Companionship Platform" width="238" height="42" loading="eager" fetchpriority="high" />
      </a>

      <nav className="topbar__nav" aria-label="Main navigation">
        <button
          className={activePage === "home" ? "active" : ""}
          onClick={() => handleNavClick("home")}
        >
          Home
        </button>
        <button
          className={activePage === "services" ? "active" : ""}
          onClick={() => handleNavClick("services")}
        >
          Our Services
        </button>
        <button
          className={activePage === "saathi" ? "active" : ""}
          onClick={() => handleNavClick("saathi")}
        >
          Saathi Network
        </button>
      </nav>

      <div className="topbar__actions">
        <button
          className={`view-plan-button ${activePage === "plans" ? "active" : ""}`}
          onClick={() => handleNavClick("plans")}
        >
          View Plans
        </button>

        <button className="view-plan-button" onClick={openForm}>
          Join Waitlist
        </button>

        {user ? (
          <button
            className="user-account-btn"
            onClick={() => handleNavClick("account")}
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
            className="pill-button pill-button--light"
            onClick={() => handleNavClick("auth")}
          >
            Sign Up
          </button>
        )}

        {/* Mobile Hamburger Menu Button */}
        <button
          className="topbar__hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="topbar__mobile-menu">
          <button
            className={activePage === "home" ? "active" : ""}
            onClick={() => handleNavClick("home")}
          >
            🏠 Home
          </button>
          <button
            className={activePage === "services" ? "active" : ""}
            onClick={() => handleNavClick("services")}
          >
            ✨ Our Services
          </button>
          <button
            className={activePage === "saathi" ? "active" : ""}
            onClick={() => handleNavClick("saathi")}
          >
            🤝 Saathi Network
          </button>
          <button
            className={activePage === "plans" ? "active" : ""}
            onClick={() => handleNavClick("plans")}
          >
            📋 View Plans
          </button>

          {user ? (
            <button
              className={activePage === "account" ? "active" : ""}
              onClick={() => handleNavClick("account")}
            >
              👤 My Account ({user.name})
            </button>
          ) : (
            <button
              className={activePage === "auth" ? "active" : ""}
              onClick={() => handleNavClick("auth")}
            >
              🔑 Sign Up
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
