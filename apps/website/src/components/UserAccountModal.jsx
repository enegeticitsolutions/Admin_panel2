import React, { useEffect, useState } from "react";
import { fetchSubscriberDashboard } from "../services/api";

export default function UserAccountModal({ isOpen, onClose, user, token, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      fetchSubscriberDashboard(token)
        .then((data) => setDashboard(data))
        .catch((err) => console.error("Failed to load dashboard:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const activeSubscription = dashboard?.subscription || dashboard?.activeSubscription;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1000 }}>
      <div className="modal-card" style={{ maxWidth: "480px", padding: "32px" }}>
        <button onClick={onClose} className="modal-close" aria-label="Close modal">
          ✕
        </button>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--orange-soft, #fff0e7)",
              color: "var(--orange, #fe6700)",
              fontSize: "24px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#111827", margin: "0 0 2px" }}>
            {user?.name || "Subscriber"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
            +91 {user?.phone ? user.phone.replace(/\D/g, "").slice(-10) : ""}
          </p>
        </div>

        {/* Active Subscription Summary */}
        <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", marginBottom: "24px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--orange, #fe6700)", letterSpacing: "0.5px", marginBottom: "6px" }}>
            Active Subscription
          </div>

          {loading ? (
            <div style={{ fontSize: "0.85rem", color: "#6b7280", padding: "12px 0", textAlign: "center" }}>Loading details...</div>
          ) : activeSubscription ? (
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>
                {activeSubscription.packageName || activeSubscription.package?.name || "Senior Care Plan"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#4b5563", marginTop: "4px" }}>
                Status: <span style={{ color: "#16a34a", fontWeight: "700" }}>Active ✓</span>
              </div>
              {activeSubscription.benefitBalances && activeSubscription.benefitBalances.length > 0 && (
                <div style={{ marginTop: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Included Hours / Benefits:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {activeSubscription.benefitBalances.map((b, i) => (
                      <span key={i} style={{ background: "#fff", border: "1px solid #d1d5db", borderRadius: "6px", padding: "4px 8px", fontSize: "0.75rem", fontWeight: "600" }}>
                        {b.benefitName}: {b.remainingUnits ?? b.totalUnits} remaining
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: "0.88rem", color: "#6b7280" }}>
              No active subscription found. Browse our plans below to get started!
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#991b1b",
              fontWeight: "700",
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
