import React, { useState } from "react";
import piccImg from "../../assets/picc.png";

const serviceTabs = [
  {
    title: "Vitals Monitoring",
    summary: "BP, O2, temperature, weight — logged with date, time, and location after every visit.",
    detail: "All vitals are stored in your Family Connect app with trend graphs. Sudden deviations trigger an immediate alert to the family.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    )
  },
  {
    title: "Medication Adherence",
    summary: "Reminders set per schedule, adherence tracked and reported automatically.",
    detail: "Your Care Mitra follows a prescription-linked schedule, ensuring your parent takes the right doses on time, logging any anomalies immediately.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    )
  },
  {
    title: "Mood & Happiness Logging",
    summary: "If something seems off, your Family Connect app alerts you immediately.",
    detail: "Mitras perform interactive mood assessments and logging. Positive indicators help gauge long-term mental well-being.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  },
  {
    title: "Clinic Accompaniment",
    summary: "Care Mitra accompanies your parent to appointments and shares a structured summary.",
    detail: "Includes transport booking assistance, waiting queue support, doctor instruction recording, and updating files post-consultation.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
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

/**
 * CareMitraServicesSection Component
 * Independent Care Mitra Home Visits section for Services Page (IMAGE 2 reference).
 */
const CareMitraServicesSection = () => {
  const [activeServiceTab, setActiveServiceTab] = useState(0);
  const [activeTierTab, setActiveTierTab] = useState(0);

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#FE6700" : "#E5E5E5"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
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
};

export default CareMitraServicesSection;
