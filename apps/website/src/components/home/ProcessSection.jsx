import React from "react";

const processSteps = [
  {
    title: "Tell us about your family",
    text: "Share your loved one's routine, health conditions, and the kind of support they need. Takes less than 5 minutes.",
  },
  {
    title: "Choose a plan",
    text: "Pick Starter, Plus, or Premium. Adjust any time as your needs evolve.",
  },
  {
    title: "Meet your Care Mitra",
    text: "We match a BGV-verified Care Mitra by location, language, gender preference, and specific needs.",
  },
  {
    title: "Visits begin on schedule",
    text: "Geo-fenced check-ins confirm every visit. Vitals, mood, and medication adherence logged each time.",
  },
  {
    title: "Stay connected from anywhere",
    text: "Family Connect shows visit history, vitals trends, and a live Happiness Score – from any time zone.",
  },
];

/**
 * ProcessSection Component
 */
const ProcessSection = () => {
  return (
    <section className="process">
      <div className="section-heading">
        <span>HOW IT WORKS</span>
        <h2>From the first call to the first visit</h2>
        <p>Simple, transparent, and human - every step of the way.</p>
      </div>

      <div className="timeline">
        {processSteps.map((step, index) => (
          <div className="timeline__item" key={step.title}>
            <div className="timeline__number">{index + 1}</div>
            <div className="timeline__content">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProcessSection;
