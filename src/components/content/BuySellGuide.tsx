import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";

/**
 * OWNER CHECK: keep only the checks you genuinely perform on refurbished devices.
 * Delete any line that is not true for your shop. Do not claim what you do not do.
 */
const TESTS = [
  "Screen: touch response across the whole display, dead pixels and colour",
  "Battery: health and charging behaviour",
  "Cameras, speakers, microphone and vibration motor",
  "Buttons, charging port, Wi-Fi, Bluetooth and mobile signal",
  "Account locks: the device must be free of iCloud or Google locks",
];

const SELL_STEPS = [
  { t: "Back up", d: "Copy your photos, contacts and messages to iCloud, Google or a computer." },
  { t: "Sign out of your accounts", d: "Sign out of iCloud or your Google account and turn off Find My. This is essential, because a locked phone can't be resold." },
  { t: "Remove SIM and memory card", d: "Take out your SIM and any memory card, and remove cases and screen protectors you want to keep." },
  { t: "Erase the device", d: "Use the factory reset option in Settings so none of your data is left on it." },
  { t: "Bring it in with accessories", d: "Original box, charger and cable can improve what we can offer. Tell us about any known faults honestly." },
];

const BUY_TIPS = [
  { t: "Ask about battery health", d: "On a used phone the battery is the most worn part. Ask for the figure and what it means for daily use." },
  { t: "Check what warranty applies", d: "A real warranty on a refurbished device matters more than a slightly lower price." },
  { t: "Make sure it isn't locked", d: "A device tied to someone else's account or a network lock can be unusable. Always ask." },
  { t: "Compare real use, not just specs", d: "An older flagship often beats a new budget phone. We'll give you honest advice on what suits your budget." },
];

export default function BuySellGuide() {
  return (
    <section className="section bg-white">
      <Container>
        <SectionTitle eyebrow="Buying & Selling" title="Honest Advice Before You Buy or Sell" description="What to look for in a used device, how we test, and how to prepare yours for sale." align="center" />
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-ink-100 p-6">
            <h3 className="text-lg font-bold text-ink-900">How we test devices before sale</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-600">{TESTS.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="rounded-2xl border border-ink-100 p-6">
            <h3 className="text-lg font-bold text-ink-900">Buying a used phone: what to ask</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-600">{BUY_TIPS.map((x) => <li key={x.t}><strong className="text-ink-900">{x.t}.</strong> {x.d}</li>)}</ul>
          </div>
          <div className="rounded-2xl border border-ink-100 p-6">
            <h3 className="text-lg font-bold text-ink-900">Selling your device: how to prepare</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-ink-600">{SELL_STEPS.map((x) => <li key={x.t}><strong className="text-ink-900">{x.t}.</strong> {x.d}</li>)}</ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
