import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Camera, Star, ChevronDown } from 'lucide-react';

const UNSPLASH_HERO = 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1800&q=80'; // wedding
const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', label: 'Wedding', aspect: 'tall' },
  { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80', label: 'Candid', aspect: 'square' },
  { src: 'https://images.unsplash.com/photo-1583939411023-14783179e581?w=800&q=80', label: 'Pre-Wedding', aspect: 'wide' },
  { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', label: 'Engagement', aspect: 'square' },
  { src: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80', label: 'Ceremony', aspect: 'tall' },
  { src: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&q=80', label: 'Portrait', aspect: 'square' },
];

function useInView(threshold = 0.15) {
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

export default function Home() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className="bg-[#0D0D0D]">
      {/* HERO */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src={UNSPLASH_HERO}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/60 via-transparent to-transparent" />
        </motion.div>

        {/* Grain overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-30"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")" }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 pb-20 w-full"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="gold-line" />
            <span className="text-[#C9A96E] text-[0.65rem] tracking-[0.3em] uppercase" style={{ fontFamily: 'DM Sans' }}>
              Himanshu Photography
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-heading text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.88] text-[#F5F0E8] mb-6 max-w-3xl"
            style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
          >
            Always There to
            <br />
            <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA, #C9A96E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Capture Your
            </span>
            <br />
            Remembering Moments.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-[#F5F0E8]/60 text-sm md:text-base font-light max-w-md leading-relaxed mb-10"
            style={{ fontFamily: 'DM Sans' }}
          >
            From the laughter before the ceremony to the tears of joy after — we preserve every emotion, every story, every heartbeat of your most precious days.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link to="/contact" className="btn-gold flex items-center gap-2">
              Book a Session <ArrowRight size={14} />
            </Link>
            <Link to="/services" className="btn-outline">
              Explore Work
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 right-12 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[#F5F0E8]/30 text-[0.6rem] tracking-[0.2em] uppercase" style={{ fontFamily: 'DM Sans', writingMode: 'vertical-rl' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown size={14} className="text-[#C9A96E]/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* INTRO STATEMENT */}
      <section className="py-28 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="gold-line" />
                <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                  Our Philosophy
                </span>
              </div>
              <h2
                className="text-5xl md:text-6xl leading-[0.9] text-[#F5F0E8] mb-6"
                style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
              >
                Life's most beautiful
                <br />
                <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  moments
                </span>
                <br />
                deserve to live forever.
              </h2>
              <p className="text-[#F5F0E8]/50 text-sm leading-relaxed font-light mb-8" style={{ fontFamily: 'DM Sans' }}>
                We believe photography is more than just pictures. It's the art of freezing time — so you can return to the warmth of a hug, the shimmer of a smile, the sacred silence before a kiss. Himanshu Photography exists to create images you'll treasure for generations.
              </p>
              <Link to="/about" className="btn-outline">
                Our Story
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="grid grid-cols-2 gap-3">
              <div className="img-zoom rounded-sm overflow-hidden aspect-[3/4]">
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80" alt="Wedding" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-3 mt-10">
                <div className="img-zoom rounded-sm overflow-hidden aspect-square">
                  <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80" alt="Candid" className="w-full h-full object-cover" />
                </div>
                <div className="img-zoom rounded-sm overflow-hidden aspect-square">
                  <img src="https://images.unsplash.com/photo-1583939411023-14783179e581?w=400&q=80" alt="Pre-Wedding" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-[#C9A96E]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: '500+', label: 'Weddings Captured' },
              { num: '8+', label: 'Years of Craft' },
              { num: '2000+', label: 'Happy Families' },
              { num: '15+', label: 'Awards Won' },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.1}>
                <div className="text-center">
                  <p
                    className="text-4xl md:text-5xl mb-2"
                    style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {s.num}
                  </p>
                  <p className="text-[#F5F0E8]/40 text-xs tracking-[0.15em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                    {s.label}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="gold-line" />
                <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                  Portfolio
                </span>
                <div className="gold-line" />
              </div>
              <h2
                className="text-5xl md:text-6xl leading-[0.9] text-[#F5F0E8]"
                style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
              >
                Moments Frozen in Time
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {GALLERY_IMAGES.map((img, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div
                  className={`img-zoom overflow-hidden ${i % 3 === 1 ? 'mt-8' : ''}`}
                  style={{ aspectRatio: img.aspect === 'tall' ? '3/4' : img.aspect === 'wide' ? '4/3' : '1/1' }}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#0D0D0D]/0 hover:bg-[#0D0D0D]/40 transition-all duration-500 flex items-end p-4 opacity-0 hover:opacity-100">
                    <span className="text-[#F5F0E8]/90 text-sm font-light" style={{ fontFamily: 'DM Sans' }}>{img.label}</span>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <div className="text-center mt-12">
              <Link to="/services" className="btn-outline">
                View All Work
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-28 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="gold-line" />
                  <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                    Services
                  </span>
                </div>
                <h2
                  className="text-5xl md:text-6xl leading-[0.9] text-[#F5F0E8]"
                  style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                >
                  Crafted for Every
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Occasion
                  </span>
                </h2>
              </div>
              <Link to="/services" className="btn-outline mt-8 md:mt-0">
                All Services
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C9A96E]/10">
            {[
              { icon: '💍', title: 'Wedding & Engagement', desc: 'From the ring moment to the first dance — every chapter of your love story, beautifully documented.' },
              { icon: '👶', title: 'Baby & Family', desc: 'Naming ceremonies, birthdays, and those tiny firsts that grow up too fast. Preserved forever.' },
              { icon: '🎭', title: 'Candid & Events', desc: 'Concerts, haldi, pre-wedding shoots — authentic emotions captured in their most raw, beautiful form.' },
            ].map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.1}>
                <div className="bg-[#080808] p-8 md:p-10 hover:bg-[#111] transition-colors duration-300 group">
                  <span className="text-3xl mb-6 block">{s.icon}</span>
                  <h3
                    className="text-2xl md:text-3xl text-[#F5F0E8] mb-3 group-hover:text-[#C9A96E] transition-colors"
                    style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[#F5F0E8]/40 text-sm font-light leading-relaxed mb-6" style={{ fontFamily: 'DM Sans' }}>
                    {s.desc}
                  </p>
                  <Link to="/services" className="text-[#C9A96E] text-[0.65rem] tracking-[0.15em] uppercase flex items-center gap-2 hover:gap-3 transition-all" style={{ fontFamily: 'DM Sans' }}>
                    Learn More <ArrowRight size={12} />
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="gold-line" />
                <span className="text-[#C9A96E]/70 text-[0.6rem] tracking-[0.25em] uppercase" style={{ fontFamily: 'DM Sans' }}>
                  Testimonials
                </span>
                <div className="gold-line" />
              </div>
              <h2
                className="text-5xl md:text-6xl leading-[0.9] text-[#F5F0E8]"
                style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
              >
                Words from the Heart
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'Himanshu captured moments we didn\'t even realize were happening. Every photo tells a story we\'ll cherish forever. He has a magical eye for emotion.', name: 'Priya & Rahul Sharma', role: 'Wedding, Mumbai 2024' },
              { quote: 'Our engagement shoot felt so natural. He made us completely forget about the camera — and the results were absolutely breathtaking. Like stills from a movie.', name: 'Ananya Kapoor', role: 'Engagement Shoot, Goa 2024' },
              { quote: 'The haldi ceremony photos are our absolute favourites. He got every candid moment, every burst of color, every laugh. Pure magic in every frame.', name: 'Meera & Vikram Joshi', role: 'Wedding, Pune 2025' },
            ].map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.12}>
                <div className="glass-card p-8 h-full flex flex-col">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={10} className="text-[#C9A96E] fill-[#C9A96E]" />
                    ))}
                  </div>
                  <p
                    className="text-[#F5F0E8]/70 text-sm leading-relaxed font-light flex-grow mb-6"
                    style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.05rem' }}
                  >
                    "{t.quote}"
                  </p>
                  <div>
                    <p className="text-[#F5F0E8] text-sm font-medium" style={{ fontFamily: 'DM Sans' }}>{t.name}</p>
                    <p className="text-[#C9A96E]/50 text-xs mt-1" style={{ fontFamily: 'DM Sans' }}>{t.role}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=1800&q=80"
            alt="bg"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0D0D0D]/80" />
        </div>
        <FadeUp>
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <h2
              className="text-5xl md:text-6xl lg:text-7xl leading-[0.88] text-[#F5F0E8] mb-6"
              style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
            >
              Your story deserves
              <br />
              <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                to be immortal.
              </span>
            </h2>
            <p className="text-[#F5F0E8]/50 text-sm font-light leading-relaxed mb-10" style={{ fontFamily: 'DM Sans' }}>
              Let's create something timeless together. Book your session today and let us be there for every remembering moment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="btn-gold flex items-center gap-2">
                Book Your Session <ArrowRight size={14} />
              </Link>
              <Link to="/services" className="btn-outline">
                View Services
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
