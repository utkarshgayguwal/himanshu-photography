import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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

const localImages = [
  '/images/bride/1702528917220-01.jpeg.jpg',
  '/images/bride/1702529030213-01.jpeg.jpg',
  '/images/bride/1702529147619-01.jpeg.jpg',
  '/images/bride/1702529337636-01.jpeg.jpg',
  '/images/bride/1702529483808-01-01.jpeg.jpg',
  '/images/bride/1702529483808-01.jpeg.jpg',
  '/images/bride/1703092719416-02-01.jpeg.jpg',
  '/images/bride/IMG_20231220_220423-01.jpeg.jpg',
  '/images/bride/IMG_20231221_010345-01.jpeg.jpg',
  '/images/bride/Untitled-1.jpg',
  '/images/bride/Untitled-1.png',
  '/images/bride/Untitled-11.jpg',
  '/images/bride/Untitled-12.jpg',
  '/images/bride/Untitled-12.png',
  '/images/bride/Untitled-13.jpg',
  '/images/bride/Untitled-14.jpg'
];

const unsplashImages = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&q=80',
  'https://images.unsplash.com/photo-1583939411023-14783179e581?w=800&q=80',
  'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80',
  'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
  'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800&q=80',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80',
  'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&q=80',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&q=80',
  'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
];

// Alternate between local and unsplash images for a varied grid
const galleryImages = [];
const maxLength = Math.max(localImages.length, unsplashImages.length);
for (let i = 0; i < maxLength; i++) {
  if (i < localImages.length) galleryImages.push({ id: `local-${i}`, src: localImages[i], type: 'local' });
  if (i < unsplashImages.length) galleryImages.push({ id: `unsplash-${i}`, src: unsplashImages[i], type: 'unsplash' });
}

export default function Work() {
  return (
    <div className="bg-[#0D0D0D] pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800&q=80"
            alt="Our Work"
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
                Portfolio
              </span>
              <div className="gold-line" />
            </div>
            <h1
              className="text-6xl md:text-7xl lg:text-8xl leading-[0.88] text-[#F5F0E8] mb-6"
              style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
            >
              Our Best
              <br />
              <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Moments
              </span>
            </h1>
            <p className="text-[#F5F0E8]/50 text-sm font-light max-w-lg mx-auto" style={{ fontFamily: 'DM Sans' }}>
              A curated collection of our favorite frames, capturing love, joy, and the beauty of human connection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {galleryImages.map((image, idx) => (
              <FadeUp key={image.id} delay={0.05} className="break-inside-avoid">
                <div className="img-zoom relative overflow-hidden group rounded-sm">
                  <img
                    src={image.src}
                    alt={`Portfolio image ${idx + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
