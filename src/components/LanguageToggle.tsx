// src/components/LanguageToggle.tsx
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language.toLowerCase().startsWith('ur');
  const target = isUrdu ? 'en' : 'ur';

  // Remember the last control the user was working on inside the page. The toggle lives in the header,
  // so a keyboard / screen-reader user had to leave that control to reach it; afterwards we hand focus
  // back, instead of making them Tab through the whole header again (found in NVDA testing, 2026-11-26).
  const lastMainFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.('#main-content')) lastMainFocus.current = el;
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const fromKeyboard = e.detail === 0;            // Enter / Space produce a click with detail 0; a mouse click does not
    await i18n.changeLanguage(target);
    const previous = lastMainFocus.current;
    if (fromKeyboard && previous?.isConnected) {
      requestAnimationFrame(() => previous.focus({ preventScroll: true }));   // after React has re-rendered in place
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => void onClick(e)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
    >
      <Globe className="w-3.5 h-3.5" aria-hidden="true" />
      {isUrdu ? (
        <span lang="en">English</span>
      ) : (
        <>
          {/* English word is the accessible name (readable by any voice); the Urdu script is a visual cue only,
              so screen readers without an Urdu voice do not announce "speech synthesis not supported" on focus. */}
          <span lang="en">Urdu</span>
          <span lang="ur" aria-hidden="true">اردو</span>
        </>
      )}
    </button>
  );
}
