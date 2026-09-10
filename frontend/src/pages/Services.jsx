import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

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
  {
    id: 'wedding',
    title: 'Wedding Photography',
    subtitle: 'Where Love Becomes Legend',
    desc: 'Your wedding day is the most beautiful story ever told. We capture every whisper, every tear, every dance — weaving them into photographs that will make your heart ache with joy for decades to come.',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80',
    includes: ['Full day coverage', 'Two photographers', 'Edited gallery (400+ photos)', 'Online delivery', 'Print-ready files'],
    tag: 'Most Popular',
  },
  {
    id: 'engagement',
    title: 'Engagement Shoot',
    subtitle: 'The Beginning of Your Forever',
    desc: 'The ring is on, the future is bright — let\'s capture this electric moment. Relaxed, romantic, and entirely you. Our engagement sessions let you experience our style before the big day.',
    img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80',
    includes: ['2-hour session', 'Multiple locations', 'Edited gallery (80+ photos)', 'Online gallery', 'Print-ready files'],
    tag: 'Fan Favourite',
  },
  {
    id: 'pre-wedding',
    title: 'Pre & Post Wedding',
    subtitle: 'The Stories Between the Stories',
    desc: 'Before the vows and after the celebration — these are the moments that define your love. Cinematic, editorial, unforgettable. Destination shoots available across India.',
    img: 'https://images.unsplash.com/photo-1583939411023-14783179e581?w=900&q=80',
    includes: ['Half/full day sessions', 'Multiple outfits', 'Edited gallery (150+ photos)', 'Online & offline delivery', 'Cinematic editing'],
    tag: null,
  },
  {
    id: 'haldi',
    title: 'Haldi & Mehendi',
    subtitle: 'Color, Joy & Pure Celebration',
    desc: 'The vibrant chaos of turmeric flying through the air, the intricate art of mehendi, laughter that doesn\'t stop — we live for these joyful rituals and tell their stories with vivid, heartfelt photography.',
    img: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=900&q=80',
    includes: ['4-hour coverage', 'One photographer', 'Edited gallery (150+ photos)', 'Online delivery', 'Color-rich editing'],
    tag: null,
  },
  {
    id: 'baby',
    title: 'Baby Naming & Maternity',
    subtitle: 'Life\'s Purest Miracles',
    desc: 'Tiny fingers, first smiles, naming ceremonies full of love — these moments grow up faster than you can imagine. We freeze them in time so you can return to them forever.',
    img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=900&q=80',
    includes: ['3-hour session', 'Studio or outdoor', 'Edited gallery (100+ photos)', 'Online gallery', 'Soft, natural editing'],
    tag: null,
  },
  {
    id: 'birthday',
    title: 'Birthday & Celebrations',
    subtitle: 'Every Year is a Gift',
    desc: 'Whether it\'s the first birthday or the fiftieth, celebrations deserve to be remembered. We capture the cake smash, the speeches, the dancing — everything that made the day magical.',
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=900&q=80',
    includes: ['3-hour coverage', 'One photographer', 'Edited gallery (100+ photos)', 'Online delivery', 'Quick turnaround'],
    tag: null,
  },
  {
    id: 'candid',
    title: 'Candid Photography',
    subtitle: 'Truth in Every Frame',
    desc: 'The best moments are the ones that weren\'t planned. We blend into your celebration and capture real laughter, real tears, real love — photographs that feel like memories, not poses.',
    img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&q=80',
    includes: ['Available for any event', 'Unobtrusive approach', 'Edited gallery', 'Online delivery', 'Natural light mastery'],
    tag: null,
  },
  {
    id: 'concert',
    title: 'Concert & Events',
    subtitle: 'Energy That Never Fades',
    desc: 'Stage lights, roaring crowds, peak moments of pure performance — we specialize in high-energy event photography that captures the electricity of live experiences.',
    img: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900&q=80',
    includes: ['Full event coverage', 'Low-light mastery', 'Edited gallery', 'Quick delivery', 'Commercial license available'],
    tag: null,
  },
  {
    id: 'drone',
    title: 'Drone Photography',
    subtitle: 'A Perspective Beyond',
    desc: 'Breathtaking aerial shots that give your wedding or event a cinematic grandeur. Sweeping landscapes, venue exteriors, dramatic bird\'s-eye ceremony shots — a perspective no one else can offer.',
    img: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=900&q=80',
    includes: ['FAA/DGCA compliant', 'Licensed drone operator', 'Aerial photos & video', 'Edited delivery', 'Add-on or standalone'],
    tag: 'Unique',
  },
];

export default function Services() {
  return (
    <div className="bg-[#0D0D0D] pt-16">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1800&q=80"
            alt="Services"
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
                Our Services
              </span>
              <div className="gold-line" />
            </div>
            <h1
              className="text-6xl md:text-7xl lg:text-8xl leading-[0.88] text-[#F5F0E8] mb-6"
              style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
            >
              Every Occasion.
              <br />
              <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Every Emotion.
              </span>
            </h1>
            <p className="text-[#F5F0E8]/50 text-sm font-light max-w-lg mx-auto" style={{ fontFamily: 'DM Sans' }}>
              From intimate ceremonies to grand celebrations — we bring artistry, expertise, and heart to every frame we create.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services list */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col gap-0">
            {services.map((s, i) => (
              <FadeUp key={s.id} delay={0.05}>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-[#C9A96E]/10 py-16 ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                  {/* Image */}
                  <div className={`relative img-zoom overflow-hidden aspect-video md:aspect-[4/3] ${i % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                    {s.tag && (
                      <div className="absolute top-4 left-4 bg-[#C9A96E] text-[#0D0D0D] text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1.5" style={{ fontFamily: 'DM Sans', fontWeight: 500 }}>
                        {s.tag}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col justify-center px-0 md:px-12 py-8 md:py-0 ${i % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <p className="text-[#C9A96E]/60 text-[0.6rem] tracking-[0.2em] uppercase mb-3" style={{ fontFamily: 'DM Sans' }}>
                      {s.subtitle}
                    </p>
                    <h2
                      className="text-4xl md:text-5xl leading-[0.9] text-[#F5F0E8] mb-4"
                      style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
                    >
                      {s.title}
                    </h2>
                    <p className="text-[#F5F0E8]/50 text-sm font-light leading-relaxed mb-6" style={{ fontFamily: 'DM Sans' }}>
                      {s.desc}
                    </p>
                    <div className="grid grid-cols-1 gap-2 mb-8">
                      {s.includes.map(inc => (
                        <div key={inc} className="flex items-center gap-3">
                          <Check size={11} className="text-[#C9A96E] flex-shrink-0" />
                          <span className="text-[#F5F0E8]/50 text-xs" style={{ fontFamily: 'DM Sans' }}>{inc}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/contact" className="btn-gold self-start flex items-center gap-2">
                      Book This Service <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#080808]">
        <FadeUp>
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2
              className="text-5xl md:text-6xl leading-[0.9] text-[#F5F0E8] mb-6"
              style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
            >
              Not sure which
              <br />
              <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                package fits you?
              </span>
            </h2>
            <p className="text-[#F5F0E8]/50 text-sm font-light mb-8" style={{ fontFamily: 'DM Sans' }}>
              Let's talk. We'll understand your vision and craft a custom package that's perfect for your day.
            </p>
            <Link to="/contact" className="btn-gold flex items-center justify-center gap-2 mx-auto w-fit">
              Talk to Himanshu <ArrowRight size={14} />
            </Link>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
