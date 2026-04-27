import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#C9A96E]/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none group">
            <span className="font-heading italic text-xl text-gold-gradient" style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.4rem', background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Himanshu
            </span>
            <span className="text-[0.55rem] tracking-[0.25em] uppercase text-[#F5F0E8]/40 font-body font-light" style={{ fontFamily: 'DM Sans' }}>
              Photography
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link to="/contact" className="btn-gold text-xs" style={{ padding: '10px 24px' }}>
              Book a Session
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[#F5F0E8]/70 hover:text-[#C9A96E] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0D0D0D]/98 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-5 right-6 text-[#F5F0E8]/50"
              onClick={() => setMenuOpen(false)}
            >
              <X size={22} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `font-heading italic text-3xl transition-colors ${isActive ? 'text-gold-gradient' : 'text-[#F5F0E8]/80 hover:text-[#C9A96E]'}`
                    }
                    style={{ fontFamily: 'Cormorant Garamond' }}
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <Link to="/contact" className="btn-gold mt-4" onClick={() => setMenuOpen(false)}>
                  Book a Session
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
