// src/app/pages/About.tsx
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Smartphone, Eye, Info, Code2, Database } from 'lucide-react';
import Footer from '../components/Footer';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

function Section({ id, icon: Icon, title, children }: { id: string; icon: typeof Info; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-6 md:p-8">
      <h2 id={`${id}-title`} tabIndex={-1} className="flex items-center gap-3 text-xl font-bold text-white mb-4 outline-none">
        <span aria-hidden="true" className="w-9 h-9 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center"><Icon className="w-5 h-5" /></span>
        {title}
      </h2>
      <div className="text-white/80 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function About() {
  const { t } = useTranslation();
  const securityPoints = ['pin', 'mfa', 'limits', 'isolation', 'idempotency', 'session'] as const;

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('about.title')}</h1>
          <p className="text-white/80 text-lg leading-relaxed">{t('about.lead')}</p>
        </header>

        <Section id="sandbox" icon={Info} title={t('about.sandbox.title')}>
          <p>{t('about.sandbox.body')}</p>
        </Section>

        <Section id="security" icon={ShieldCheck} title={t('about.security.title')}>
          <ul className="space-y-3 list-disc ps-5 marker:text-[#FF7F50]">
            {securityPoints.map((k) => <li key={k}>{t(`about.security.${k}`)}</li>)}
          </ul>
        </Section>

        <Section id="privacy" icon={Lock} title={t('about.privacy.title')}>
          <p>{t('about.privacy.body')}</p>
          {CONTACT_EMAIL && (
            <p><a className="text-[#FF7F50] underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>{t('about.contact', { email: CONTACT_EMAIL })}</a></p>
          )}
        </Section>

        <Section id="accessibility" icon={Eye} title={t('about.a11y.title')}>
          <p>{t('about.a11y.body')}</p>
        </Section>

        <Section id="stack" icon={Code2} title={t('about.stack.title')}>
          <p className="flex items-start gap-2"><Database className="w-4 h-4 mt-1.5 text-[#FF7F50] flex-shrink-0" aria-hidden="true" /> {t('about.stack.body')}</p>
          <p className="flex items-center gap-2 text-white/70 text-sm"><Smartphone className="w-4 h-4" aria-hidden="true" /> PWA</p>
        </Section>
      </div>
      <Footer />
    </div>
  );
}
