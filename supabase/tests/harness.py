import psycopg2, json, uuid, contextlib, sys

import os

def conn(db):
    return psycopg2.connect(
        host=os.environ.get('PGHOST', 'localhost'), port=os.environ.get('PGPORT', '5432'),
        user=os.environ.get('PGUSER', 'postgres'), password=os.environ.get('PGPASSWORD', 'postgres'), dbname=db)

@contextlib.contextmanager
def as_user(c, uid, aal='aal1', amr=None, commit=True):
    """Run statements exactly as a logged-in browser client would (role=authenticated, RLS on)."""
    cur = c.cursor()
    amr = amr if amr is not None else [{"method": "password", "timestamp": 1}]
    claims = json.dumps({"sub": str(uid), "role": "authenticated", "aal": aal, "amr": amr})
    cur.execute("SET LOCAL ROLE authenticated")
    cur.execute("SELECT set_config('request.jwt.claims', %s, true), set_config('request.jwt.claim.sub', %s, true)", (claims, str(uid)))
    try:
        yield cur
        if commit: c.commit()
    except Exception:
        c.rollback(); raise

def admin(c):
    cur = c.cursor(); cur.execute("RESET ROLE"); return cur

def try_(label, fn):
    try:
        r = fn()
        return ("SUCCEEDED", r)
    except Exception as e:
        return ("BLOCKED", str(e).strip().splitlines()[0][:110])

def new_user(c, balance=1000, has_trigger=False):
    uid = uuid.uuid4()
    a = admin(c)
    a.execute("INSERT INTO auth.users(id,email) VALUES (%s,%s)", (str(uid), f"{uid}@t.local"))
    if not has_trigger:
        a.execute("INSERT INTO public.users(id,email,name) VALUES (%s,%s,'T')", (str(uid), f"{uid}@t.local"))
        a.execute("INSERT INTO public.wallets(user_id,balance) VALUES (%s,%s)", (str(uid), balance))
    else:
        a.execute("UPDATE public.wallets SET balance=%s WHERE user_id=%s", (balance, str(uid)))
    c.commit()
    return uid

def balance(c, uid):
    a = admin(c); a.execute("SELECT COALESCE(sum(balance),0) FROM public.wallets WHERE user_id=%s", (str(uid),)); c.commit()
    return float(a.fetchone()[0])
