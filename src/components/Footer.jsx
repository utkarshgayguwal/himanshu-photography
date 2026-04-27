import { Link } from 'react-router-dom';
import { Share2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#C9A96E]/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3
              className="font-heading italic text-3xl mb-2"
              style={{ fontFamily: 'Cormorant Garamond', background: 'linear-gradient(135deg, #C9A96E, #E8D5AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Himanshu
            </h3>
            <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F5F0E8]/30 mb-4" style={{ fontFamily: 'DM Sans' }}>
              Photography
            </p>
            <p className="text-[#F5F0E8]/50 text-sm font-light leading-relaxed" style={{ fontFamily: 'DM Sans', fontStyle: 'italic' }}>
              Always there to capture<br />your remembering moments.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-[#F5F0E8]/30 hover:text-[#C9A96E] transition-colors">
                <Share2 size={16} />
              </a>
              <a href="#" className="text-[#F5F0E8]/30 hover:text-[#C9A96E] transition-colors">
              </a>
              <a href="mailto:himanshu@photography.com" className="text-[#F5F0E8]/30 hover:text-[#C9A96E] transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A96E]/70 mb-5" style={{ fontFamily: 'DM Sans' }}>
              Navigation
            </p>
            <div className="flex flex-col gap-3">
              {[['/', 'Home'], ['/services', 'Services'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="text-[#F5F0E8]/40 hover:text-[#C9A96E] transition-colors text-sm font-light"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A96E]/70 mb-5" style={{ fontFamily: 'DM Sans' }}>
              Get in Touch
            </p>
            <div className="flex flex-col gap-4">
              <a href="tel:+919999999999" className="flex items-center gap-3 text-[#F5F0E8]/40 hover:text-[#C9A96E] transition-colors">
                <Phone size={13} />
                <span className="text-sm font-light" style={{ fontFamily: 'DM Sans' }}>+91 99999 99999</span>
              </a>
              <a href="mailto:contact@himanshuphotography.com" className="flex items-center gap-3 text-[#F5F0E8]/40 hover:text-[#C9A96E] transition-colors">
                <Mail size={13} />
                <span className="text-sm font-light" style={{ fontFamily: 'DM Sans' }}>contact@himanshuphotography.com</span>
              </a>
              <div className="flex items-start gap-3 text-[#F5F0E8]/40">
                <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm font-light" style={{ fontFamily: 'DM Sans' }}>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#C9A96E]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[#F5F0E8]/20 text-xs" style={{ fontFamily: 'DM Sans' }}>
            © 2026 Himanshu Photography. All rights reserved.
          </p>
          <p className="text-[#F5F0E8]/20 text-xs italic" style={{ fontFamily: 'Cormorant Garamond' }}>
            Every moment deserves to be remembered forever.
          </p>
        </div>
      </div>
    </footer>
  );
}
