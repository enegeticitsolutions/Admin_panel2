import React from "react";
import demoVideo from "../../assets/Video.mp4";

const trustSignals = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "100% BGV Verified",
    text: "Every Care Mitra"
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Geo-fenced Visits",
    text: "Every check-in confirmed"
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    title: "Registered Company",
    text: "Gurugram, India"
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "4.9 / 5 Rating",
    text: "From real families"
  }
];

/**
 * VideoSection Component
 */
const VideoSection = () => {
  return (
    <section className="video-section">
      <div className="section-heading">
        <span>OUR STORY</span>
        <h2>
          See Why Families Trust <span style={{ display: "block", color: "var(--orange)" }}>MaiHoonNa</span>
        </h2>
        <p>A 2-minute story about what it means to care — and why we built an entire ecosystem around it.</p>
      </div>

      <div className="video-frame">
        <video src={demoVideo} autoPlay loop muted playsInline />
        <p>"Mai Hoon Na - We are here for you."</p>
      </div>

      <div className="trust-row">
        {trustSignals.map((item) => (
          <div className="trust-item" key={item.title}>
            <div className="trust-item__icon">{item.icon}</div>
            <div className="trust-item__text">
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VideoSection;
