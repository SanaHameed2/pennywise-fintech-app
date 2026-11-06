// src/app/pages/Home.tsx
import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowUpRight, 
  Facebook, Twitter, Instagram, Linkedin,
  Send, Globe, Receipt, BarChart3, TrendingUp
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Animation Variants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    } 
  }
};

const staggerContainer: Variants = {
  visible: { 
    transition: { 
      staggerChildren: 0.1 
    } 
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: FeatureItem
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FeatureItem = React.memo(({ icon: Icon, title }: { icon: React.ElementType; title: string }) => {
  return (
    <div className="flex items-center gap-3 text-gray-300 text-sm">
      <Icon className="w-4 h-4 text-[#FF7F50]" />
      <span>{title}</span>
    </div>
  );
});

FeatureItem.displayName = 'FeatureItem';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: StepCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StepCard = React.memo(({ step }: { step: { num: string; title: string; desc: string } }) => {
  const { t } = useTranslation();
  return (
    <motion.div variants={fadeInUp} className="border border-white/[0.05] bg-[#0d0d12]/50 p-6 rounded-xl hover:border-white/10 transition-all">
      <div className="font-mono text-xs text-[#FF7F50] font-bold mb-4">
        {t('home.step', 'Step')} {step.num}
      </div>
      <h3 className="text-sm font-semibold text-white mb-2 font-mono uppercase tracking-tight">{step.title}</h3>
      <p className="text-base text-gray-300 leading-relaxed">{step.desc}</p>
    </motion.div>
  );
});

StepCard.displayName = 'StepCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: ToolkitCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ToolkitCard = React.memo(({ item }: { item: { icon: React.ElementType; title: string; desc: string } }) => {
  const Icon = item.icon;
  return (
    <motion.div variants={fadeInUp} className="border border-white/[0.06] bg-[#0d0d12] rounded-2xl p-5 sm:p-6 flex-1 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-mono text-[#FF7F50] font-bold">// {item.title.toUpperCase().replace(' ', '_')}</span>
        <Icon className="w-4 h-4 text-[#FF7F50]" />
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-bold uppercase font-mono text-white">{item.title}</h4>
        <p className="text-base text-gray-300 mt-1">{item.desc}</p>
      </div>
    </motion.div>
  );
});

ToolkitCard.displayName = 'ToolkitCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: ReviewCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ReviewCard = React.memo(({ review }: { review: { text: string; author: string; role: string } }) => {
  return (
    <motion.div variants={fadeInUp} className="border border-white/[0.06] bg-[#0d0d12] p-6 rounded-xl flex flex-col justify-between">
      <p className="text-base text-gray-300 font-mono leading-relaxed italic">"{review.text}"</p>
      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold font-mono text-white/80 block">{review.author}</span>
          <span className="text-[9px] font-mono text-gray-500 block mt-0.5">{review.role}</span>
        </div>
        <span className="text-[#FF7F50] text-[9px] tracking-widest">★★★★★</span>
      </div>
    </motion.div>
  );
});

ReviewCard.displayName = 'ReviewCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: PartnerBadge
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PartnerBadge = React.memo(({ name }: { name: string }) => {
  return (
    <span className="text-xs font-mono text-gray-600 tracking-wider uppercase hover:text-gray-400 transition-colors">
      {name}
    </span>
  );
});

