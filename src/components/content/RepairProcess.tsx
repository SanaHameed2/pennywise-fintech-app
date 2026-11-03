import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";
import { Search, FileText, Wrench, ClipboardCheck, CheckCircle } from "lucide-react";

const STEPS = [
  { icon: Search, title: "1. Free diagnosis", text: "We look at the device with you, confirm the fault and check for anything else that could be causing it. A cracked screen, for example, often hides a damaged frame or battery." },
  { icon: FileText, title: "2. Clear quote first", text: "You get the price before any work starts. If we find a second problem while diagnosing, we tell you and you decide, with no surprise additions." },
  { icon: Wrench, title: "3. The repair", text: "Done in-house at our Widnes Market store by a technician using professional tools, so you know who has handled your device." },
  { icon: ClipboardCheck, title: "4. Full test", text: "Before handback we test touch, display, cameras, speakers, microphone, charging, buttons and connectivity, not just the part we replaced." },
  { icon: CheckCircle, title: "5. Handover and aftercare", text: "We show you the result, explain what was done and tell you how to look after the repair. Any warranty terms are explained at collection." },
];

const FAULTS = [
  { symptom: "Cracked or unresponsive screen", cause: "Impact damage to the glass, digitiser or OLED/LCD panel", action: "Inspect the frame and battery, replace the screen assembly, then test touch across the full display" },
  { symptom: "Battery drains quickly or phone shuts down", cause: "A worn battery, or in some cases a charging-circuit fault", action: "Check battery health and charging behaviour, replace the battery if it has degraded" },
  { symptom: "Only charges at an angle, or not at all", cause: "Lint in the port, a worn cable, or a damaged charging port", action: "Clean and inspect the port first; replace the port if the connector is worn or loose" },
  { symptom: "Liquid damage", cause: "Moisture causing corrosion on the board, which keeps spreading over days", action: "Power down, open the device, clean affected areas and test components. Honest advice on what can be saved" },
  { symptom: "Laptop slow, hot or noisy", cause: "Full or ageing storage, blocked vents, a tired fan or dried thermal paste", action: "Diagnose first. Common fixes are an SSD upgrade, a RAM upgrade, a fan clean or software and virus clean-up" },
  { symptom: "No power, no display", cause: "Battery, charging circuit, display connector or a board fault", action: "Step-by-step testing to find the real fault before recommending any repair" },
];

export default function RepairProcess() {
  return (
    <>
      <section className="section bg-white">
        <Container>
          <SectionTitle eyebrow="How Repairs Work" title="What Happens When You Bring a Device In" description="A transparent process from first look to handback, so there are no surprises." align="center" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-ink-100 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section bg-ink-50">
        <Container>
          <SectionTitle eyebrow="Common Faults" title="Symptoms, Likely Causes and What We Do" description="Not sure what is wrong with your device? Start here." align="center" />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ink-50 text-ink-900">
                <tr><th className="p-4">Symptom</th><th className="p-4">Likely cause</th><th className="p-4">What we do</th></tr>
              </thead>
              <tbody className="text-ink-600">
                {FAULTS.map((r) => (
                  <tr key={r.symptom} className="border-t border-ink-100 align-top">
                    <td className="p-4 font-semibold text-ink-900">{r.symptom}</td>
                    <td className="p-4 leading-6">{r.cause}</td>
                    <td className="p-4 leading-6">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </>
  );
}
