import React from "react";

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

/**
 * ChallengeSection Component
 */
const ChallengeSection = () => {
  return (
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
  );
};

export default ChallengeSection;