PartnerBadge.displayName = 'PartnerBadge';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main Home Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Home() {
  const { t } = useTranslation();

  // ✅ useMemo: Static data (memoized with `t` dependency)
  const features = useMemo(() => [
    { icon: Send, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: Globe, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: Receipt, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
  ], [t]);

  const steps = useMemo(() => [
    { num: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { num: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { num: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
    { num: '04', title: t('home.step4Title'), desc: t('home.step4Desc') },
  ], [t]);

  const toolkit = useMemo(() => [
    { icon: BarChart3, title: t('home.toolkit1Title'), desc: t('home.toolkit1Desc') },
    { icon: TrendingUp, title: t('home.toolkit2Title'), desc: t('home.toolkit2Desc') },
    { icon: Globe, title: t('home.toolkit3Title'), desc: t('home.toolkit3Desc') },
  ], [t]);

  const reviews = useMemo(() => [
    { text: t('home.review1Text'), author: t('home.review1Author'), role: t('home.review1Role') },
    { text: t('home.review2Text'), author: t('home.review2Author'), role: t('home.review2Role') },
    { text: t('home.review3Text'), author: t('home.review3Author'), role: t('home.review3Role') },
  ], [t]);

  const partners = useMemo(() => ['NORTHWIND', 'ACME', 'VERTEX', 'LUMEN', 'HALCYON', 'MONOLITH'], []);

  const featureList = useMemo(() => {
    return features.map((feature, i) => (
      <FeatureItem key={i} icon={feature.icon} title={feature.title} />
    ));
  }, [features]);

  const stepList = useMemo(() => {
    return steps.map((step, idx) => (
      <StepCard key={idx} step={step} />
    ));
  }, [steps]);

  const toolkitList = useMemo(() => {
    return toolkit.map((item, i) => (
      <ToolkitCard key={i} item={item} />
    ));
  }, [toolkit]);

  const reviewList = useMemo(() => {
    return reviews.map((review, i) => (
      <ReviewCard key={i} review={review} />
    ));
  }, [reviews]);

  const partnerList = useMemo(() => {
    return partners.map((partner, i) => (
      <PartnerBadge key={i} name={partner} />
    ));
  }, [partners]);

  const chartBars = useMemo(() => [45, 55, 48, 65, 58, 80, 72, 95, 85, 100], []);
  const spendingBars = useMemo(() => [25, 40, 35, 55, 45, 70, 60, 85, 75, 90], []);
  const budgetBars = useMemo(() => [30, 45, 60, 40, 75, 50, 90, 65, 80, 95], []);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[60%] left-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/3 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 pt-20">
        
        {/* ─── HERO SECTION ─── */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            <div className="lg:col-span-6 text-left space-y-6">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF7F50]/20 bg-[#FF7F50]/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7F50] animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF7F50] font-bold">
                  {t('home.joinPeople')}
                </span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                {t('home.heroTitle1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7F50] to-[#E05A2B]">
                  {t('home.heroTitle2')}
                </span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
                {t('home.heroSubtitle')}
              </motion.p>
              <motion.div variants={fadeInUp} className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/signup" className="px-6 py-3.5 rounded-xl bg-[#FF7F50] text-black font-bold text-xs uppercase font-mono tracking-wider hover:bg-[#ff8f66] transition-all flex items-center gap-2 group shadow-[0_4px_20px_rgba(255,127,80,0.2)]">
                  {t('home.startFree')} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <button className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-white/70 hover:text-white text-xs font-mono uppercase tracking-wider transition-all">
                  {t('home.learnMore')}
                </button>
              </motion.div>
            </div>

            {/* Hero Card */}
            <motion.div variants={fadeInUp} className="lg:col-span-6">
              <div className="w-full bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-5 sm:p-6 text-left shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF7F50]/20 to-transparent" />
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                      {t('home.yourBalance')}
                    </span>
                    <span className="text-3xl font-bold font-mono tracking-tight mt-1 block text-white">$24,389.20</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                    {t('home.active')}
                  </span>
                </div>
                
                {/* Chart */}
                <div className="h-28 w-full flex items-end gap-1.5 border-b border-white/5 pb-1 relative">
                  {chartBars.map((h, i) => (
                    <div key={i} className="w-full bg-gradient-to-t from-[#FF7F50]/5 to-[#FF7F50]/40 rounded-t-sm transition-all duration-500 group-hover:from-[#FF7F50]/10" style={{ height: `${h}%` }} />
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-6 text-center font-mono text-[10px]">
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                    <span className="text-gray-500 block">PKR</span>
                    <span className="text-white/80 font-bold mt-0.5 block">{t('home.active')}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                    <span className="text-gray-500 block">USD</span>
                    <span className="text-white/80 font-bold mt-0.5 block">{t('home.synced')}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                    <span className="text-gray-500 block">EUR</span>
                    <span className="text-white/80 font-bold mt-0.5 block">{t('home.locked')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── PARTNERS / TRUST BADGES ─── */}
        <section className="py-10 border-t border-white/[0.05]">
          <div className="text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-6">
              {t('home.trustedBy')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {partnerList}
              <span className="text-xs font-mono text-gray-600 tracking-wider">256-bit</span>
              <span className="text-xs font-mono text-gray-600 tracking-wider">FDIC</span>
              <span className="text-xs font-mono text-gray-600 tracking-wider">SOC2</span>
            </div>
          </div>
        </section>

        {/* ─── MOVE MONEY SECTION ─── */}
        <section id="features" className="py-16 border-t border-white/[0.05]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
          >
            <div className="md:col-span-5 text-left space-y-4">
              <motion.span variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-widest text-[#FF7F50] font-bold">
                {t('home.sendMoneyTag')}
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tight uppercase text-white">
                {t('home.fastTransfers')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-300 leading-relaxed font-normal">
                {t('home.fastTransfersDesc')}
              </motion.p>
              <motion.div variants={fadeInUp} className="space-y-2 pt-2">
                {featureList}
              </motion.div>
            </div>
            
            <motion.div variants={fadeInUp} className="md:col-span-7">
              <div className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-5 sm:p-6 text-left font-mono relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase tracking-wider">
                      {t('home.transfer')}
                    </span>
                    <div className="text-2xl font-bold mt-1 text-white">$248.00</div>
                  </div>
                  <div className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-gray-400">
                    TXN-2026-06-27
                  </div>
                </div>
                <div className="space-y-2 bg-[#050507] p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">{t('home.status')}</span>
                    <span className="text-[#FF7F50] font-bold">{t('home.completed')}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">{t('home.from')}</span>
                    <span className="text-gray-300">{t('home.everydayChecking')}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">{t('home.fee')}</span>
                    <span className="text-gray-300">$0.00</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── SEE EVERY DOLLAR SECTION ─── */}
        <section className="py-16 border-t border-white/[0.05]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
          >
            <motion.div variants={fadeInUp} className="md:col-span-7 order-2 md:order-1">
              <div className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-5 sm:p-6 text-left relative overflow-hidden">
                <div className="flex justify-between items-baseline mb-6 font-mono">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {t('home.yourSpending')}
                  </span>
                  <span className="text-lg font-bold text-[#FF7F50]">+$4,210.05</span>
                </div>
                <div className="h-32 w-full bg-[#050507] rounded-lg border border-white/5 flex items-end p-4 gap-1">
                  {spendingBars.map((v, i) => (
                    <div key={i} className="w-full bg-[#FF7F50]/10 border-t-2 border-[#FF7F50] rounded-t-xs" style={{ height: `${v}%` }} />
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-300 font-mono">
                  {t('home.spentLess')}
                </div>
              </div>
            </motion.div>
            
            <div className="md:col-span-5 order-1 md:order-2 text-left space-y-4">
              <motion.span variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-widest text-[#FF7F50] font-bold">
                {t('home.trackSpendingTag')}
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tight uppercase text-white">
                {t('home.knowWhereMoneyGoes')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-300 leading-relaxed font-normal">
                {t('home.knowWhereMoneyGoesDesc')}
              </motion.p>
            </div>
          </motion.div>
        </section>

        {/* ─── FOUR STEPS ─── */}
        <section className="py-20 border-t border-white/[0.05] text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF7F50] font-bold">
            {t('home.howItWorks')}
          </span>
          <h2 className="text-3xl font-bold tracking-tight uppercase mt-2 mb-16 text-white">
            {t('home.startInSteps')}
          </h2>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
          >
            {stepList}
          </motion.div>
        </section>

        {/* ─── TOOLKIT ─── */}
        <section id="toolkit" className="py-20 border-t border-white/[0.05]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <motion.span variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-widest text-[#FF7F50] font-bold">
                {t('home.features')}
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tight uppercase mt-2 text-white">
                {t('home.everythingYouNeed')}
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Card */}
              <motion.div variants={fadeInUp} className="lg:col-span-7 border border-white/[0.06] bg-[#0d0d12] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2">
                    {t('home.smartBudgetingTag')}
                  </span>
                  <h3 className="text-xl font-bold uppercase font-mono tracking-tight text-white">
                    {t('home.budgetsThatStick')}
                  </h3>
                  <p className="text-base text-gray-300 mt-1 max-w-sm">
                    {t('home.budgetsThatStickDesc')}
                  </p>
                </div>
                <div className="h-36 w-full bg-[#050507] rounded-xl border border-white/5 mt-8 flex items-end p-4 gap-1 relative overflow-hidden">
                  {budgetBars.map((val, i) => (
                    <div key={i} className="bg-gradient-to-t from-[#FF7F50]/20 to-[#FF7F50] rounded-t-sm w-full" style={{ height: `${val}%` }} />
                  ))}
                </div>
              </motion.div>

              {/* Right Cards */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {toolkitList}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section id="reviews" className="py-20 border-t border-white/[0.05]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <motion.span variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-widest text-[#FF7F50] font-bold">
                {t('home.testimonials')}
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tight uppercase mt-2 text-white">
                {t('home.lovedByPeople')}
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {reviewList}
            </div>
          </motion.div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-16 border-t border-white/[0.05]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full bg-gradient-to-b from-white/[0.01] to-transparent border border-white/[0.06] rounded-2xl p-10 md:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-[#FF7F50]/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="max-w-md mx-auto space-y-6 relative z-10">
              <motion.h2 variants={fadeInUp} className="text-4xl font-bold tracking-tight text-white uppercase">
                {t('home.readyToTakeControl')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-300 font-mono leading-relaxed">
                {t('home.readyToTakeControlDesc')}
              </motion.p>
              <motion.div variants={fadeInUp} className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link to="/signup" className="px-8 py-4 rounded-xl bg-[#FF7F50] text-black font-bold text-xs font-mono uppercase tracking-widest hover:bg-[#ff8f66] transition-all cursor-pointer shadow-[0_4px_25px_rgba(255,127,80,0.3)]">
                  {t('home.getStarted')}
                </Link>
                <button className="px-8 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white text-xs font-mono uppercase tracking-wider transition-all">
                  {t('home.learnMore')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="py-12 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-6 gap-8 text-left">
          <div className="md:col-span-2 space-y-4">
            <span className="text-sm font-bold font-mono tracking-widest text-white uppercase">PennyWise</span>
            <p className="text-base text-gray-300 max-w-xs leading-relaxed font-mono">
              {t('home.footerDesc')}
            </p>
            <div className="flex items-center gap-3 text-gray-600 pt-1">
              <Facebook className="w-4 h-4 hover:text-[#FF7F50] transition-colors cursor-pointer" />
              <Twitter className="w-4 h-4 hover:text-[#FF7F50] transition-colors cursor-pointer" />
              <Instagram className="w-4 h-4 hover:text-[#FF7F50] transition-colors cursor-pointer" />
              <Linkedin className="w-4 h-4 hover:text-[#FF7F50] transition-colors cursor-pointer" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
              {t('home.product')}
            </span>
            <div className="flex flex-col gap-2 text-sm font-mono text-gray-400">
              <a href="#" className="hover:text-white transition-colors">{t('home.features')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('home.pricing')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('home.security')}</a>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
              {t('home.legal')}
            </span>
            <div className="flex flex-col gap-2 text-sm font-mono text-gray-400">
              <a href="#" className="hover:text-white transition-colors">{t('home.privacy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('home.terms')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('home.security')}</a>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
              {t('home.support')}
            </span>
            <span className="text-base text-gray-300 block">support@pennywise.com</span>
            <span className="text-[10px] font-mono text-gray-500 block mt-1">
              {t('home.copyright')}
            </span>
          </div>

          <div className="col-span-full pt-8 border-t border-white/5 text-center text-[10px] font-mono text-gray-500">
            {t('home.footerBottom')}
          </div>
        </footer>

      </div>
    </div>
  );
}