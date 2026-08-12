import React, { useState, useRef } from "react";
import { sendOtp, verifyOtp, registerUser, loginWithPassword } from "../services/api";
import logo from "../assets/logo.svg";

export default function AuthPage({ onAuthSuccess, onGoBack, initialView = "PHONE" }) {
  const [view, setView] = useState(initialView); // 'PHONE' | 'OTP' | 'REGISTER' | 'PASSWORD_LOGIN'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const otpRefs = useRef([]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(cleanPhone);
      setInfoMessage(`We've sent a 6-digit OTP to +91 ${cleanPhone}`);
      setView("OTP");
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);

    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phone, enteredOtp);
      if (res.isNewUser) {
        setInfoMessage("Phone verified! Please enter your details below to create your prospect account.");
        setView("REGISTER");
      } else if (res.user && res.token) {
        onAuthSuccess(res.user, res.token);
      } else {
        setError("Verification response invalid. Please try again.");
      }
    } catch (err) {
      setError(err.message || "OTP verification failed. Check code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setError("Please enter a valid age (18+).");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // Hits POST /api/auth/register-password -> creates user in DB as 'prospect' role
      const res = await registerUser({ phoneRaw: cleanPhone, name, age: ageNum, password });
      onAuthSuccess(res.user, res.token);
    } catch (err) {
      setError(err.message || "Account creation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPassword({ phoneRaw: cleanPhone, password });
      onAuthSuccess(res.user, res.token);
    } catch (err) {
      setError(err.message || "Login failed. Invalid phone or password.");
    } finally {
      setLoading(false);
    }
  };

  const isRegistering = view === "REGISTER";

  return (
    <div className="auth-page-container">
      {/* ── Left Hero Side ── */}
      <div className="auth-hero-side">
        {/* 
        <div style={{ zIndex: 2 }}>
          <button onClick={onGoBack} className="auth-back-btn">
            ← Back to Main Website
          </button>
        </div>
        */}

        <div style={{ zIndex: 2, maxWidth: "520px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={onGoBack} className="auth-back-btn" style={{ margin: 0 }}>
              ← Back
            </button>
            <div className="auth-badge" style={{ margin: 0 }}>
              India's Senior Care Ecosystem
            </div>
          </div>
          <h1 className="auth-hero-title">
            Care for your loved ones, <span style={{ color: "#ffedd5" }}>simplified.</span>
          </h1>
          <p className="auth-hero-desc">
            Log in or create a prospect account to manage senior subscriptions, track Care Mitra visits, and receive real-time family updates.
          </p>

          <div className="auth-features-list">
            {[
              { icon: "🛡️", title: "100% Verified Care Mitras", desc: "Background checked and trained companions" },
              { icon: "📊", title: "Vitals & Happiness Score", desc: "Live monitoring of health trends and mood" },
              { icon: "🚨", title: "24/7 Emergency Response", desc: "Instant alert button for complete family safety" },
            ].map((f, i) => (
              <div key={i} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <div>
                  <div className="auth-feature-title">{f.title}</div>
                  <div className="auth-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-copyright">
          © 2026 MaiHoonNa Care Technologies. All rights reserved.
        </div>
      </div>

      {/* ── Right Content Side ── */}
      <div className="auth-form-side">
        <div className={`auth-form-card ${isRegistering ? "auth-card--register" : "auth-card--login"}`}>
          {/* Header Brand */}
          <div className="auth-header-brand" style={{ marginBottom: "16px", textAlign: "center" }}>
            <img src={logo} alt="MaiHoonNa" className="auth-brand-logo" style={{ height: "36px", margin: "0 auto 10px", display: "block" }} />
            
            {/* Tab Switcher */}
            <div
              className="auth-tab-switcher"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "#f1f5f9",
                padding: "3px",
                borderRadius: "12px",
                marginBottom: "14px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setInfoMessage("");
                  setView("PHONE");
                }}
                style={{
                  padding: "8px",
                  borderRadius: "9px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  background: !isRegistering ? "#ffffff" : "transparent",
                  color: !isRegistering ? "#0f172a" : "#64748b",
                  boxShadow: !isRegistering ? "0 2px 6px rgba(0, 0, 0, 0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setInfoMessage("");
                  setView("REGISTER");
                }}
                style={{
                  padding: "8px",
                  borderRadius: "9px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  background: isRegistering ? "#ffffff" : "transparent",
                  color: isRegistering ? "#0f172a" : "#64748b",
                  boxShadow: isRegistering ? "0 2px 6px rgba(0, 0, 0, 0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Create Account
              </button>
            </div>

            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>
              {view === "PHONE" && "Log in to MaiHoonNa"}
              {view === "OTP" && "Enter 6-digit OTP"}
              {view === "REGISTER" && "Create Prospect Account"}
              {view === "PASSWORD_LOGIN" && "Password Login"}
            </h2>
            <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0 }}>
              {view === "PHONE" && "Enter your 10-digit mobile number to get an OTP."}
              {view === "OTP" && `We've sent a 6-digit verification code to +91 ${phone.replace(/\D/g, "").slice(-10)}`}
              {view === "REGISTER" && "Enter your details to get started."}
              {view === "PASSWORD_LOGIN" && "Enter your registered mobile number and password"}
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "0.85rem",
                marginBottom: "14px",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}

          {infoMessage && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "0.85rem",
                marginBottom: "14px",
                fontWeight: "500",
              }}
            >
              {infoMessage}
            </div>
          )}

          {/* ── View 1: PHONE INPUT (LOG IN) ── */}
          {view === "PHONE" && (
            <form onSubmit={handlePhoneSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Mobile Phone Number
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#f1f5f9",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      fontWeight: "700",
                      color: "#0f172a",
                      fontSize: "0.95rem",
                    }}
                  >
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    required
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      outline: "none",
                      background: "#ffffff",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "var(--orange, #fe6700)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "1rem",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(254, 103, 0, 0.35)",
                  opacity: loading || phone.length < 10 ? 0.6 : 1,
                  cursor: loading || phone.length < 10 ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setView("PASSWORD_LOGIN")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Log in with Password instead
                </button>

                <div style={{ width: "100%", height: "1px", background: "#f1f5f9" }} />

                <button
                  type="button"
                  onClick={() => setView("REGISTER")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0f172a",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Don't have an account? <span style={{ color: "var(--orange, #fe6700)", fontWeight: "700" }}>Sign Up</span>
                </button>
              </div>
            </form>
          )}

          {/* ── View 2: OTP VERIFICATION ── */}
          {view === "OTP" && (
            <form onSubmit={handleVerifyOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="auth-otp-grid">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="auth-otp-input"
                    style={{
                      border: digit ? "2px solid var(--orange, #fe6700)" : "1.5px solid #cbd5e1",
                      background: digit ? "#fff8f3" : "#ffffff",
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "var(--orange, #fe6700)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "1rem",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(254, 103, 0, 0.35)",
                  opacity: loading || otp.join("").length !== 6 ? 0.6 : 1,
                  cursor: loading || otp.join("").length !== 6 ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setOtp(["", "", "", "", "", ""]);
                    setView("PHONE");
                  }}
                  style={{ background: "none", border: "none", color: "#64748b", fontWeight: "600", cursor: "pointer" }}
                >
                  ← Change Number
                </button>
                <button
                  type="button"
                  onClick={handlePhoneSubmit}
                  style={{ background: "none", border: "none", color: "var(--orange, #fe6700)", fontWeight: "700", cursor: "pointer" }}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* ── View 3: REGISTRATION FORM (CREATE PROSPECT ACCOUNT) ── */}
          {view === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>
                    Mobile Number *
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div
                      style={{
                        padding: "12px 10px",
                        background: "#f1f5f9",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        fontWeight: "700",
                        color: "#0f172a",
                        fontSize: "0.95rem",
                      }}
                    >
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      maxLength={10}
                      required
                      style={{
                        flex: 1,
                        padding: "12px 10px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>
                    Age *
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={18}
                    max={120}
                    required
                    style={{ width: "100%", padding: "12px 10px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Create Password *
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "var(--orange, #fe6700)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "1rem",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(254, 103, 0, 0.35)",
                  opacity: loading || phone.length < 10 ? 0.6 : 1,
                  cursor: loading || phone.length < 10 ? "not-allowed" : "pointer",
                  marginTop: "4px",
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <div style={{ textAlign: "center", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setView("PHONE")}
                  style={{ background: "none", border: "none", color: "#64748b", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Already have an account? <span style={{ color: "var(--orange, #fe6700)", fontWeight: "700" }}>Log In</span>
                </button>
              </div>
            </form>
          )}

          {/* ── View 4: PASSWORD LOGIN ── */}
          {view === "PASSWORD_LOGIN" && (
            <form onSubmit={handlePasswordLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "1rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "1rem" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "var(--orange, #fe6700)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(254, 103, 0, 0.35)",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "8px",
                }}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setView("PHONE")}
                  style={{ background: "none", border: "none", color: "var(--orange, #fe6700)", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer" }}
                >
                  ← Back to OTP Login
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="auth-mobile-header">
          <button onClick={onGoBack} className="auth-mobile-back-btn">
            ← Back to Website
          </button>
        </div>
      </div>
    </div>
  );
}
