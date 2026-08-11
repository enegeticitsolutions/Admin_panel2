import React, { useState } from "react";

/**
 * SiteGatekeeper - Access Visibility Gatekeeper Component
 * 
 * Provides a simple passcode lock screen before displaying the site.
 * Easily enabled/disabled via environment variable:
 *   VITE_ENABLE_GATEKEEPER="true"  (or "false" to bypass/remove)
 *   VITE_GATEKEEPER_PASSCODE="123456"  (default PIN)
 */
const SiteGatekeeper = ({ children }) => {
  // Flag to check if Gatekeeper feature is enabled (defaults to true unless explicitly 'false')
  const isEnabled = import.meta.env.VITE_ENABLE_GATEKEEPER !== "false";

  // Passcode configured in .env or default '123456'
  const VALID_PASSCODE = import.meta.env.VITE_GATEKEEPER_PASSCODE || "123456";

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!isEnabled) return true;
    try {
      return sessionStorage.getItem("mhn_site_gatekeeper_unlocked") === "true";
    } catch (e) {
      return false;
    }
  });

  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  if (!isEnabled || isUnlocked) {
    return <>{children}</>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (passcode.trim() !== VALID_PASSCODE) {
      setError("Incorrect access passcode. Please try again.");
      return;
    }

    // Success -> unlock for this session
    try {
      sessionStorage.setItem("mhn_site_gatekeeper_unlocked", "true");
    } catch (e) {}
    setIsUnlocked(true);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>🔒 PRIVATE ACCESS</div>
          <h1 style={styles.title}>MaiHoonNa Portal</h1>
          <p style={styles.subtitle}>
            This environment is password protected. Enter the access passcode to view the site.
          </p>
        </div>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Access Passcode *</label>
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={styles.input}
              autoFocus
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Unlock Access ➔
          </button>
        </form>

        <div style={styles.footer}>
          <span>MaiHoonNa Senior Care Ecosystem</span>
          <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Protected Access</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#0F172A",
    backgroundImage: "radial-gradient(at 0% 0%, rgba(254, 103, 0, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(254, 103, 0, 0.1) 0px, transparent 50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "36px 32px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "rgba(254, 103, 0, 0.15)",
    color: "#FE6700",
    border: "1px solid rgba(254, 103, 0, 0.3)",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    marginBottom: "12px",
  },
  title: {
    color: "#FFFFFF",
    fontSize: "26px",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: 0,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#FCA5A5",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#FFFFFF",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },
  button: {
    backgroundColor: "#FE6700",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 10px 20px -5px rgba(254, 103, 0, 0.4)",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "28px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#64748B",
    fontSize: "12px",
    fontWeight: "500",
  },
};

export default SiteGatekeeper;
