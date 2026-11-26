# Security model and audit

Pennywise is a sandbox (simulated money), but it is built as if the money were real. This document records
what was found in an audit on 2026-11-21, how each issue was fixed, and what is still open.

## Findings in the earlier version (all reproduced against a real PostgreSQL)

`supabase/tests/run.sh --legacy` replays these as an ordinary signed-in user against the pre-audit migrations.

| # | Issue | Evidence (legacy schema) | Fix |
|---|---|---|---|
| E1 | Clients could **insert their own wallet** row with any balance | `INSERT ... balance 9,999,999` succeeded | No client INSERT/UPDATE/DELETE on wallets, transactions, audit logs; one wallet per user (`UNIQUE`) |
| E2 | `execute_transfer(-40000)` **added** money (no `amount > 0` check) | Balance 1,000 became 41,000 | Amount validated: positive, 2 decimals, bounded |
| E3 | The "OTP" was generated in the browser (`Math.random`) and inserted by the client, so anyone could plant their own | Self-issued OTP + 30,000 transfer succeeded | OTP table removed; step-up is a TOTP code verified in the **signed JWT** |
| E4 | A forgotten `transfer_funds()` bypassed every limit and the OTP | 800,000 sent (limit 50,000); negative amount minted 500,000 | Function dropped |
| E5 | Clients could **forge transactions** (e.g. a Rs. 250,000 "income") | Insert succeeded | No client INSERT on transactions |
| E6 | Failed attempts were **never audited** (the error rolled the audit row back) | 0 audit rows after a failed transfer | Business failures *return* a code instead of raising, so counters and audit rows commit |
| E7 | The recipient was never validated (any id, any name) | Transfer to a non-existent beneficiary succeeded | Beneficiary must belong to the caller; the name is read server-side |
| E8 | `anon` could execute the money functions | `has_function_privilege` true | `REVOKE ... FROM PUBLIC, anon`; `search_path` pinned on every `SECURITY DEFINER` function |

Also fixed: hard-coded PIN `'123456'` and a shared demo account (credentials in the bundle) in the client; `Math.random` card
numbers presented as real; the UI showing a success receipt on *any* error.

## How the transfer path works now (`public.execute_transfer`)

1. Authenticated caller only; amount validated.
2. **Lock the caller's wallet row** (serialises all their money operations; makes idempotency race-free).
3. **Idempotent replay:** an existing transaction with the same `(user, key)` returns the original result.
4. Beneficiary ownership, per-transfer limit (Rs. 50,000), daily limit (Rs. 100,000, `Asia/Karachi` day), balance.
5. **Step-up:** from Rs. 10,000, a TOTP verified within 5 minutes (`aal2` + a fresh `amr` entry in the JWT).
6. **PIN last:** bcrypt hash, 5 wrong tries then a 15-minute lock. The counter only moves when everything else was valid.
7. Debit, ledger row (signed, with `balance_after` and a unique `PW-` reference), notification, audit row.

Invariant tested after every scenario: **a wallet's balance equals the sum of its completed transactions.**

## Residual risks and what is deliberately out of scope

- **Simulated money.** No payment-provider integration, so no PCI scope. Card pages are samples and store nothing.
- **TOTP freshness depends on Supabase's JWT claims** (`aal`, `amr`). The SQL is tested against a faithful emulation, and the UI flow is
  tested against a fake backend; please also verify once against your live project (see HANDOVER.md).
- **No "forgot PIN" flow yet.** Changing a PIN requires the current PIN. A reset should require a recent password re-login plus TOTP.
- **No CAPTCHA / bot protection** on sign-up (relevant because anonymous sign-ins can be created freely; rate-limit them in Supabase Auth settings).
- **Email enumeration:** password reset is neutral; sign-up/log-in error messages come from Supabase.
- Session idle timeout is client-side (15 min); the JWT itself lives as long as Supabase issues it.
- This is a portfolio project, not a regulated service. An independent review would be needed before any real use.

## Reporting

Please open an issue, or write to the contact shown on the About page, with steps to reproduce. Please do not test against
other people's accounts.
