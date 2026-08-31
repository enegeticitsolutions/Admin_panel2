import React from "react";
import healthcareIcon from "../../assets/healthcare1.png";
import homePageCutOut from "../../assets/homePageCutOut.png";

/**
 * HeroSection Component
 */
const HeroSection = ({ openForm }) => {
  return (
    <section className="hero" id="home">
      {/* Background video */}
      <video
        className="hero__bg-video"
        src="/src/assets/Home-Header-Background-Video.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero__inner">
        <div className="hero__copy">
          <div className="eyebrow">
            <img src={healthcareIcon} alt="MaiHoonNa - Connected Senior Care Ecosystem" loading="eager" fetchpriority="high" width="20" height="20" />
            India's first connected senior care ecosystem
          </div>
          <h1>
            <span>Growing older, without giving up on living.</span>
            Real conversations. Real activities. Real dignity, delivered with heart
          </h1>
          <p>
            Compassionate Care Mitras (nurses and care givers), a volunteer Saathi Network, real-time loved one visibility, and a community ecosystem
          </p>

          <div className="hero-form" aria-label="Join the waitlist">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              onClick={openForm}
              readOnly
            />
            <button onClick={openForm}>Join Waitlist</button>
          </div>

          <p className="hero-location">Launching in Gurugram Sectors 53 to 57</p>

        </div>
      </div>
      
      <div className="hero-cutout-wrapper">
        <img 
          src={homePageCutOut} 
          alt="Care Mitras and Seniors" 
          className="hero-cutout"
        />
      </div>
    </section>
  );
};

export default HeroSection;
