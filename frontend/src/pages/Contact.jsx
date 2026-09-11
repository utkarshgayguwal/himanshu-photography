import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Share2, Send, CheckCircle } from 'lucide-react';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeUp({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const services = [
  'Wedding Photography',
  'Engagement Shoot',
  'Pre-Wedding Shoot',
  'Post-Wedding Shoot',
  'Haldi / Mehendi',
  'Baby Naming Ceremony',
  'Birthday Shoot',
  'Concert / Event',
  'Drone Photography',
  'Candid Photography',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', date: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: form.date || null }),
      });
      if (!res.ok) throw new Error('Request failed');
      setSubmitted(true);
    } catch {
      setError("Something went wrong sending your message. Please try again, or reach out via phone/email above.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-transparent border-b border-[#C9A96E]/20 text-[#F5F0E8] text-sm py-3 focus:outline-none focus:border-[#C9A96E]/60 transition-colors placeholder-[#F5F0E8]/20 font-light";

  return (
    <div className="bg-[#0D0D0D] pt-16">
      {/* Hero */}
      <section className="relative py-32 min-h-[680px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=80"
            alt="Contact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0D0D0D]/85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="gold-line" />
              <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                Get in Touch
              </span>
              <div className="gold-line" />
            </div>
            <h1
              className="text-6xl md:text-7xl lg:text-8xl leading-[0.88] text-[#F5F0E8] mb-6"
              style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
            >
              Let's Create
              <br />
              <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Something
              </span>
              <br />
              Timeless.
            </h1>
            <p className="text-[#F5F0E8]/50 text-sm font-light max-w-lg mx-auto" style={{ fontFamily: 'DM Sans' }}>
              Share your vision and let's craft a photography experience as unique as your story.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Info */}
            <FadeUp>
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="gold-line" />
                  <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                    Contact Details
                  </span>
                </div>
                <h2
                  className="text-4xl md:text-5xl leading-[0.9] text-[#F5F0E8] mb-8"
                  style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                >
                  We'd love to hear
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    your story.
                  </span>
                </h2>
                <p className="text-[#F5F0E8]/50 text-sm font-light leading-relaxed mb-10" style={{ fontFamily: 'DM Sans' }}>
                  Whether you're planning a wedding, a baby shower, or just want to talk about how we can preserve your most precious moments — reach out. We respond to every enquiry within 24 hours.
                </p>

                <div className="space-y-6 mb-10">
                  {[
                    { icon: <Phone size={15} />, label: 'Phone', val: '+91 99999 99999', href: 'tel:+919999999999' },
                    { icon: <Mail size={15} />, label: 'Email', val: 'contact@himanshuphotography.com', href: 'mailto:contact@himanshuphotography.com' },
                    { icon: <MapPin size={15} />, label: 'Location', val: 'Himanshu Photography', href: 'https://maps.app.goo.gl/v3pQVjyQQNgu795Z6' },
                  ].map(c => (
                    <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="flex items-start gap-4 group">
                      <div className="text-[#C9A96E]/60 group-hover:text-[#C9A96E] transition-colors mt-0.5">{c.icon}</div>
                      <div>
                        <p className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ fontFamily: 'DM Sans' }}>{c.label}</p>
                        <p className="text-[#F5F0E8]/70 text-sm group-hover:text-[#C9A96E] transition-colors" style={{ fontFamily: 'DM Sans' }}>{c.val}</p>
                      </div>
                    </a>
                  ))}
                </div>

                <div>
                  <p className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase mb-4" style={{ fontFamily: 'DM Sans' }}>Follow on Social</p>
                  <div className="flex gap-4">
                    <a href="#" className="glass-card p-3 hover:border-[#C9A96E]/30 transition-colors group">
                      <Share2 size={16} className="text-[#F5F0E8]/40 group-hover:text-[#C9A96E] transition-colors" />
                    </a>
                    <a href="#" className="glass-card p-3 hover:border-[#C9A96E]/30 transition-colors group">
                    </a>
                  </div>
                </div>

                {/* Map embed placeholder */}
                <div className="mt-10 border border-[#C9A96E]/15 overflow-hidden aspect-video">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3755.5957379933047!2d79.1832055!3d19.7298282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd2c52697c6e943%3A0x606f21804753a985!2sHimanshu%20Photography%2025!5e0!3m2!1sen!2sin!4v1777316964373!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(80%) brightness(0.6) sepia(20%)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location Map"
                  />
                </div>
              </div>
            </FadeUp>

            {/* Form */}
            <FadeUp delay={0.2}>
              <div className="glass-card p-8 md:p-10">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <CheckCircle size={48} className="text-[#C9A96E] mb-6" />
                    <h3
                      className="text-3xl text-[#F5F0E8] mb-3"
                      style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                    >
                      Message Received
                    </h3>
                    <p className="text-[#F5F0E8]/50 text-sm font-light" style={{ fontFamily: 'DM Sans' }}>
                      Thank you for reaching out. Himanshu will personally get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3
                      className="text-3xl text-[#F5F0E8] mb-8"
                      style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                    >
                      Book Your Session
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: 'DM Sans' }}>Your Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Priya Sharma"
                            className={inputCls}
                            style={{ fontFamily: 'DM Sans' }}
                          />
                        </div>
                        <div>
                          <label className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: 'DM Sans' }}>Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="+91 98765 43210"
                            className={inputCls}
                            style={{ fontFamily: 'DM Sans' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: 'DM Sans' }}>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="priya@email.com"
                          className={inputCls}
                          style={{ fontFamily: 'DM Sans' }}
                        />
                      </div>

                      <div>
                        <label className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: 'DM Sans' }}>Service Required *</label>
                        <select
                          name="service"
                          value={form.service}
                          onChange={handleChange}
                          required
                          className={`${inputCls} cursor-pointer`}
                          style={{ fontFamily: 'DM Sans', background: 'transparent' }}
                        >
                          <option value="" disabled style={{ background: '#1A1A1A' }}>Select a service</option>
                          {services.map(s => (
                            <option key={s} value={s} style={{ background: '#1A1A1A' }}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: 'DM Sans' }}>Event Date</label>
                        <input
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          className={inputCls}
                          style={{ fontFamily: 'DM Sans', colorScheme: 'dark' }}
                        />
                      </div>

                      <div>
                        <label className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: 'DM Sans' }}>Tell us about your vision</label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Share your story, location ideas, special requests..."
                          className={`${inputCls} resize-none`}
                          style={{ fontFamily: 'DM Sans' }}
                        />
                      </div>

                      {error && (
                        <p className="text-red-400/80 text-xs" style={{ fontFamily: 'DM Sans' }}>{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-gold w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Sending...' : 'Send Message'} <Send size={13} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}
