// src/app/pages/Home.tsx
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShieldCheck, BarChart3, PiggyBank, Languages, Accessibility, Smartphone, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

const FEATURES = [
  { key: 'f1', icon: ShieldCheck }, { key: 'f2', icon: BarChart3 }, { key: 'f3', icon: PiggyBank },
  { key: 'f4', icon: Languages }, { key: 'f5', icon: Accessibility }, { key: 'f6', icon: Smartphone },
] as const;

const btnPrimary =
  'inline-flex items-center justify-center gap-2 bg-[#FF7F50] hover:bg-[#ff8f66] text-black font-semibold px-6 py-3 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative font-sans">
      <div aria-hidden="true" className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* Hero */}
      <section aria-labelledby="hero-title" className="relative max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF7F50] border border-[#FF7F50]/30 bg-[#FF7F50]/10 rounded-full px-3 py-1 mb-6">
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#FF7F50]" /> {t('home.badge')}
          </p>
          <h1 id="hero-title" className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            {t('home.heroTitle1')} <span className="text-[#FF7F50]">{t('home.heroTitle2')}</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-xl mb-8">{t('home.heroSub')}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className={btnPrimary}>{t('home.ctaPrimary')} <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" /></Link>
            <Link to="/about#security" className={btnSecondary}>{t('home.ctaSecondary')}</Link>
          </div>
        </motion.div>

        {/* Illustrative preview (clearly labelled as sample data) */}
        <motion.figure initial="hidden" animate="visible" custom={2} variants={fadeUp}
          className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 shadow-2xl m-0"
          aria-label={t('home.sampleLabel')}>
          <figcaption className="text-[11px] uppercase tracking-widest text-white/60 mb-4">{t('home.sampleLabel')}</figcaption>
          <p className="text-sm text-white/70">{t('home.sampleBalance')}</p>
          <p className="text-4xl font-bold mt-1 mb-6"><bdi dir="ltr">Rs. 42,350.00</bdi></p>
          <div className="flex items-center justify-between gap-3 bg-white/5 rounded-xl p-4">
            <span className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" aria-hidden="true" />
              <span className="text-sm text-white/90">{t('home.sampleSent')}</span>
            </span>
            <span className="text-sm font-semibold text-red-300"><bdi dir="ltr">− Rs. 7,650.00</bdi></span>
          </div>
        </motion.figure>
      </section>

      {/* How it works */}
      <section aria-labelledby="steps-title" className="relative max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <h2 id="steps-title" className="text-2xl md:text-3xl font-bold mb-8">{t('home.stepsTitle')}</h2>
        <ol className="grid md:grid-cols-3 gap-5 list-none p-0">
          {(['step1', 'step2', 'step3'] as const).map((k, i) => (
            <motion.li key={k} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-6">
              <span aria-hidden="true" className="font-mono text-xs text-[#FF7F50] font-bold">0{i + 1}</span>
              <h3 className="text-lg font-semibold mt-2 mb-2">{t(`home.${k}.title`)}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{t(`home.${k}.desc`)}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section aria-labelledby="features-title" className="relative max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <h2 id="features-title" className="text-2xl md:text-3xl font-bold mb-8">{t('home.featuresTitle')}</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0">
          {FEATURES.map(({ key, icon: Icon }, i) => (
            <motion.li key={key} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3} variants={fadeUp}
              className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-6">
              <span aria-hidden="true" className="w-10 h-10 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center mb-4"><Icon className="w-5 h-5" /></span>
              <h3 className="text-lg font-semibold mb-1.5">{t(`home.${key}.title`)}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{t(`home.${key}.desc`)}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-title" className="relative max-w-3xl mx-auto px-4 md:px-6 pb-24 text-center">
        <h2 id="cta-title" className="text-2xl md:text-3xl font-bold mb-3">{t('home.finalTitle')}</h2>
        <p className="text-white/70 mb-6">{t('home.finalSub')}</p>
        <Link to="/signup" className={btnPrimary}>{t('home.ctaPrimary')} <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" /></Link>
      </section>

      <Footer />
    </div>
  );
}
