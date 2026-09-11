import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Heart, Award } from 'lucide-react';

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

export default function About() {
  return (
    <div className="bg-[#0D0D0D] pt-16">
      {/* Hero */}
      <section className="relative py-32 min-h-[680px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1800&q=80"
            alt="About"
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
                About the Artist
              </span>
              <div className="gold-line" />
            </div>
            <h1
              className="text-6xl md:text-7xl lg:text-8xl leading-[0.88] text-[#F5F0E8] mb-6"
              style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
            >
              The Eye
              <br />
              Behind the
              <br />
              <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Lens
              </span>
            </h1>
            <p className="text-[#F5F0E8]/50 text-sm font-light max-w-lg mx-auto" style={{ fontFamily: 'DM Sans' }}>
              I'm Himanshu Gayguwal — a photographer from Mumbai who believes every moment deserves to be remembered, and every story deserves to be beautifully told.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <FadeUp>
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="gold-line" />
                  <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                    My Story
                  </span>
                </div>
                <h2
                  className="text-4xl md:text-5xl leading-[0.9] text-[#F5F0E8] mb-6"
                  style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                >
                  Photography is not
                  <br />
                  just my craft —
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    it's my calling.
                  </span>
                </h2>
                <div className="space-y-4 text-[#F5F0E8]/50 text-sm font-light leading-relaxed" style={{ fontFamily: 'DM Sans' }}>
                  <p>
                    It started with a borrowed camera at my cousin's wedding in 2015. I was 20 years old, nervous, and completely in love with the idea that I could stop time with a click. The photographs I took that day were far from perfect — but the emotion in them was real.
                  </p>
                  <p>
                    That night, watching my family gather around those images, laughing and crying at the same time — I knew this was what I was meant to do. Not just take photographs, but give people a way to return to the moments they love most.
                  </p>
                  <p>
                    Eight years later, with over 500 weddings and 2,000 families served, the mission remains the same: to be always there to capture your remembering moments. With every shutter click, I pour my whole heart into telling your story with honesty, beauty, and depth.
                  </p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="relative">
                <div className="img-zoom overflow-hidden aspect-[3/4]">
                  <img
                    src="https://images.unsplash.com/photo-1552168324-d612d77725e3?w=700&q=80"
                    alt="Himanshu"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Quote overlay */}
                <div className="absolute -bottom-8 -left-8 glass-card p-6 max-w-xs">
                  <p
                    className="text-[#F5F0E8]/80 text-base leading-snug italic"
                    style={{ fontFamily: 'Cormorant Garamond' }}
                  >
                    "I don't take photos. I preserve feelings."
                  </p>
                  <p className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.15em] uppercase mt-3" style={{ fontFamily: 'DM Sans' }}>
                    — Himanshu Gayguwal
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="gold-line" />
                <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                  What I Believe
                </span>
                <div className="gold-line" />
              </div>
              <h2
                className="text-5xl md:text-6xl leading-[0.9] text-[#F5F0E8]"
                style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
              >
                The Philosophy
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C9A96E]/10">
            {[
              {
                icon: <Heart size={20} className="text-[#C9A96E]" />,
                title: 'Emotion First',
                desc: 'Technical perfection is meaningless without emotional truth. I always prioritize the feeling of a photograph over its technical precision.',
              },
              {
                icon: <Camera size={20} className="text-[#C9A96E]" />,
                title: 'Present Always',
                desc: 'The decisive moment can\'t be recreated. I stay alert, patient, and fully present so nothing meaningful is ever missed.',
              },
              {
                icon: <Award size={20} className="text-[#C9A96E]" />,
                title: 'Uncompromising Quality',
                desc: 'Every image I deliver is one I\'d be proud to frame in my own home. If it doesn\'t move me, it doesn\'t make the cut.',
              },
            ].map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.1}>
                <div className="bg-[#080808] p-8 md:p-12">
                  <div className="mb-6">{v.icon}</div>
                  <h3
                    className="text-2xl text-[#F5F0E8] mb-3"
                    style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-[#F5F0E8]/45 text-sm font-light leading-relaxed" style={{ fontFamily: 'DM Sans' }}>
                    {v.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <FadeUp>
              <div className="grid grid-cols-2 gap-3">
                <div className="img-zoom overflow-hidden aspect-square">
                  <img src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=500&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="img-zoom overflow-hidden aspect-square mt-8">
                  <img src="https://images.unsplash.com/photo-1510076857177-7470076d4098?w=500&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="img-zoom overflow-hidden aspect-square">
                  <img src="https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=500&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="img-zoom overflow-hidden aspect-square mt-4">
                  <img src="https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=500&q=80" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="gold-line" />
                  <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                    Recognition
                  </span>
                </div>
                <h2
                  className="text-4xl md:text-5xl leading-[0.9] text-[#F5F0E8] mb-8"
                  style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                >
                  Eight years of
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    creating timeless
                  </span>
                  <br />
                  images.
                </h2>
                <div className="space-y-4 mb-10">
                  {[
                    { year: '2024', achievement: 'Best Wedding Photographer — Maharashtra Awards' },
                    { year: '2023', achievement: 'Top 50 Wedding Photographers India — WeddingWire' },
                    { year: '2022', achievement: 'Featured in Vogue India\'s "Rising Creatives"' },
                    { year: '2021', achievement: 'Gold Award — Asia Pacific Wedding Photography' },
                    { year: '2020', achievement: 'Official Fujifilm Brand Ambassador' },
                  ].map((a) => (
                    <div key={a.year} className="flex items-start gap-4 border-b border-[#C9A96E]/10 pb-4">
                      <span className="text-[#C9A96E]/50 text-xs w-12 flex-shrink-0 pt-0.5" style={{ fontFamily: 'DM Sans' }}>{a.year}</span>
                      <span className="text-[#F5F0E8]/60 text-sm font-light" style={{ fontFamily: 'DM Sans' }}>{a.achievement}</span>
                    </div>
                  ))}
                </div>
                <Link to="/contact" className="btn-gold flex items-center gap-2 w-fit">
                  Work with Me <ArrowRight size={14} />
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}
