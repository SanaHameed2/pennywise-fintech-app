// src/components/LanguageToggle.tsx
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language.toLowerCase().startsWith('ur');
  const target = isUrdu ? 'en' : 'ur';

  return (
    <button
      type="button"
      onClick={() => void i18n.changeLanguage(target)}
      // The visible text names the language you will switch TO (WCAG 2.5.3: name contains the visible label).
      lang={target}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
    >
      <Globe className="w-3.5 h-3.5" aria-hidden="true" />
      {isUrdu ? 'English' : 'اردو'}
    </button>
  );
}
