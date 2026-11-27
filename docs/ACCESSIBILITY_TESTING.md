# Accessibility testing log

Automated tools (axe, ESLint `jsx-a11y`, the Playwright suite) catch roughly a third of real accessibility problems.
They cannot tell you what a screen reader *says*, whether the order makes sense, or whether a task is *usable*.
This file separates **what is verified automatically** from **what a human has tested**, and is meant to be
filled in honestly, including the failures.

## Verified automatically on every change

- axe (WCAG 2.2 A/AA + best practices, including colour contrast) on every page, in English and Urdu, in real Chromium.
- Keyboard-only transfer flow, focus after each step, skip link, notification menu with Escape, tabs with arrow keys.
- Language switch mid-transfer keeps the recipient, amount, PIN digits and focus (`tests/e2e/language-switch.spec.ts`).
- Urdu detection from `ur-PK`, right-to-left document, `lang`/`dir` attributes.

## Verified by a human (fill in; leave blank what you have not done)

| Date | Tester | Tool + version | Browser / OS | Scenario | Result | Notes / what broke |
|---|---|---|---|---|---|---|
|  |  | NVDA 20xx.x | Chrome, Windows | Login, then Transfer, English |  |  |
| 2026-11-26 | Sana | NVDA | Chrome, Windows 10 | **Language switch on the PIN / review step** (see below) | Partial / Issues found | **Announced:** NVDA reported Urdu speech synthesis not supported and announced digit/protected-blank cues (`digit 3 of 6 entered protected blank`, `star`). **Focus:** Focus shifted away from the PIN input toward navigation/header controls on language switch instead of staying on the PIN input. **Data preserved:** Beneficiary (`SANA`), bank (`DubaiIslamic`), IBAN (`PK36...6702`), amount (`Rs. 2,000.00`), and note (`for book purchase`) stayed intact; transfer completed after finishing PIN. |
| 2026-11-27 | Sana | NVDA | Chrome, Windows 10 | **Re-test: Language switch on the PIN / review step** | Passed | **Button & announcement:** Focusing `Urdu button` did not report speech-synthesis error; pressing Enter announced `"Language changed to Urdu"`. **Focus:** Returned directly to `digit 3 of 6` (`star`) on the PIN step. **Data preserved:** Beneficiary (`SANA`), bank (`DubaiIslamic`), IBAN (`PK36...6702`), and amount (`Rs. 100.00`) stayed intact; transfer completed (`PW-CDFC89561B`). Direct `/transfer` reload briefly showed `404` before navigating, and Chrome's auto-translate bar appeared after switching to Urdu. |
|  |  | TalkBack | Chrome, Android | Transfer |  |  |
|  |  | VoiceOver | Safari, iOS | Transfer |  |  |
|  |  | (a real screen-reader user) |  | Transfer, Settings |  |  |

### Script for the language-switch scenario

1. Start NVDA. Open `/transfer` in English. Using only the keyboard, choose a beneficiary, enter an amount, reach the PIN step.
2. Type two PIN digits. Move to the language button and press Enter.
3. Note, in order: what is announced; where focus is; whether the Urdu voice speaks (see "Known limits");
   whether recipient, amount and currency can be read again; whether anything had to be re-entered.
4. Finish the transfer. Note anything confusing.

## Known limits (true today)

- Windows does not include an Urdu text-to-speech voice by default. If none is installed, NVDA reads Urdu text with an English voice,
  which is not a bug in the page but is a real barrier for the user. Say so in any demo.
- Amounts and IBANs are wrapped in `dir="ltr"` so their order stays correct inside Urdu text. Whether a given screen reader
  reads them well in an Urdu voice is **untested**.
- Charts are decorative to assistive technology; the same numbers are available as a hidden table.
- The `description` of server-created transactions ("Transfer to ...") is stored in English.

## How to report a problem

Open an issue with: assistive technology and version, browser, OS, the page, what you expected and what happened.
## Findings from the 2026-11-26 NVDA session, and what changed

| # | What was observed | Cause | Change made | Status |
|---|---|---|---|---|
| 1 | After switching language, focus was in the header, not on the PIN input | The toggle is in the header, so the user had to leave the form to reach it, and nothing returned them | When the toggle is activated **from the keyboard**, focus now goes back to the control the user was last working on in the page (the PIN digit). A mouse click does not move focus. | Fixed in code and covered by unit + E2E tests. Verified in 2026-11-27 NVDA re-test. |
| 2 | NVDA said Urdu speech synthesis is not supported | No Urdu voice installed. But two parts were avoidable: the language button was spoken with an Urdu `lang`, and the language-change message was Urdu-only, so these users never heard it | The button is now named by the English word "Urdu" (the Urdu script is a visual cue only and hidden from assistive tech). The announcement is bilingual: an English sentence first, then Urdu. | Fixed in code. Verified in 2026-11-27 NVDA re-test (bilingual announcement & button focus confirmed; system Urdu TTS still depends on installed voice). |
| 3 | NVDA read "digit 3 of 6 entered protected blank" and "star" | The PIN boxes are password-type fields, so NVDA reports protected characters. This is NVDA's normal behaviour for hidden input and is appropriate for a PIN | None | Expected, not a defect. Worth mentioning in the video so viewers are not confused. |
| 4 | Beneficiary, bank, IBAN, amount and note were all preserved and the transfer completed | n/a | None | Works as designed. |

### Re-test checklist (same scenario, after the changes above)

- [x] Keyboard only: reach the PIN step, type two digits, go to the language button, press Enter.
- [x] Focus returns to the PIN digit you were on (not the header).
- [x] You hear "Language changed to Urdu." even without an Urdu voice.
- [x] Focusing the language button in English no longer triggers "speech not supported".
- [x] Finish the transfer. Note anything confusing.

### Urdu speech on Windows (to try; unconfirmed)

Windows has no Urdu voice by default. NVDA bundles the eSpeak NG synthesizer, which lists Urdu among its languages
(NVDA Settings, Speech, Synthesizer). Quality varies and this has not been confirmed on your machine. If it works,
record the demo with it and say which voice was used; if not, say plainly that Urdu speech was not available.