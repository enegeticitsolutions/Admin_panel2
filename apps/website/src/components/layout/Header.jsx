import React from "react";
import logo from "../../assets/logo.svg";

/**
 * Header Component - Site Navigation and User Actions Bar
 */
const Header = ({ activePage, setActivePage, user, openForm }) => {
  return (
    <header className="topbar" role="banner">
      <a href="/" aria-label="MaiHoonNa home" className="topbar__brand">
        <img src={logo} alt="MaiHoonNa" />
      </a>
      <nav className="topbar__nav" aria-label="Main navigation">
        <button
          className={activePage === "home" ? "active" : ""}
          onClick={() => setActivePage("home")}
        >
          Home
        </button>
        <button
          className={activePage === "services" ? "active" : ""}
          onClick={() => setActivePage("services")}
        >
          Our Services
        </button>
        <button
          className={activePage === "saathi" ? "active" : ""}
          onClick={() => setActivePage("saathi")}
        >
          Saathi Network
        </button>
      </nav>
      <div
        className="topbar__actions"
        style={{ display: "flex", gap: "10px", alignItems: "center" }}
      >
        <button
          className={`view-plan-button ${activePage === "plans" ? "active" : ""}`}
          onClick={() => setActivePage("plans")}
        >
          View Plans
        </button>

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
  );
};

export default Header;
