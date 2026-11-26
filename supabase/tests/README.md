# Database tests

These tests run against a **real PostgreSQL** with a small emulation of Supabase's `auth` schema
(`bootstrap.sql`). Each check acts as an ordinary signed-in browser user (role `authenticated`, RLS on).

```bash
pip install psycopg2-binary
PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres ./supabase/tests/run.sh          # 72 checks, all must pass
PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres ./supabase/tests/run.sh --legacy # replay the original exploits
```

`--legacy` applies only the migrations that existed before the 2026-11-21 security audit and shows
what an attacker could do (see `docs/SECURITY.md`). The default run applies everything and proves each
hole is closed, plus the behaviour of PIN lock-out, MFA freshness, limits, idempotency, concurrency,
signup, insights and guest sessions.
