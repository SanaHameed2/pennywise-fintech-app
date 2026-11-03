/**
 * REAL facts only. Anything left as "" (or [] ) is simply NOT shown on the site.
 * The owner must fill these in from real information. Do not invent numbers.
 * Adding true, specific details here is the fastest way to build trust (E-E-A-T).
 */
export const ABOUT_FACTS = {
  founded: "", // e.g. "2020"  (use the real year the shop opened)
  ownerName: "", // e.g. "Full name of owner / lead technician"
  ownerRole: "", // e.g. "Founder & Lead Technician"
  ownerPhoto: "", // e.g. "/images/team/owner.webp" (a real photo)
  ownerBio: "", // 2-4 sentences: background, training, why the shop started
  specialities: [] as string[], // e.g. ["iPhone board-level repair", "Laptop SSD upgrades"]
  partsPolicy: "", // e.g. "What parts you use and where they come from"
  repairGuarantee: "", // e.g. exact warranty length on repairs (match the /warranty page)
};
