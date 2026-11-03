# Where to add each component

Copy `src/` into your project (merge folders). Then:

HOME (src/pages/Home.tsx)       -> import WidnesLocal and add <WidnesLocal /> just above <CTABanner />
ABOUT (src/pages/About.tsx)     -> import OurStory and add <OurStory /> after the "Who We Are" section
                                   FILL IN src/utils/aboutFacts.ts with REAL facts first
SERVICES (src/pages/Services.tsx)-> add <RepairProcess /> then <TroubleshootingGuide /> before <CTABanner />
BUY & SELL (src/pages/BuySell.tsx)-> add <BuySellGuide /> before <CTABanner />

Example import:
  import WidnesLocal from "@/components/content/WidnesLocal";

Before deploying:
  1. In BuySellGuide.tsx delete any "test" you do not actually perform.
  2. Fix the About page stats (15+ years / 1000+ / 5000+) so they are TRUE and provable.
  3. Remove the placeholder <AdSlot slot="1234567890" /> in src/pages/BlogPost.tsx until AdSense approves the site.
  4. npm run build   (check there are no TypeScript errors)
