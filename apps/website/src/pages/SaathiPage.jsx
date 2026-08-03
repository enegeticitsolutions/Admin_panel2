import React, { useState, useEffect } from 'react';

const SaathiPage = () => {
  const [content, setContent] = useState(null);
  const [saathis, setSaathis] = useState([]);
  const [liveStats, setLiveStats] = useState({ activeCount: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    state: '',
    city: '',
    pincode: '',
    area: '',
    whyJoin: '',
    dob: ''
  });
  
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  
  // Accordion state for How It Works
  const [expandedStep, setExpandedStep] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiBase}/api/website/content/sathi`);
        const data = await res.json();
        
        if (data.success) {
          setContent(data.data.content);
          setSaathis(data.data.saathis || []);
          if (data.data.liveStats) {
            setLiveStats(data.data.liveStats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Saathi content", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreementChecked) {
      setSubmitMessage({ type: 'error', text: 'You must agree to the background verification to proceed.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    
    // Calculate age from dob
    let age = null;
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    
    const payload = { ...formData, age };
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const res = await fetch(`${apiBase}/api/website/saathi-enrollment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitMessage({ type: 'success', text: "Thank you! Your application has been submitted successfully." });
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', gender: '',
          state: '', city: '', pincode: '', area: '', whyJoin: '', dob: ''
        });
        setAgreementChecked(false);
      } else {
        setSubmitMessage({ type: 'error', text: data.message || "Something went wrong. Please try again." });
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: "Network error. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#FE6700] font-[Poppins]">Loading...</div>;
  }

  // Fallback content in case DB is not seeded or fetch fails
  const heroContent = content?.hero || {
    title: "Companionship that doesn't run on the clock.",
    subtitle: "Community volunteers who visit for company, conversation, or assistance",
    stats: [
      { number: "340+", label: "Active Saathis" },
      { number: "8,200+", label: "Hours given" },
      { number: "100%", label: "Background verified" }
    ]
  };

  const stepsContent = content?.steps || [];
  const rewardsContent = content?.rewards || [];

  return (
    <div className="font-[Poppins] text-[#111111] overflow-x-hidden">
      {/* ── HERO SECTION ── */}
      <section className="relative w-full h-auto min-h-[790px] pt-[111px] bg-gradient-to-r from-[rgba(17,17,17,0.88)] via-[rgba(17,17,17,0.72)] to-[rgba(254,103,0,0.35)] flex flex-col justify-center text-white px-6 md:px-20">
        <div className="max-w-[1100px] mx-auto w-full relative z-10 py-16">
          <div className="inline-flex items-center px-4 py-2 gap-2 bg-[rgba(254,103,0,0.13)] border border-[rgba(254,103,0,0.33)] rounded-full mb-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path></svg>
            <span className="text-[#FE6700] text-sm font-semibold uppercase tracking-wider">Saathi Network · Volunteer Programme</span>
          </div>
          
          <h1 className="text-5xl md:text-[64px] font-bold leading-[1.1] mb-6 max-w-[712px]">
            {heroContent.title}
          </h1>
          
          <p className="text-lg md:text-xl text-white/75 leading-[1.8] max-w-[520px] mb-10">
            {heroContent.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <button onClick={() => document.getElementById('enrollment-form').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-[#FE6700] text-white rounded-full font-semibold flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(254,103,0,0.4)]">
              Volunteer Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button className="px-8 py-4 bg-white/10 border border-white/25 rounded-full font-semibold text-white">
              How It Works
            </button>
          </div>

          <div className="flex flex-wrap gap-12 pt-10 border-t border-white/10">
            {heroContent.stats.map((stat, idx) => {
              const formatStat = (val) => {
                if (!val || val === 0) return '0';
                if (val < 5) return val.toString(); // Don't show '0+' for small numbers
                return Math.floor(val / 5) * 5 + '+';
              };
              
              let displayNum = stat.number;
              if (idx === 0 && liveStats.activeCount > 0) {
                displayNum = liveStats.activeCount.toString();
              } else if (idx === 1 && liveStats.totalHours > 0) {
                displayNum = formatStat(liveStats.totalHours);
              } else if (idx === 2) {
                displayNum = "100%";
              }

              return (
                <div key={idx} className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#FE6700] leading-none">{displayNum}</span>
                  <span className="text-sm text-white/60 mt-1">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="py-24 px-6 md:px-20 bg-[#F7F7F7]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row gap-16 relative">
          
          <div className="md:w-1/3 sticky top-32 self-start">
            <span className="text-[#FE6700] text-sm font-semibold tracking-wider uppercase mb-2 block">How It Works</span>
            <h2 className="text-[38px] font-bold leading-[1.2] mb-6 text-[#111111]">
              Volunteers who give time, earn recognition
            </h2>
            <p className="text-[#666666] text-base leading-[1.75] mb-8">
              We've built a thorough but respectful process to ensure the safety of our seniors and the growth of our Saathis.
            </p>
            <button onClick={() => document.getElementById('enrollment-form').scrollIntoView({ behavior: 'smooth' })} className="px-7 py-3 bg-[#FE6700] text-white rounded-full font-semibold flex items-center gap-2">
              Start Your Application
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          <div className="md:w-2/3 flex flex-col gap-4">
            {stepsContent.map((step, idx) => {
              const isExpanded = expandedStep === idx;
              return (
                <div 
                  key={idx} 
                  onClick={() => setExpandedStep(idx)}
                  className={`bg-white rounded-[20px] transition-all duration-300 cursor-pointer overflow-hidden border-2 ${isExpanded ? 'border-[#FE6700] shadow-[0_8px_32px_rgba(254,103,0,0.13)]' : 'border-[#E5E5E5] hover:border-gray-300'}`}
                >
                  <div className="p-6 md:px-8 md:py-6 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'bg-[#FE6700] text-white' : 'bg-[#FFF1E8] text-[#FE6700]'}`}>
                          {/* Use simple icons or numbers; matching the figma look */}
                          <span className="font-bold text-lg">0{idx + 1}</span>
                        </div>
                        <div>
                          <h3 className={`text-[17px] font-bold transition-colors ${isExpanded ? 'text-[#FE6700]' : 'text-[#111111]'}`}>
                            <span className="text-[#FE6700] font-bold mr-2 opacity-50 text-sm">0{idx + 1}</span>
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">
                        <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#FE6700]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Collapsible Content */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="pl-[72px] pr-8 pb-2">
                          <p className="text-[#666666] text-sm leading-[1.6]">{step.description}</p>
                          {idx === 0 && (
                            <div className="mt-4 p-3 bg-[#FFF9F5] border border-[#FFE4D6] rounded-lg flex items-start gap-2">
                              <span className="text-xl leading-none">💡</span>
                              <span className="text-xs text-[#666666]">Required: Aadhaar, passport photo, 2 references. We review within 24 hours.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── REWARDS SECTION ── */}
      <section className="py-24 px-6 md:px-20 bg-[#111111] text-white text-center">
        <div className="max-w-[1100px] mx-auto">
          <span className="text-[#FE6700] text-sm font-semibold tracking-wider uppercase mb-2 block">Why become a Saathi</span>
          <h2 className="text-[38px] font-bold leading-[1.2] mb-16 max-w-[550px] mx-auto">
            Give an hour. Change a day. Earn real rewards.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewardsContent.map((reward, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-[20px] p-8 text-left hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4">
                  {idx === 0 ? "🎁" : idx === 1 ? "🏆" : idx === 2 ? "📜" : "🤝"}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{reward.title}</h3>
                <p className="text-sm text-[#AAAAAA] leading-[1.7]">{reward.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET OUR SAATHIS ── */}
      <section className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-[1100px] mx-auto text-center">
          <span className="text-[#FE6700] text-sm font-semibold tracking-wider uppercase mb-2 block">Our Community</span>
          <h2 className="text-[38px] font-bold leading-[1.2] mb-4 text-[#111111]">Meet our Saathis</h2>
          <p className="text-[#666666] text-[17px] max-w-[480px] mx-auto mb-16">
            Every Saathi is background-verified, trained, and passionate about making a difference.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {saathis.length > 0 ? saathis.map((saathi, idx) => (
              <div key={idx} className="w-[257px] bg-white border border-[#E5E5E5] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-left">
                <div className="h-[200px] bg-gray-200 w-full overflow-hidden">
                  {saathi.profilePhoto ? (
                    <img src={saathi.profilePhoto} alt={saathi.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#FFF1E8] flex items-center justify-center text-4xl text-[#FE6700] font-bold">
                      {saathi.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[17px] text-[#111111]">{saathi.name}</h3>
                  <div className="flex items-center gap-1 mt-1 mb-4">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span className="text-[13px] text-[#666666]">{saathi.city}, {saathi.state}</span>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-3 mt-3 flex justify-between items-center">
                    <div>
                      <div className="flex text-[#FE6700] text-[10px]">
                        ★ ★ ★ ★ ★
                      </div>
                      <span className="text-xs text-[#666666]">4.9 · Verified</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#FE6700] leading-none">{Math.round(Number(saathi.totalCreditHours || 0) * 10) / 10}</div>
                      <span className="text-[11px] text-[#999999]">hours given</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center w-full text-gray-500 py-10 border border-dashed rounded-xl">No active Saathis yet! Be the first to join.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── ENROLLMENT FORM ── */}
      <section id="enrollment-form" className="py-24 px-6 md:px-20 bg-[#F7F7F7]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Side: Steps and Information */}
          <div className="lg:w-1/2 flex flex-col justify-start">
            <span className="text-[#FE6700] text-sm font-semibold tracking-wider uppercase mb-2 block">READY TO JOIN?</span>
            <h2 className="text-4xl md:text-[42px] font-bold text-[#111111] mb-6 leading-tight">
              Saathi Enrollment Application
            </h2>
            <p className="text-[#666666] text-lg mb-12">
              Your application first takes about 10-14 days. Here's what to expect:
            </p>

            <div className="flex flex-col gap-8">
              {/* Step 1 */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div>
                  <span className="text-[#FE6700] text-xs font-bold uppercase tracking-wider block mb-1">STEP 1</span>
                  <h4 className="text-[17px] font-bold text-[#111111] mb-1">Share your info</h4>
                  <p className="text-[#666666] text-sm">Fill the form · 10 mins</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                </div>
                <div>
                  <span className="text-[#FE6700] text-xs font-bold uppercase tracking-wider block mb-1">STEP 2</span>
                  <h4 className="text-[17px] font-bold text-[#111111] mb-1">Background verification</h4>
                  <p className="text-[#666666] text-sm">3-5 working days</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FE6700" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <span className="text-[#FE6700] text-xs font-bold uppercase tracking-wider block mb-1">STEP 3</span>
                  <h4 className="text-[17px] font-bold text-[#111111] mb-1">You go live</h4>
                  <p className="text-[#666666] text-sm">First assignments begin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 md:p-10 border border-[#E5E5E5]">
              {submitMessage && (
                <div className={`p-4 rounded-lg mb-6 ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {submitMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">First Name *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">Last Name *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">Gender *</label>
                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">Date of Birth *</label>
                    <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all text-[#111111]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">State *</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">Area / Sector *</label>
                    <input required type="text" name="area" value={formData.area} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#111111] mb-2">Pin Code *</label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-2">Why do you want to be a Saathi? *</label>
                  <textarea required name="whyJoin" rows="4" placeholder="Tell us what motivates you to volunteer..." value={formData.whyJoin} onChange={handleChange} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/30 focus:border-[#FE6700] transition-all resize-none"></textarea>
                </div>

                <div className="bg-[#FFF1E8] border border-[#FFE4D6] rounded-xl p-4 flex items-start gap-3 mt-4">
                  <div className="pt-0.5 shrink-0">
                    <input 
                      type="checkbox" 
                      id="agreement" 
                      checked={agreementChecked}
                      onChange={(e) => setAgreementChecked(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#FE6700] focus:ring-[#FE6700]" 
                    />
                  </div>
                  <label htmlFor="agreement" className="text-sm text-[#111111] leading-relaxed cursor-pointer">
                    I agree to undergo background verification (Aadhaar-linked identity + police check). I confirm the information above is accurate and I will abide by MaiHoonNa's Saathi code of conduct.
                  </label>
                </div>

                <button disabled={isSubmitting || !agreementChecked} type="submit" className="w-full py-4 bg-[#FE6700] text-white rounded-xl font-bold text-[15px] hover:bg-[#E55A00] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(254,103,0,0.39)] mt-6">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  {isSubmitting ? 'Submitting...' : 'Submit Enrollment Application'}
                </button>
                
                <p className="text-center text-[#999999] text-[13px] mt-4">
                  We respond within 24 hours · Your data stays private
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBSCRIBERS SECTION ── */}
      <section className="py-24 px-6 md:px-20 bg-[#111111] text-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#FE6700] text-xs font-bold tracking-widest uppercase mb-3 block">FOR SUBSCRIBERS</span>
            <h2 className="text-3xl md:text-[42px] font-bold text-white">
              How to access the Saathi Network
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#1A1A1A] rounded-3xl p-8 md:p-10">
              <div className="text-3xl mb-6">📦</div>
              <h3 className="text-xl font-bold text-white mb-3">Included in Plus & Premium</h3>
              <p className="text-[#999999] text-[15px] leading-relaxed">
                Saathi Network visits are included in Saathi Plus and Premium plans at no extra cost. Starter members can add on.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#1A1A1A] rounded-3xl p-8 md:p-10">
              <div className="text-3xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-3">Privacy by design</h3>
              <p className="text-[#999999] text-[15px] leading-relaxed">
                Care Mitras never share your family's personal information. All visits are logged but contact details stay private.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1A1A1A] rounded-3xl p-8 md:p-10">
              <div className="text-3xl mb-6">📍</div>
              <h3 className="text-xl font-bold text-white mb-3">All visits tracked</h3>
              <p className="text-[#999999] text-[15px] leading-relaxed">
                Geo-fenced check-ins confirm every Saathi arrival and departure. Full visit history visible on Family Connect.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaathiPage;
