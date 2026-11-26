// src/app/components/Footer.tsx
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Github } from 'lucide-react';

const REPO_URL = import.meta.env.VITE_REPO_URL as string | undefined;

const linkClass =
  'text-white/70 hover:text-white transition-colors text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]';

const Footer = memo(() => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/10 pt-14 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block text-xl font-semibold tracking-tight text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]">
              Penny<span className="text-[#FF7F50]">wise</span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">{t('footer.tagline')}</p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="text-xs uppercase tracking-widest text-[#FF7F50] font-semibold mb-4">{t('footer.explore')}</h2>
            <ul className="space-y-2.5">
              <li><Link to="/about" className={linkClass}>{t('footer.about')}</Link></li>
              <li><Link to="/about#security" className={linkClass}>{t('footer.security')}</Link></li>
              <li><Link to="/about#accessibility" className={linkClass}>{t('footer.accessibility')}</Link></li>
              {REPO_URL && (
                <li>
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-1.5`}>
                    <Github className="w-4 h-4" aria-hidden="true" /> {t('footer.source')}
                    <span className="sr-only"> ({t('footer.opensNewTab')})</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>

          <div>
            <p className="text-white/70 text-sm leading-relaxed">{t('footer.disclaimer')}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs text-white/60">
          {t('footer.rights', { year })}
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
