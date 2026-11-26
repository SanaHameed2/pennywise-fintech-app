# Handover: what changed and what to check yourself

This describes the 1.1.0 work, how to deploy it, and a manual test checklist for the parts that need your real Supabase project.

## 1. Deploy order (important)

1. **Back up** the project (Supabase > Database > Backups) or run `pg_dump`.
2. **Check for duplicates** the new migration refuses to touch (it aborts with a clear message rather than corrupting data):
   ```sql
   select user_id, count(*) from public.wallets group by 1 having count(*) > 1;           -- must return 0 rows
   ```
3. **Look for an old signup trigger** that already creates profile/wallet rows (the new `on_auth_user_created` uses `ON CONFLICT DO NOTHING`,
   but two triggers racing is confusing):
   ```sql
   select tgname, tgrelid::regclass, pg_get_triggerdef(oid) from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
   ```
   Drop any old one except `on_auth_user_created`.
4. Apply, in order: `20261121000000_security_hardening.sql`, `20261121010000_insights.sql`, `20261121020000_guest_sessions.sql`
   (`supabase db push`, or the SQL editor). The first one normalises old amounts (outgoing becomes negative) and back-fills profiles.
5. Authentication > Providers: enable **Allow anonymous sign-ins** (one-click demo). Optionally rate-limit sign-ins.
6. Authentication > URL Configuration: add `https://YOUR-DOMAIN/reset-password` to the redirect allow-list (password reset).
7. Optional nightly clean-up of guest accounts (Database > Extensions > `pg_cron`):
   `select cron.schedule('purge-guest-sessions','0 3 * * *', $$select private.purge_stale_anonymous_users(7)$$);`
8. Vercel: set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and optionally `VITE_REPO_URL`, `VITE_CONTACT_EMAIL`). Redeploy.

Users who already set a PIN in the old client had none stored server-side, so everyone sets a PIN once (the wizard prompts them).

## 2. Manual checklist (needs the real backend)

- [ ] Sign up: wallet shows Rs. 50,000 and a "Welcome bonus" transaction.
- [ ] One-click demo creates a guest; Settings shows the guest notice instead of a password form.
- [ ] Set a PIN (Settings > Security). Send Rs. 500: receipt, balance and history update; the dashboard shows it as money **out**.
- [ ] Wrong PIN 5 times locks for 15 minutes; the message shows attempts left.
- [ ] Enable 2-step (authenticator app). A Rs. 20,000 transfer asks for the code and succeeds; **without** the code it is refused by the server.
      This is the one check the automated tests cannot do for you: it proves Supabase's `amr` claim reaches the database as assumed.
- [ ] Double-tap Confirm quickly, or go offline mid-request and retry: only one debit.
- [ ] Password reset email arrives; the link opens "Choose a new password".
- [ ] Switch to Urdu on a phone whose language is `ur-PK`: layout is right-to-left from first load.
- [ ] Screen readers: NVDA + Chrome (Windows), TalkBack (Android), VoiceOver (iOS). Go through Login, Transfer, Settings.
      Watch where focus lands after each step and after switching language mid-transfer.
- [ ] Re-run Lighthouse; the numbers in older release notes predate this work.

## 3. Decisions made on your behalf (reversible)

- Removed unreachable prototype pages (`Save`, `Invest`, `BudgetCards`, `SecurityFlow`) and the dead shadcn `ui/` folder; they are in git history.
- Dark theme only: tokens are fixed dark values, `dark` class is permanent, the light-mode option was removed (it produced unreadable text).
- Profile currency is fixed to PKR (wallets are PKR).
- "Add Money" / "Withdraw" quick actions replaced by Transactions / Security (both only opened Transfer before).
- Urdu: one word for "transfer" ("ٹرانسفر") and for PIN ("پن"); Nastaliq for headings, Naskh for body and controls.
- Fonts are self-hosted (`@fontsource`), so there is no Google Fonts request and the PWA works offline.

## 4. Ideas for later (not done)

Forgot-PIN flow, email verification enforcement, sandbox top-up RPC (with a daily cap), server-localised transaction descriptions,
a light theme, a Lighthouse CI budget, real payment-sandbox integration (Raast / JazzCash / Easypaisa).
