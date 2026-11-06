// src/components/LanguageToggle.tsx
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ur' : 'en');
  };

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold"
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5" />
      {i18n.language === 'ur' ? 'EN' : 'اردو'}
    </button>
  );
}