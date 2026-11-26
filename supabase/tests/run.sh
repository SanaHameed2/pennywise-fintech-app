#!/usr/bin/env bash
# Database security & behaviour suite.
#
#   supabase/tests/run.sh                 apply every migration to a fresh DB, run the 72-check suite
#   supabase/tests/run.sh --legacy        apply only the pre-audit migrations and replay the original exploits
#
# Needs a throw-away PostgreSQL (>= 15) and `pip install psycopg2-binary`.
# Connection: PGHOST PGPORT PGUSER PGPASSWORD (defaults: localhost 5432 postgres postgres).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$HERE/../migrations"
export PGHOST="${PGHOST:-localhost}" PGPORT="${PGPORT:-5432}" PGUSER="${PGUSER:-postgres}" PGPASSWORD="${PGPASSWORD:-postgres}"
DB="pennywise_test"
MODE="${1:-all}"

psql -q -d postgres -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/bootstrap.sql"
for f in "$MIGRATIONS"/*.sql; do
  if [[ "$MODE" == "--legacy" && "$(basename "$f")" > "20261106999999" ]]; then continue; fi
  tr -d '\r' < "$f" | psql -q -v ON_ERROR_STOP=1 -d "$DB" -f - >/dev/null
done

cd "$HERE"
if [[ "$MODE" == "--legacy" ]]; then python3 legacy_exploits.py "$DB"; else python3 verify.py "$DB"; fi
