// src/app/components/Footer.tsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Static Data (Moved outside to prevent re-creation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const QUICK_LINKS = [
  { to: "/", text: "Home" },
  { to: "/dashboard", text: "Dashboard" },
  { to: "/transfer", text: "Transfer" },
  { to: "/cards", text: "Cards" },
  { to: "/login", text: "Login" },
  { to: "/signup", text: "Sign Up" }
];

const SUPPORT_LINKS = [
  { text: "Help Center", href: "#" },
  { text: "Privacy Policy", href: "#" },
  { text: "Terms of Service", href: "#" },
  { text: "Contact Engineering", href: "#" }
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "Linkedin" }
];

const LEGAL_LINKS = [
  { text: "Privacy", href: "#" },
  { text: "Terms", href: "#" },
  { text: "Cookies", href: "#" }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ SocialIcon Sub-component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SocialIcon = memo(({ icon: Icon, href, label }: { icon: React.ElementType; href: string; label: string }) => {
  return (
    <a 
      href={href} 
      aria-label={label}
      className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-orange-500 hover:border-orange-500/20 hover:bg-orange-500/5 transition-all duration-200"
    >
      <Icon size={14} />
    </a>
  );
});

SocialIcon.displayName = 'SocialIcon';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ FooterLink Sub-component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FooterLink = memo(({ to, text }: { to: string; text: string }) => {
  return (
    <li>
      <Link to={to} className="text-white/40 hover:text-white transition-colors text-xs font-medium">
        {text}
      </Link>
    </li>
  );
});

FooterLink.displayName = 'FooterLink';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ FooterTextLink Sub-component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FooterTextLink = memo(({ text, href }: { text: string; href: string }) => {
  return (
    <li>
      <a href={href} className="text-white/40 hover:text-white transition-colors text-xs font-medium">
        {text}
      </a>
    </li>
  );
});

FooterTextLink.displayName = 'FooterTextLink';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main Footer Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/10 pt-16 pb-8 overflow-hidden font-sans">
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 z-10">
        
        {/* Main Footer Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-left">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="6" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-xl font-semibold tracking-tight text-white">
                Penny<span className="text-orange-500">wise</span>
              </span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-sm">
              Precision fintech metrics layer designed for global execution routing. Secure structural balancing algorithms engineered for modern asset telemetry.
            </p>
            <div className="flex gap-2 pt-1">
              {SOCIAL_LINKS.map((social) => (
                <SocialIcon key={social.label} icon={social.icon} href={social.href} label={social.label} />
              ))}
            </div>
          </div>

          {/* Quick Links Vector */}
          <div>
            <h3 className="text-white/80 font-medium text-xs uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <FooterLink key={link.to} to={link.to} text={link.text} />
              ))}
            </ul>
          </div>

          {/* Support Node Links */}
          <div>
            <h3 className="text-white/80 font-medium text-xs uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <FooterTextLink key={link.text} text={link.text} href={link.href} />
              ))}
            </ul>
          </div>

          {/* Contact Parameter Blocks */}
          <div>
            <h3 className="text-white/80 font-medium text-xs uppercase tracking-wider mb-4">Contact Gateway</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/40 text-xs font-medium">
                <Mail size={14} className="text-orange-500" />
                <span className="hover:text-white transition-colors cursor-pointer">support@pennywise.network</span>
              </li>
              <li className="flex items-center gap-3 text-white/40 text-xs font-medium">
                <Phone size={14} className="text-orange-500" />
                <span>+1 (555) 019-2831</span>
              </li>
              <li className="flex items-start gap-3 text-white/40 text-xs font-medium">
                <MapPin size={14} className="text-orange-500 mt-0.5 shrink-0" />
                <span className="leading-relaxed">123 Secure Cluster Suite, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Structural Horizontal Divider */}
        <div className="border-t border-white/5 pt-8 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-[11px] font-mono tracking-wide">
              &copy; {currentYear} PENNYWISE INFRASTRUCTURE. PLATFORM ALPHA STATE v1.0.4
            </p>
            <div className="flex gap-6">
              {LEGAL_LINKS.map((link) => (
                <a key={link.text} href={link.href} className="text-white/30 hover:text-orange-500 transition-colors text-[11px] font-medium uppercase tracking-wider">
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;