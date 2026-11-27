Pennywise update pack (after the 26 Nov NVDA test)

Extract this zip INTO your project folder and choose "replace" for existing files.
These 11 files are the only ones that changed since the version you deployed before recording the video.

Behaviour (what users see):
  src/components/LanguageToggle.tsx        focus goes back to the PIN digit; button named "Urdu" (script is decorative)
  src/components/LanguageAnnouncer.tsx     announcement is English first, then Urdu
  src/locales/en.json                      "cryptographic PIN" wording removed
  src/locales/ur.json                      matching Urdu wording

Tests (so CI stays green):
  src/components/__tests__/LanguageAnnouncer.test.tsx
  src/components/__tests__/LanguageToggle.test.tsx      (new)
  src/components/__tests__/pages-a11y.test.tsx
  src/__tests__/i18n.test.ts                            (also blocks the word "cryptographic")
  tests/e2e/language-switch.spec.ts

Docs:
  docs/ACCESSIBILITY_TESTING.md            your NVDA row + findings + re-test checklist
  CHANGELOG.md

After copying, run:  npm run verify   (and  npm run test:e2e  if you have Playwright installed)
Then commit and push; Vercel redeploys.
