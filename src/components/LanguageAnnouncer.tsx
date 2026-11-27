// src/components/LanguageAnnouncer.tsx
// Tells screen-reader users that the language changed. When switching TO Urdu the message is bilingual:
// an English sentence first (any voice can speak it) and then the Urdu one. Screen readers without an Urdu
// voice say "speech synthesis not supported" for Urdu text, so an Urdu-only message would be lost to them.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageAnnouncer() {
  const { i18n } = useTranslation();
  const [toUrdu, setToUrdu] = useState<boolean | null>(null);

  useEffect(() => {
    const onChange = (lng: string) => setToUrdu(lng.toLowerCase().startsWith('ur'));
    i18n.on('languageChanged', onChange);
    return () => { i18n.off('languageChanged', onChange); };
  }, [i18n]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {toUrdu === null ? null : toUrdu ? (
        <>
          <span lang="en">Language changed to Urdu.</span>{' '}
          <span lang="ur">{i18n.t('a11y.languageChanged')}</span>
        </>
      ) : (
        <span lang="en">Language changed to English.</span>
      )}
    </div>
  );
}
