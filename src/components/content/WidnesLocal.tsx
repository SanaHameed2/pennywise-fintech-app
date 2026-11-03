import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";
import { BRAND } from "@/utils/content";
import { MapPin } from "lucide-react";

const FAQS = [
  { q: "Where can I get a phone repaired in Widnes?", a: "EVA TECH repairs phones, tablets and laptops at our store in Widnes Market. You can walk in for a free diagnosis, or call or message us on WhatsApp first to describe the problem." },
  { q: "Do I need to book?", a: "Walk-ins are welcome. If you tell us the device and fault in advance by phone or WhatsApp, we can check we have the right part ready, which can save you time." },
  { q: "Do you repair all brands?", a: "We repair the major brands, including Apple, Samsung, Huawei, Xiaomi, Dell and Lenovo. If you have something less common, message us the model and we'll tell you honestly whether we can help." },
  { q: "Will I know the price before you start?", a: "Yes. Diagnosis is free and you receive a quote before any repair begins. If we find another fault, we tell you before doing extra work." },
  { q: "Can I sell my old phone or laptop to you?", a: "Yes. Bring the device in for a valuation, or message us the model and condition. Remember to sign out of your accounts and back up your data first." },
];

export default function WidnesLocal() {
  return (
    <section className="section bg-ink-50">
      <Container>
        <SectionTitle eyebrow="Local Repairs" title="Phone, Tablet & Laptop Repairs in Widnes" description="An independent device shop serving Widnes and the surrounding Halton area." align="center" />
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 leading-7 text-ink-600">
            <p>EVA TECH is based inside Widnes Market, so repairs, second-hand devices and accessories are all in one place, with someone to talk to rather than a form to fill in.</p>
            <p>Most of our customers come from Widnes itself, and the store is easy to reach from Runcorn, Warrington, St Helens and Liverpool if you are looking for a repair shop that explains the fault before charging for anything.</p>
            <p>Whether it's an iPhone screen, a Samsung that won't charge, an iPad that has stopped responding or a laptop that has slowed to a crawl, bring it in and we'll tell you honestly what is wrong, what it will cost and whether a repair is worth it.</p>
            <p className="flex items-start gap-2 text-ink-900"><MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-500" /> <span>{BRAND.address}</span></p>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl border border-ink-100 bg-white p-5">
                <h3 className="font-bold text-ink-900">{f.q}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
