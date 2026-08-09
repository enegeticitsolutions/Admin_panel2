import React, { useState } from "react";
import { validateCouponCode, purchaseSubscription } from "../../services/api";

export default function CheckoutModal({ isOpen, onClose, selectedPackage, token, user, onSuccess }) {
  const [duration, setDuration] = useState("1"); // "1" | "3" | "6" | "12"
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Beneficiary details option
  const [addBeneficiaryNow, setAddBeneficiaryNow] = useState(false);
  const [beneficiary, setBeneficiary] = useState({
    name: "",
    age: "65",
    gender: "female",
    relationship: "Parent",
    phone: "",
    city: "Gurugram",
    address: "",
  });

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  if (!isOpen || !selectedPackage) return null;

  const baseMonthlyPrice = selectedPackage.basePrice || selectedPackage.price || 0;
  
  // Calculate price based on duration and discounts from package
  const calcDurationPricing = () => {
    const durNum = parseInt(duration, 10);
    let rawTotal = baseMonthlyPrice * durNum;
    let discPct = 0;

    if (durNum === 3) {
      discPct = selectedPackage.discountThreeMonths ?? 5;
      if (selectedPackage.priceThreeMonths) {
        return { total: selectedPackage.priceThreeMonths, discountPct: discPct, durationMonths: 3 };
      }
    } else if (durNum === 6) {
      discPct = selectedPackage.discountSixMonths ?? 10;
      if (selectedPackage.priceSixMonths) {
        return { total: selectedPackage.priceSixMonths, discountPct: discPct, durationMonths: 6 };
      }
    } else if (durNum === 12) {
      discPct = selectedPackage.discountAnnual ?? 20;
      if (selectedPackage.priceTwelveMonths) {
        return { total: selectedPackage.priceTwelveMonths, discountPct: discPct, durationMonths: 12 };
      }
    }

    const calculatedTotal = Math.round(rawTotal * (1 - discPct / 100));
    return { total: calculatedTotal, discountPct: discPct, durationMonths: durNum };
  };

  const pricing = calcDurationPricing();

  // Calculate final total after coupon
  let finalTotal = pricing.total;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      finalTotal = Math.max(0, Math.round(pricing.total * (1 - (appliedCoupon.discountValue || 0) / 100)));
    } else if (appliedCoupon.discountType === "fixed") {
      finalTotal = Math.max(0, pricing.total - (appliedCoupon.discountValue || 0));
    }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const result = await validateCouponCode(token, couponCode.trim(), selectedPackage.id || selectedPackage.type);
      setAppliedCoupon(result);
    } catch (err) {
      setCouponError(err.message || "Invalid coupon code.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePurchaseSubmit = async () => {
    setPurchaseError("");
    setPurchasing(true);

    try {
      let benData = null;
      if (addBeneficiaryNow) {
        if (!beneficiary.name.trim() || !beneficiary.phone.trim()) {
          throw new Error("Please fill in Beneficiary Name and Phone Number.");
        }
        benData = {
          name: beneficiary.name,
          age: parseInt(beneficiary.age, 10) || 65,
          gender: beneficiary.gender,
          relationship: beneficiary.relationship,
          phone: beneficiary.phone,
          address: beneficiary.address || `${beneficiary.city}`,
          city: beneficiary.city,
        };
      }

      const res = await purchaseSubscription(token, {
        packageId: selectedPackage.id || selectedPackage.type,
        couponCode: appliedCoupon ? couponCode.trim() : undefined,
        beneficiaryData: benData,
      });

      setPurchaseSuccess(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setPurchaseError(err.message || "Failed to process subscription purchase.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1000 }}>
      <div className="modal-card" style={{ maxWidth: "560px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} className="modal-close" aria-label="Close checkout">
          ✕
        </button>

        {purchaseSuccess ? (
          /* ── SUCCESS VIEW ── */
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#111827", margin: "0 0 8px" }}>
              Subscription Purchased!
            </h2>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "20px" }}>
              Thank you, <strong>{user?.name || "Caregiver"}</strong>! Your subscription for{" "}
              <strong>{selectedPackage.name}</strong> ({pricing.durationMonths} Month
              {pricing.durationMonths > 1 ? "s" : ""}) has been activated successfully.
            </p>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "left",
                marginBottom: "24px",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Next Steps:</div>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151", lineHeight: "1.6" }}>
                <li>Download the <strong>MaiHoonNa Mobile App</strong> on iOS or Android.</li>
                <li>Log in using your phone number (<strong>+91 {user?.phone?.replace(/\D/g, "").slice(-10)}</strong>).</li>
                <li>
                  {addBeneficiaryNow
                    ? "Your beneficiary care schedule and Care Mitra visits are now ready!"
                    : "You can enroll and set up your senior beneficiary details directly inside the App."}
                </li>
              </ul>
            </div>

            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                background: "var(--orange, #fe6700)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                border: "none",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* ── CHECKOUT FORM ── */
          <div>
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  color: "var(--orange, #fe6700)",
                  textTransform: "uppercase",
                }}
              >
                Checkout & Plan Customization
              </span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#111827", margin: "4px 0 0" }}>
                {selectedPackage.name}
              </h2>
            </div>

            {purchaseError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  fontWeight: "500",
                }}
              >
                {purchaseError}
              </div>
            )}

            {/* 1. Duration Selection */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#374151", display: "block", marginBottom: "8px" }}>
                Select Subscription Duration
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { key: "1", label: "1 Month", disc: 0 },
                  { key: "3", label: "3 Months", disc: selectedPackage.discountThreeMonths ?? 5 },
                  { key: "6", label: "6 Months", disc: selectedPackage.discountSixMonths ?? 10 },
                  { key: "12", label: "1 Year", disc: selectedPackage.discountAnnual ?? 20 },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDuration(item.key)}
                    style={{
                      padding: "12px 6px",
                      borderRadius: "10px",
                      border: duration === item.key ? "2px solid var(--orange, #fe6700)" : "1px solid #e5e7eb",
                      background: duration === item.key ? "#fff5ee" : "#ffffff",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#111827" }}>{item.label}</div>
                    {item.disc > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: "600", marginTop: "2px" }}>
                        Save {item.disc}%
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Coupon Code */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px" }}>
                Discount Coupon Code
              </label>
              <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.9rem" }}
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "#374151",
                    color: "#fff",
                    fontWeight: "600",
                    border: "none",
                    opacity: !couponCode.trim() ? 0.5 : 1,
                  }}
                >
                  {couponLoading ? "Validating..." : "Apply"}
                </button>
              </form>
              {appliedCoupon && (
                <div style={{ fontSize: "0.8rem", color: "#16a34a", marginTop: "4px", fontWeight: "600" }}>
                  ✓ Coupon "{appliedCoupon.code}" applied successfully!
                </div>
              )}
              {couponError && <div style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "4px" }}>{couponError}</div>}
            </div>

            {/* 3. Beneficiary Enrollment Options */}
            <div style={{ marginBottom: "24px", background: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
                Beneficiary Setup (Parent / Loved One)
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: addBeneficiaryNow ? "14px" : "0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="benOption"
                    checked={!addBeneficiaryNow}
                    onChange={() => setAddBeneficiaryNow(false)}
                  />
                  Set up later in App
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="benOption"
                    checked={addBeneficiaryNow}
                    onChange={() => setAddBeneficiaryNow(true)}
                  />
                  Enroll Beneficiary Now
                </label>
              </div>

              {addBeneficiaryNow && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  <input
                    type="text"
                    placeholder="Beneficiary Full Name *"
                    value={beneficiary.name}
                    onChange={(e) => setBeneficiary({ ...beneficiary, name: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input
                      type="number"
                      placeholder="Age (e.g. 68)"
                      value={beneficiary.age}
                      onChange={(e) => setBeneficiary({ ...beneficiary, age: e.target.value })}
                      style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                    />
                    <select
                      value={beneficiary.gender}
                      onChange={(e) => setBeneficiary({ ...beneficiary, gender: e.target.value })}
                      style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    placeholder="Beneficiary Mobile Phone *"
                    value={beneficiary.phone}
                    onChange={(e) => setBeneficiary({ ...beneficiary, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                  />
                  <input
                    type="text"
                    placeholder="Address / Sector (e.g. Sector 56, Gurugram)"
                    value={beneficiary.address}
                    onChange={(e) => setBeneficiary({ ...beneficiary, address: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                  />
                </div>
              )}
            </div>

            {/* 4. Total & Pay Button */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Total Payable</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827" }}>₹{finalTotal.toLocaleString("en-IN")}</div>
              </div>
              <button
                type="button"
                onClick={handlePurchaseSubmit}
                disabled={purchasing}
                style={{
                  padding: "14px 28px",
                  borderRadius: "10px",
                  background: "var(--orange, #fe6700)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "1rem",
                  border: "none",
                  opacity: purchasing ? 0.6 : 1,
                  cursor: purchasing ? "not-allowed" : "pointer",
                }}
              >
                {purchasing ? "Processing..." : "Complete Purchase"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
