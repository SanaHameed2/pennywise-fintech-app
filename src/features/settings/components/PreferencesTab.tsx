// src/features/settings/components/PreferencesTab.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Zap } from 'lucide-react';
import { getReduceMotion, setReduceMotion } from '../../../lib/preferences';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'اردو' },
] as const;

export default function PreferencesTab() {
  const { t, i18n } = useTranslation();
  const [reduceMotion, setReduce] = useState(getReduceMotion);
  const current = i18n.language.startsWith('ur') ? 'ur' : 'en';

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t('settings.preferences.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('settings.preferences.subtitle')}</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="flex items-center gap-2 text-lg font-medium text-foreground mb-1">
          <Languages className="w-5 h-5 text-brand-primary" aria-hidden="true" /> {t('settings.preferences.language')}
        </legend>
        <p className="text-sm text-muted-foreground">{t('settings.preferences.languageHelp')}</p>
        <div role="radiogroup" aria-label={t('settings.preferences.language')} className="grid grid-cols-2 gap-3">
          {LANGUAGES.map(({ code, label }) => (
            <label key={code}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-brand-primary ${
                current === code ? 'border-brand-primary bg-brand-primary/10' : 'border-border bg-card/50 hover:bg-accent'}`}>
              <input type="radio" name="language" value={code} checked={current === code}
                onChange={() => void i18n.changeLanguage(code)} className="accent-[#FF7F50] w-4 h-4" />
              <span lang={code} className="font-medium text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/50">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-brand-primary mt-0.5" aria-hidden="true" />
          <div>
            <p id="reduce-motion-label" className="font-medium text-foreground">{t('settings.preferences.reduceMotion')}</p>
            <p id="reduce-motion-help" className="text-sm text-muted-foreground">{t('settings.preferences.reduceMotionHelp')}</p>
          </div>
        </div>
        <button type="button" role="switch" aria-checked={reduceMotion}
          aria-labelledby="reduce-motion-label" aria-describedby="reduce-motion-help"
          onClick={() => { const next = !reduceMotion; setReduce(next); setReduceMotion(next); }}
          className={`relative shrink-0 w-12 h-7 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${reduceMotion ? 'bg-brand-primary' : 'bg-white/25'}`}>
          <span aria-hidden="true" className={`absolute top-0.5 start-0.5 w-6 h-6 rounded-full bg-white transition-transform ${reduceMotion ? 'translate-x-5 rtl:-translate-x-5' : ''}`} />
        </button>
      </div>

      <p className="text-sm text-muted-foreground">{t('settings.preferences.themeNote')}</p>
    </div>
  );
}
