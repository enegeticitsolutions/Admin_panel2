import React from "react";

const faqs = [
  "What is a Care Mitra?",
  "How is MaiHoonNa different from hiring a caregiver directly?",
  "What happens if I am not happy with my Care Mitra?",
  "How does the Happiness Score work?",
  "Can I manage care from abroad as an NRI?",
  "Is MaiHoonNa available outside Gurugram?",
  "What does the Saathi Network do?",
  "Can I change or cancel my plan?",
];

/**
 * FaqSection Component
 */
const FaqSection = () => {
  return (
    <section className="faq">
      <div className="section-heading">
        <span>FAQ</span>
        <h2>Questions we hear often</h2>
        <p>Can't find what you're looking for? Write to us at <a href="mailto:info@maihoonna.in">info@maihoonna.in</a></p>
      </div>

      <div className="faq-list">
        {faqs.map((question) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>Our team will help you understand the right care flow, plan, and support model for your family.</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
