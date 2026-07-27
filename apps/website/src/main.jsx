import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import missionIcon from "./assets/mission.png";
import visionIcon from "./assets/vision.png";
import empathyIcon from "./assets/empathy.png";
import trustIcon from "./assets/trust.png";
import innovationIcon from "./assets/innovation.png";
import connectionIcon from "./assets/connection.png";
import hiFiIcon from "./assets/hifi.png";
import touchIcon from "./assets/touch.png";
import peaceIcon from "./assets/peace.png";
import demoVideo from "./assets/Video.mp4";
import heroBg from "./assets/back.jpg";
import logo from "./assets/logo.svg";
import healthcareIcon from "./assets/healthcare1.png";
import "./style.css";

/**
 * MaiHoonNa - Senior Care Ecosystem
 * A single-file React implementation of the landing page.
 * The primary component 'App' is exported as default to handle environment rendering.
 */
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pinCode: '',
    email: ''
  });

  const openForm = () => setIsModalOpen(true);
  const closeForm = () => {
    setIsModalOpen(false);
    setShowSuccess(false);
    setSubmitError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    // Use relative path so Vite proxy forwards to backend (no CORS)
    const apiBase = import.meta.env.VITE_API_URL || '';
    const payload = {
      name: formData.name,
      phone: formData.phone,
      pinCode: formData.pinCode,
      email: formData.email
    };

    try {
      const response = await fetch(`${apiBase}/submit-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({ name: '', phone: '', pinCode: '', email: '' });
        setShowSuccess(true);
        setTimeout(() => {
          closeForm();
        }, 3000);
      } else {
        // Show server-provided error message
        setSubmitError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubmitError('Network error — please make sure the backend server is running on port 3000.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans text-gray-800 bg-white min-h-screen selection:bg-orange-100">
      <noscript>
        <div style={{padding:'2rem',textAlign:'center',fontSize:'1.2rem'}}>
          MaiHoonNa — India's first connected senior care ecosystem. Please enable JavaScript to use the full site experience.
        </div>
      </noscript>

      {/* ================= HEADER ================= */}
      {/* ================= WRAPPER (Header + Hero Common BG) ================= */}
      <div className="relative min-h-[750px] overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 z-10 bg-white/40"></div>
        <div className="relative z-20 px-4 sm:px-6 md:px-16">

          {/* ================= HEADER ================= */}
          <header className="flex justify-between items-center px-4 sm:px-6 md:px-16 py-4 max-w-7xl mx-auto" role="banner">

            <nav aria-label="Main navigation" className="flex items-center gap-3 ml-4 md:ml-12">

              <a href="/" aria-label="MaiHoonNa – Home">
                <img
                  src={logo}
                  alt="MaiHoonNa Logo"
                  className="w-[120px] sm:w-[150px] md:w-[178px] h-auto object-contain"
                />
              </a>

            </nav>

            <button
              id="header-waitlist-btn"
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-orange-600 transition whitespace-nowrap"
              aria-label="Join the MaiHoonNa waitlist"
            >
              Join the Waitlist
            </button>

          </header>

          <div className="w-full h-px bg-gray-200"></div>

          {/* ================= HERO SECTION ================= */}
          <main role="main">
          <section id="hero" className="relative min-h-[600px] sm:min-h-[674px]" aria-label="Hero">
            <div className="max-w-[1394px] mx-auto px-4 sm:px-6 md:px-16 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 items-center h-full">

                {/* LEFT SIDE (UNCHANGED) */}
                <div className="flex flex-col justify-center h-full space-y-4 md:space-y-4 px-4 sm:px-0 md:pl-16 pt-12">
                  <div className="inline-flex items-center gap-2 bg-[#FFE1CC] border border-orange-100 px-2 py-1 rounded-full w-fit">
                    <img src={healthcareIcon} alt="Healthcare" className="w-5 h-5 object-contain" />
                    <p className="text-xs font-semibold text-gray-700 tracking-tight">
                      India's first ecosystem of connected senior care
                    </p>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-relaxed md:leading-snug">
                    We don't just care <br className="hidden md:block" />
                    for your parents.

                    {/* Mobile par ye 'block' ban kar naye line pe aa jayega, Desktop pe 'inline' rahega */}
                    <span className="text-orange-500 block md:inline">
                      <br className="hidden md:block" /> {/* Desktop layout ke liye purana break */}
                      We help them live <br className="hidden md:block" /> with purpose.
                    </span>
                  </h1>

                  <p className="text-black-500 text-[15px] sm:text-[16px] max-w-lg leading-relaxed md:leading-[1.6]">
                    By blending compassionate human support with thoughtful technology,
                    we ensure every senior feels cared for, confident, and never alone
                    at home, empowering them to pursue their passions and embrace
                    ageing as a meaningful, dignified stage.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full sm:w-60 px-4 py-2 rounded-full border border-gray-200 w-50 max-w-sm outline-none text-base placeholder:text-[12px] focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      id="hero-waitlist-btn"
                      onClick={() => setIsModalOpen(true)}
                      className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-none hover:bg-orange-600 transition whitespace-nowrap"
                      aria-label="Join the MaiHoonNa waitlist"
                    >
                      Join the Waitlist
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 ml-4 md:mt-0 mt-2">
                    Launching soon. Limited early access.
                  </p>
                </div>
                {/* RIGHT SIDE (RESPONSIVE VIDEO) */}
                <div className="relative flex justify-center md:justify-end mt-0 md:mt-10 mb-12 md:mb-0">
                  <div className="w-[90%] sm:w-[400px] md:w-[592px] h-[200px] sm:h-[300px] md:h-[500px] rounded-[20px] overflow-hidden shadow-2xl">
                    <video
                      src={demoVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Testimonial Box */}
                  <div className="absolute -bottom-6 -left-4 md:-left-12 bg-white/95 backdrop-blur-md p-2 md:p-4 rounded-2xl shadow-xl border border-white/50 max-w-[280px] md:max-w-[400px]">
                    <p className="text-xs text-black font-semibold leading-tight">
                      "Finally, a way to remain meaningfully<br />involved in my mother's health,<br />
                      wellbeing, and the life she loves, even<br /> from overseas."
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </section>
          </main>

        </div>
      </div>
      {/* ================= CHALLENGE SECTION ================= */}
      <section id="challenge" className="bg-[#FFE1cc] py-12 sm:py-16 text-center px-4 sm:px-6 md:px-16" aria-label="The Challenge">
        <p className="text-orange-600 text-sm tracking-wide mb-4">
          The Challenge
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Growing Old Shouldn't Mean<br />Growing Lonely
        </h2>
        <p className="max-w-3xl mx-auto text-black-600 text-[16px] leading-relaxed">
          Millions of seniors in India live alone, while their families live far away. Worried but<br />
          helpless. Healthcare is fragmented. Care is inconsistent. Connection fades.
        </p>
        <p className="mt-6 font-semibold max-w-3xl mx-auto text-lg italic">
          <span className="text-black-500">MaiHoonNa changes that. </span>
          We bring human companionship + <br /> connected healthcare + and family transparency
          into one trusted <br />ecosystem.
        </p>
      </section>

      {/* ================= MISSION / VISION ================= */}
      <section id="mission-vision" className="py-10 md:py-20 px-6" aria-label="Our Mission and Vision">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 md:gap-8">
          <div className="border border-gray-100 rounded-4xl p-10 text-center shadow-sm hover:shadow-md transition text-left">
            <img src={missionIcon} alt="Mission" className="w-[66px] h-[66px] mb-4" />
            <h3 className="text-2xl mb-4">Our Mission</h3>
            <p className="text-[18px] font-light leading-[29.25px] text-black">
              "To bridge human touch and technology by creating a trusted ecosystem
              of care companions and healthcare support for seniors."
            </p>
          </div>
          <div className="bg-black/80 text-white rounded-4xl p-10 text-center shadow-sm hover:shadow-lg transition text-left">
            <img src={visionIcon} alt="Vision" className="w-[66px] h-[66px] mb-4" />
            <h3 className="text-2xl font-normal mb-4">Our Vision</h3>
            <p className="text-[18px] font-light leading-[29.25px] text-white">
              "To build India's most trusted connected care ecosystem,
              where every home has a companion and every family feels supported."
            </p>
          </div>
        </div>
      </section>

      {/* ================= CORE VALUES ================= */}
      <section id="core-values" className="py-6 md:py-10 px-6 bg-white text-center mb-6 md:mb-12" aria-label="Core Values">

        <h3 className="text-2xl mb-8 text-black tracking-widest text-semibold">
          Core Values
        </h3>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

          {[
            { title: "Empathy", desc: "We listen first", icon: empathyIcon },
            { title: "Trust", desc: "We protect dignity", icon: trustIcon },
            { title: "Innovation", desc: "We evolve with care", icon: innovationIcon },
            { title: "Connection", desc: "We keep families close", icon: connectionIcon }
          ].map((val, idx) => (

            <div
              key={idx}
              className={`p-5 rounded-xl ${idx === 0 || idx === 2
                ? "bg-[#FFF7ED]"
                : "bg-[#F1F1F1]"
                }`}
            >

              <img
                src={val.icon}
                alt={val.title}
                className="w-6 h-6 mx-auto mb-1"
              />

              <h4 className="text-sm text-black-800 mb-1">
                {val.title}
              </h4>

              <p className="text-xs text-black-600">
                {val.desc}
              </p>

            </div>
          ))}
        </div>
      </section>

      {/* ================= ALWAYS PRESENT ================= */}
      <section id="why-maihoonna" className="bg-orange-500 text-white py-20 text-center px-6 mt-12" aria-label="Why MaiHoonNa">
        <p className="text-[16px] font-medium tracking-widest mb-4 opacity-80">
          Why "MaiHoonNa"
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Always Present</h2>
        <p className="italic text-xl mb-4 opacity-90">"Mai Hoon Na" means "I am here for you."</p>
        <p className="max-w-2xl mx-auto text-lg leading-relaxed opacity-80">
          Our name is our promise. We stand beside seniors and their<br />
          families, 24/7, without judgment, without compromise.
        </p>
      </section>

      {/* ================= WHAT MAKES US DIFFERENT ================= */}

      <section id="differentiators" className="py-18 px-6 text-center bg-white" aria-label="What Makes Us Different">
        <h2 className="text-3xl mb-16">What Makes Us Different</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              h: "Human Touch",
              p: (<>Our companions are not just caregivers. They<br /> are listeners, friends, and motivators, helping<br /> seniors live with dignity.</>),
              icon: touchIcon,
            },
            {
              h: "Connected Ecosystem",
              p: (<>Smart technology that keeps families <br />informed—health updates, daily check-ins,<br /> and care visibility in real time.</>),
              icon: hiFiIcon,
            },
            {
              h: "Peace of Mind",
              p: (<>Know your parents are safe and<br /> emotionally fulfilled, even when you’re<br /> thousands of miles away.</>),
              icon: peaceIcon,
            },
          ].map((item, i) => (
            <div
              key={i}
            >
              <img
                src={item.icon}
                alt={item.h}
                className="w-[66px] h-[66px] mx-auto mb-6"
              />

              <h3 className="text-xl mb-3 text-black-500">
                {item.h}
              </h3>

              <p className="text-[13px] text-black-600 leading-relaxed">
                {item.p}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WAITLIST CTA ================= */}
      <section id="waitlist" className="bg-[#2f2f2f] py-24 text-center px-6" aria-label="Join the Waitlist">

        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 max-w-4xl mx-auto leading-tight px-4">
          Be Part of India's
          <span className="inline-block md:block">
            <span className="whitespace-nowrap">Senior Care</span> Revolution
          </span>
        </h2>

        <p className="text-white max-w-2xl mx-auto mb-10 text-[15px]">
          Early members get priority access, updates, and exclusive benefits.<br />
          Join us in building the ecosystem India’s seniors deserve.
        </p>

        {/* Email + Button Row */}
        <div className="max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            className="w-[200px] px-4 h-11 rounded-full bg-[#808080] text-white text-[16px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <button
            id="cta-waitlist-btn"
            onClick={openForm}
            className="bg-orange-500 text-white px-5 h-11 rounded-full text-[13px] font-semibold hover:bg-orange-600 transition active:scale-95 whitespace-nowrap flex items-center justify-center"
            aria-label="Join the MaiHoonNa waitlist"
          >
            Join the Waitlist
          </button>

        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[#828282] mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>We respect your privacy. No spam.</span>
        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-100 py-10 px-6 sm:px-8 md:px-36 lg:px-44 bg-white" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">

          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="MaiHoonNa Logo"
              style={{ width: '177.97px', height: '40px' }} className="object-contain"
            />
          </div>

          <p className="text-center text-[10px] font-medium">
            © 2026 MaiHoonNa. India's trusted senior care ecosystem.
          </p>

          <div className="flex gap-6 font-medium text-gray-600 text-xs">
            <a href="#" className="hover:text-orange-500 transition">Privacy Policy</a>
            <a href="#" className="hover:text-orange-500 transition">Terms &amp; Conditions</a>
          </div>

        </div>
      </footer>
      {/* ================= FORM MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-label="Waitlist registration form">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">

            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl transition"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-center mb-2">Share Your Details</h2>
            <p className="text-center text-gray-500 mb-8">
              Help us understand you better so we can serve you right.
            </p>

            {showSuccess && (
              <div className="mb-6 text-center text-green-700 font-bold bg-green-50 p-4 rounded-xl border border-green-100">
                ✅ Form submitted successfully! We'll get back to you soon.
              </div>
            )}

            {submitError && (
              <div className="mb-6 text-center text-red-600 font-semibold bg-red-50 p-4 rounded-xl border border-red-100">
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Waitlist registration">

              <input
                id="form-name"
                type="text"
                name="name"
                placeholder="Full Name"
                required
                aria-label="Full Name"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
              />

              <input
                id="form-phone"
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                required
                aria-label="Mobile Number"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
              />

              <input
                id="form-pincode"
                type="text"
                name="pinCode"
                placeholder="Pin Code"
                required
                aria-label="Pin Code"
                autoComplete="postal-code"
                value={formData.pinCode}
                onChange={handleInputChange}
                pattern="[0-9]{6}"
                maxLength={6}
                title="Enter a valid 6-digit pin code"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />

              <input
                id="form-email"
                type="email"
                name="email"
                placeholder="Email Address"
                required
                aria-label="Email Address"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
              />

              <button
                id="form-submit-btn"
                type="submit"
                disabled={isSubmitting || showSuccess}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition shadow-lg active:scale-95 disabled:bg-gray-300"
                aria-label="Submit your details"
              >
                {isSubmitting ? "Submitting..." : showSuccess ? "Done!" : "Submit Details"}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;




ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
