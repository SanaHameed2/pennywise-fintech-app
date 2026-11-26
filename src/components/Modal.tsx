// src/components/Modal.tsx
// Accessible modal built on the native <dialog> element: focus is trapped, Esc closes it,
// the page behind is inert, and focus returns to the opener on close, all handled by the browser.
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = 'modal-title-' + title.replace(/\W+/g, '-').toLowerCase();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      if (typeof el.showModal === 'function') el.showModal();
      else el.setAttribute('open', '');
    } else if (!open && el.open) {
      if (typeof el.close === 'function') el.close();
      else el.removeAttribute('open');
    }
  }, [open]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- backdrop click is a mouse convenience; Esc and the Close button are the keyboard paths
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}   // click on the backdrop
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-transparent p-0 text-foreground backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="relative">
          <h2 id={titleId} className="sr-only">{title}</h2>
          <button
            type="button" onClick={onClose} aria-label={t('common.close')}
            className="absolute -top-11 end-0 flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
          >
            <X className="w-4 h-4" aria-hidden="true" /> {t('common.close')}
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
