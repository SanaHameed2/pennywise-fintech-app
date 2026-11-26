# Changelog

## 1.1.0 (2026-11-21): security hardening, honesty and accessibility pass

### Security (see docs/SECURITY.md)
- Fixed 8 reproducible holes in the money path: negative-amount transfers, client-forgeable wallets/transactions/OTPs, a limit-free legacy `transfer_funds()`, unvalidated recipients, lost failure audits, forgeable "OTP".
- Replaced the browser-side PIN (`'123456'` was in the source) and `Math.random()` OTP with a server-verified, hashed, rate-limited PIN and JWT-checked TOTP freshness.
- Idempotency is now per user and replayable; daily limits use Pakistan time and are race-free.
- Replaced the shared demo account (credentials in the bundle) with private anonymous guest sessions and automatic clean-up.
- Migrations now reproduce a fresh database (profiles, notifications, signup trigger were missing).

### Bugs fixed
- A failed transfer (wrong PIN, no balance, network down) showed the success receipt.
- Sent money appeared as income on the dashboard; amount signs are now canonical (income > 0, outgoing < 0).
- The dashboard chart and every "stat" were hard-coded or computed from the last 10 rows; they now come from the ledger (`get_insights`).
- Design tokens (`bg-card`, `text-foreground`, `bg-brand-primary`...) were undefined in Tailwind 3, so Settings buttons rendered unstyled; a global `!important` colour/size override masked this and flattened the type scale. Both fixed.
- Urdu mode never activated for browsers reporting `ur-PK` (layout stayed LTR, Urdu fonts never loaded).
- Settings Profile/Preferences tabs were non-functional placeholders; every toast appeared twice; "Remember me" did nothing; "Forgot password" linked to a missing route (password reset now implemented); "Add Money"/"Withdraw" both opened Transfer.
- The PWA was declared but not implemented (`VitePWA({})` was empty, `public/icons/` was empty, so the app was not installable and had no offline support).
- Removed false claims (FDIC, SOC 2, "95,000+ people", "bank-grade", "256-bit"), dead social links and fake sample insights.

### Added
- Transaction PIN management, authenticator step-up in the wizard, forgot/reset password, About page (sandbox notice, security, accessibility), real insights and categories.
- Accessibility: skip link, landmarks, route focus + page titles, labelled controls, live announcements, `inert` flip-cards, chart data tables, AA contrast, native-`<dialog>` modals, WAI-ARIA tabs, reduced-motion support.
- A real PWA: web manifest, brand icons (incl. maskable), offline app shell via a service worker (account data is never cached), offline notice, social-preview image.
- Test suites: 72 database checks, 120 unit/component tests, 33 Playwright tests (real Chromium), axe (WCAG 2.2 AA incl. contrast) on every page in both languages.

### Changed
- Bundle: main 628 kB to 114 kB, Dashboard 418 kB to 32 kB (charts lazy-loaded, vendor chunks split).
- Removed ~45 unused UI files and 53 unused dependencies (MUI, emotion, 30 Radix packages, ...); fonts are self-hosted.
- Removed unreachable prototype pages (Save, Invest, BudgetCards, SecurityFlow); they remain in git history.

## 1.0.0 (2026-11-14)
First complete release: wallet, transfers, budgets, notifications, English/Urdu, PWA.
