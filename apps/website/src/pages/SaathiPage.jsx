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
    whyJoin: ''
  });
  
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
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const res = await fetch(`${apiBase}/api/website/saathi-enrollment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitMessage({ type: 'success', text: "Thank you! Your application has been submitted successfully." });
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', gender: '',
          state: '', city: '', pincode: '', whyJoin: ''
        });
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
        <div className="max-w-[700px] mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#111111] mb-2">Become a Saathi</h2>
            <p className="text-[#666666]">Fill out your details below and our team will get in touch.</p>
          </div>

          {submitMessage && (
            <div className={`p-4 rounded-lg mb-6 ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about yourself (Why do you want to be a Saathi?)</label>
              <textarea name="whyJoin" rows="4" value={formData.whyJoin} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FE6700]/50 focus:border-[#FE6700]"></textarea>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#FE6700] text-white rounded-lg font-bold text-lg hover:bg-[#E55A00] transition-colors disabled:opacity-70">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SaathiPage;
