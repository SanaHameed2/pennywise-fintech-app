import { Link } from "react-router-dom";
import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";

const GUIDES = [
  {
    problem: "My phone won't charge",
    steps: [
      "Try a different cable and a different plug. Cables fail far more often than phones.",
      "Switch the phone off, then look into the charging port with a torch. Pocket lint packs in over time.",
      "Gently clear lint with a wooden or plastic toothpick. Never use metal, which can short the pins.",
      "Restart the phone and try again. If it only charges when the cable is held at an angle, the port is worn.",
    ],
    when: "A loose or worn port needs replacing. Keep using it and the cable can damage the connector further.",
    link: { to: "/blog/why-is-my-phone-charging-slowly", label: "Why is my phone charging slowly?" },
  },
  {
    problem: "My battery drains too fast",
    steps: [
      "On iPhone, open Settings, then Battery, then Battery Health & Charging. Around 80% or lower means the battery is worn.",
      "On Android, open the battery section in Settings, or the phone's care app, and look for the apps using the most power.",
      "Update the operating system and your apps, and lower screen brightness while you test.",
      "Avoid leaving the phone on a hot dashboard or windowsill. Heat ages batteries quickly.",
    ],
    when: "If health is low, or the phone shuts down at 20 to 30%, replacing the battery is the right fix.",
    link: { to: "/blog/how-to-tell-if-your-iphone-battery-needs-replacing", label: "How to tell if your iPhone battery needs replacing" },
  },
  {
    problem: "My screen is cracked",
    steps: [
      "Stop pressing on the cracks. Cover them with clear tape so glass splinters don't catch your fingers.",
      "Back up your photos and data now, in case the touch layer fails completely.",
      "Keep the phone away from water. Cracks let moisture and dust reach the display.",
      "Get a quote early. Cracks spread and touch problems usually get worse, not better.",
    ],
    when: "Touch that registers by itself, dead patches, lines or colour bleeding all mean the display underneath is damaged too.",
    link: { to: "/blog/phone-screen-repair-cost-widnes", label: "Phone screen repair costs in Widnes" },
  },
  {
    problem: "My phone got wet",
    steps: [
      "Take it out and switch it off straight away. Don't charge it.",
      "Take off the case, remove the SIM tray and wipe the outside gently.",
      "Leave it somewhere warm with airflow. Avoid hairdryers, and don't bother with rice.",
      "Get it checked even if it seems fine, because corrosion can take days to show.",
    ],
    when: "Salt water, sugary drinks or a full submersion should be checked as soon as possible.",
    link: { to: "/blog/dropped-your-phone-in-water-what-to-do", label: "Dropped your phone in water? Do this first" },
  },
  {
    problem: "My laptop is slow, hot or loud",
    steps: [
      "Check free disk space. Aim to keep roughly 15% of the drive free.",
      "Open Task Manager (Ctrl + Shift + Esc) and look at what runs at start-up and what uses the most memory.",
      "Make sure the vents aren't blocked. Use the laptop on a hard surface, not a duvet.",
      "Run Windows updates and a full security scan.",
    ],
    when: "If it still crawls and has an older hard disk drive, an SSD upgrade is usually the biggest speed boost. Constant fan noise suggests a clogged fan or dried thermal paste.",
    link: { to: "/blog/5-warning-signs-your-laptop-needs-professional-repair", label: "5 warning signs your laptop needs repair" },
  },
  {
    problem: "My phone won't turn on",
    steps: [
      "Plug it into a known-good charger for at least 30 minutes before deciding anything.",
      "Try a force restart. The button combination varies by model, so check your phone maker's support page.",
      "Look for signs of a swollen battery, such as a screen lifting at the edges. If you see this, stop using it.",
      "Note whether it ever showed a charging symbol, as this helps us diagnose it faster.",
    ],
    when: "A phone that never responds to a good charger needs proper diagnosis. It could be the battery, charging circuit or board.",
    link: null,
  },
];

const BRING_LIST = [
  "Back up your photos and data if you can. We always try to protect your data, but a backup is the safest option.",
  "Know your passcode or password, as we need to test the device after repair.",
  "Tell us if Find My iPhone or a Google account lock is on, because some repairs need it switched off.",
  "Take off the case and, if you can, remove the SIM and memory card.",
  "Tell us exactly what happened and when it started. Details make diagnosis faster.",
];

export default function TroubleshootingGuide() {
  return (
    <section className="section bg-white">
      <Container>
        <SectionTitle
          eyebrow="Before You Book"
          title="Try These Fixes First"
          description="Many faults have a simple cause. Work through these steps, and if they don't help, you'll know a repair is needed and can tell us what you've already tried."
          align="center"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {GUIDES.map((g) => (
            <article key={g.problem} className="rounded-2xl border border-ink-100 bg-white p-6">
              <h3 className="text-xl font-bold text-ink-900">{g.problem}</h3>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink-600">
                {g.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="mt-4 text-sm leading-6 text-ink-700"><strong>When it needs a repair:</strong> {g.when}</p>
              {g.link && <Link to={g.link.to} className="mt-3 inline-block text-sm font-semibold text-brand-500 hover:underline">{g.link.label} →</Link>}
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-ink-50 p-8">
          <h3 className="text-xl font-bold text-ink-900">Before you bring a device in</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-600">
            {BRING_LIST.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      </Container>
    </section>
  );
}
