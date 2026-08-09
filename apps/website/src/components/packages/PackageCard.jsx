import React from "react";

export default function PackageCard({ plan, selectedCycle = "1", onSelectPackage }) {
  const planName = plan.name;
  const planDesc = plan.description || "Care Mitra visits & family connectivity";
  const base = plan.basePrice || 4999;
  const isFeatured = plan.isPopular || plan.tone === "featured";

  // Compute price based on selected billing cycle
  const durNum = parseInt(selectedCycle, 10);
  let displayPrice = base;
  let cycleLabel = "/ month";
  let cycleSubtext = null;

  if (durNum === 3) {
    const disc = plan.discountThreeMonths ?? 5;
    displayPrice = plan.priceThreeMonths
      ? plan.priceThreeMonths
      : Math.round(base * 3 * (1 - disc / 100));
    const monthly = Math.round(displayPrice / 3);
    cycleLabel = "billed for 3 months";
    cycleSubtext = `₹${monthly.toLocaleString("en-IN")}/mo`;
  } else if (durNum === 6) {
    const disc = plan.discountSixMonths ?? 10;
    displayPrice = plan.priceSixMonths
      ? plan.priceSixMonths
      : Math.round(base * 6 * (1 - disc / 100));
    const monthly = Math.round(displayPrice / 6);
    cycleLabel = "billed for 6 months";
    cycleSubtext = `₹${monthly.toLocaleString("en-IN")}/mo`;
  } else if (durNum === 12) {
    const disc = plan.discountAnnual ?? 20;
    displayPrice = plan.priceTwelveMonths
      ? plan.priceTwelveMonths
      : Math.round(base * 12 * (1 - disc / 100));
    const monthly = Math.round(displayPrice / 12);
    cycleLabel = "billed annually";
    cycleSubtext = `₹${monthly.toLocaleString("en-IN")}/mo`;
  }

  // Highlight top units (hours or visits)
  let topHighlightNum = plan.hoursPerMonth || plan.totalHours || plan.hours;
  let topHighlightUnit = "hrs/mo";

  if (!topHighlightNum && plan.visitsPerWeek) {
    topHighlightNum = plan.visitsPerWeek;
    topHighlightUnit = "visits/wk";
  }

  if (!topHighlightNum && Array.isArray(plan.packageBenefits)) {
    const hourBenefit = plan.packageBenefits.find((pb) =>
      pb.benefit?.name?.toLowerCase().includes("hour")
    );
    if (hourBenefit) {
      topHighlightNum = hourBenefit.unitsIncluded;
      topHighlightUnit = "hrs/mo";
    } else {
      const visitBenefit = plan.packageBenefits.find((pb) =>
        pb.benefit?.name?.toLowerCase().includes("visit")
      );
      if (visitBenefit) {
        topHighlightNum = visitBenefit.unitsIncluded;
        topHighlightUnit = "visits/mo";
      }
    }
  }

  // The enriched plan object to pass to checkout
  const planForCheckout = {
    ...plan,
    selectedCycle: selectedCycle,
    selectedPrice: displayPrice,
  };

  return (
    <article className={`plan-card ${isFeatured ? "plan-card--featured" : "plan-card--light"}`}>
      {(plan.isPopular || plan.badge) && (
        <div className="plan-badge">{plan.badge || "Most Popular"}</div>
      )}
      <h2>{planName}</h2>
      <p>{planDesc}</p>

      <div className="plan-hours">
        {topHighlightNum ? (
          <>
            <strong>{topHighlightNum}</strong>
            <span>{topHighlightUnit}</span>
          </>
        ) : null}
        <div style={{ marginTop: "6px" }}>
          <strong style={{ fontSize: "1.6rem", fontWeight: 800 }}>
            ₹{displayPrice.toLocaleString("en-IN")}
          </strong>
          {cycleSubtext && (
            <span style={{ fontSize: "0.85rem", color: "#6b7280", marginLeft: "6px" }}>
              {cycleSubtext}
            </span>
          )}
        </div>
        <small style={{ color: "#9ca3af", fontSize: "0.78rem" }}>{cycleLabel}</small>
      </div>

      {/* Render Real Package Benefits from API or Features array */}
      {Array.isArray(plan.packageBenefits) && plan.packageBenefits.length > 0 ? (
        <ul>
          {plan.packageBenefits.map((pb, idx) => {
            const benefitName = pb.benefit?.name || "Included Benefit";
            const rawLabel = (pb.benefit?.unitLabel || "").replace(/^per\s+/i, "").trim();
            const unitText = pb.unitsIncluded
              ? ` (${pb.unitsIncluded}${rawLabel ? " " + rawLabel : ""})`
              : "";
            return <li key={pb.id || idx}>✓ {benefitName}{unitText}</li>;
          })}
        </ul>
      ) : Array.isArray(plan.features) && plan.features.length > 0 ? (
        <ul>
          {plan.features.map((feature, idx) => (
            <li key={idx}>✓ {feature}</li>
          ))}
          {plan.muted?.map((feature, idx) => (
            <li className="muted" key={`muted-${idx}`}>
              {feature}
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          <li>✓ Care Mitra Home Visits</li>
          <li>✓ Vitals Monitoring (BP, SpO2, Weight)</li>
          <li>✓ Medication Reminders &amp; Schedule</li>
          <li>✓ 24/7 Emergency Support Line</li>
          <li>✓ Family Connect Mobile App Access</li>
        </ul>
      )}

      <button
        onClick={() => onSelectPackage && onSelectPackage(planForCheckout)}
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
}
