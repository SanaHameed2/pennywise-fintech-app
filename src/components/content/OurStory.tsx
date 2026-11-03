import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";
import { ABOUT_FACTS } from "@/utils/aboutFacts";

/** Renders only the facts that have actually been filled in. */
export default function OurStory() {
  const f = ABOUT_FACTS;
  const hasAny = f.ownerName || f.ownerBio || f.founded || f.specialities.length || f.partsPolicy || f.repairGuarantee;
  if (!hasAny) return null;

  return (
    <section className="section bg-white">
      <Container>
        <SectionTitle
          eyebrow="Our Story"
          title="The People Behind EVA TECH"
          description="A local, independent shop run from Widnes Market, so you always deal with the person who actually fixes your device."
          align="center"
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-[280px_1fr]">
          {f.ownerPhoto && (
            <img
              src={f.ownerPhoto}
              alt={f.ownerName ? `${f.ownerName}, ${f.ownerRole}` : "EVA TECH technician"}
              className="h-72 w-full rounded-2xl object-cover shadow-card lg:w-[280px]"
              loading="lazy"
            />
          )}
          <div className={f.ownerPhoto ? "" : "lg:col-span-2"}>
            {f.ownerName && (
              <h3 className="text-2xl font-bold text-ink-900">
                {f.ownerName}
                {f.ownerRole && <span className="block text-base font-medium text-brand-500">{f.ownerRole}</span>}
              </h3>
            )}
            {f.ownerBio && <p className="mt-4 leading-7 text-ink-600">{f.ownerBio}</p>}
            {f.founded && <p className="mt-4 leading-7 text-ink-600">EVA TECH has been trading in Widnes since {f.founded}.</p>}

            {f.specialities.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-ink-900">What we specialise in</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-600">
                  {f.specialities.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            )}
            {f.partsPolicy && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-ink-900">Our parts policy</p>
                <p className="mt-1 leading-7 text-ink-600">{f.partsPolicy}</p>
              </div>
            )}
            {f.repairGuarantee && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-ink-900">Repair guarantee</p>
                <p className="mt-1 leading-7 text-ink-600">{f.repairGuarantee}</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
