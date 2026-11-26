"""
Pennywise database verification suite.
Runs against a Postgres that has bootstrap.sql + all supabase/migrations applied.
Every test acts as an ordinary signed-in browser client (role=authenticated, RLS on)
unless it says otherwise.
"""
import sys, time, json, threading, uuid
from harness import *

db = sys.argv[1]
c = conn(db)
PASS = FAIL = 0
def check(name, ok, detail=""):
    global PASS, FAIL
    if ok: PASS += 1; print(f"  PASS  {name}")
    else:  FAIL += 1; print(f"  FAIL  {name}   {detail}")

def iban(acct="0000001123456702", bank="SCBL"):
    rearr = bank + acct + "2720"            # PK -> 25 20 ; we compute check digits for 'PK00'
    rearr = bank + acct + "252000"
    num = int("".join(str(int(ch, 36)) for ch in rearr))
    cd = 98 - (num % 97)
    return f"PK{cd:02d}{bank}{acct}"

def signup(email=None):
    uid = uuid.uuid4(); a = admin(c)
    a.execute("INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES (%s,%s,%s)",
              (str(uid), email or f"{uid}@t.local", json.dumps({"full_name": "Test User"})))
    c.commit(); return uid

def fund(uid, amount):
    """Top-up helper that keeps the ledger consistent (income tx + balance)."""
    a = admin(c)
    a.execute("UPDATE public.wallets SET balance=balance+%s WHERE user_id=%s", (amount, str(uid)))
    a.execute("INSERT INTO public.transactions(user_id,amount,type,category,description,status,idempotency_key) VALUES (%s,%s,'income','Top-up','test','completed',%s)",
              (str(uid), amount, 'fund-' + uuid.uuid4().hex))
    c.commit()

def add_ben(uid, name="Ali Raza", acct="0000001123456702"):
    with as_user(c, uid) as cur:
        cur.execute("INSERT INTO public.beneficiaries(user_id,name,iban,bank) VALUES (%s,%s,%s,'SCB') RETURNING id", (str(uid), name, iban(acct)))
        return cur.fetchone()[0]

def rpc(uid, sql, args=(), aal='aal1', amr=None):
    with as_user(c, uid, aal=aal, amr=amr) as cur:
        cur.execute(sql, args); return cur.fetchone()[0]

def set_pin(uid, pin="482915", cur_pin=None):
    return rpc(uid, "SELECT set_transaction_pin(%s,%s)", (pin, cur_pin))

def xfer(uid, amount, ben, pin="482915", key=None, note=None, aal='aal1', amr=None):
    return rpc(uid, "SELECT execute_transfer(%s,%s,%s,%s,%s)",
               (amount, ben, note, key or uuid.uuid4().hex, pin), aal=aal, amr=amr)

def bal(uid): return balance(c, uid)
def drift(uid):
    a = admin(c); a.execute("SELECT drift FROM private.ledger_drift WHERE user_id=%s", (str(uid),)); c.commit(); return float(a.fetchone()[0])
def one(sql, args=()):
    a = admin(c); a.execute(sql, args); c.commit(); return a.fetchone()[0]

print(f"\n=== A. Previously exploitable holes ({db}) ===")
u = signup(); ben = add_ben(u); set_pin(u)
r = try_("", lambda: [cur.execute("INSERT INTO public.wallets(user_id,balance) VALUES (%s,9999999)", (str(u),)) for cur in [as_user(c,u).__enter__()]])
check("A1 client cannot insert a forged wallet", r[0]=="BLOCKED", r)
c.rollback()
b0 = bal(u); res = xfer(u, -40000, ben)
check("A2 negative amount rejected, balance untouched", res['success'] is False and res['code']=='invalid_amount' and bal(u)==b0, res)
def plant_otp():
    with as_user(c,u) as cur: cur.execute("INSERT INTO public.transfer_otps(user_id,otp_code,expires_at) VALUES (%s,'000000',now()+interval '5 min')",(str(u),))
check("A3 self-issued OTP impossible (table removed)", try_("",plant_otp)[0]=="BLOCKED"); c.rollback()
def legacy(): 
    with as_user(c,u) as cur: cur.execute("SELECT transfer_funds(100,1,'x')")
check("A4 legacy transfer_funds() is gone", try_("",legacy)[0]=="BLOCKED"); c.rollback()
check("A4b only ONE execute_transfer() exists (no legacy overload bypass)",
      one("SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='execute_transfer'")==1)
def forge():
    with as_user(c,u) as cur: cur.execute("INSERT INTO public.transactions(user_id,amount,type,category,description) VALUES (%s,250000,'income','Salary','forged')",(str(u),))
check("A5 client cannot forge transactions", try_("",forge)[0]=="BLOCKED"); c.rollback()
bad = xfer(u, 100, ben, pin="000111")
n = one("SELECT count(*) FROM public.audit_logs WHERE user_id=%s AND status='FAILED'", (str(u),))
check("A6 failed attempts ARE audited now", n >= 2, n)
res = xfer(u, 100, 987654321)
check("A7 unknown beneficiary rejected", res['code']=='invalid_beneficiary', res)
check("A8 anon cannot execute the RPCs", one("SELECT has_function_privilege('anon','execute_transfer(numeric,bigint,text,text,text)','EXECUTE')") is False)
def tamper_wallet():
    with as_user(c,u) as cur: cur.execute("UPDATE public.wallets SET balance=1e9 WHERE user_id=%s",(str(u),))
check("A9 client cannot UPDATE wallet", try_("",tamper_wallet)[0]=="BLOCKED"); c.rollback()
def read_pins():
    with as_user(c,u) as cur: cur.execute("SELECT pin_hash FROM public.transaction_pins")
check("A10 PIN hashes unreadable by clients", try_("",read_pins)[0]=="BLOCKED"); c.rollback()
other = signup(); other_ben = add_ben(other, "Other Guy")
res = xfer(u, 100, other_ben)
check("A11 cannot pay using someone else's beneficiary id", res['code']=='invalid_beneficiary', res)

print("\n=== B. Transfer happy path, ledger, idempotency ===")
u = signup(); ben = add_ben(u)
check("B0 signup trigger: wallet 50,000 + profile + bonus tx", bal(u)==50000 and one("SELECT count(*) FROM public.profiles WHERE id=%s",(str(u),))==1 and drift(u)==0)
res = xfer(u, 500, ben)
check("B1 PIN not set -> pin_not_set (no debit)", res['code']=='pin_not_set' and bal(u)==50000, res)
check("B2 weak PIN refused", set_pin(u,"123456")['code']=='pin_too_weak' and set_pin(u,"111111")['code']=='pin_too_weak')
check("B3 PIN set", set_pin(u)['success'] is True and rpc(u,"SELECT has_transaction_pin()") is True)
key = uuid.uuid4().hex
r1 = xfer(u, 500.25, ben, key=key, note="rent share")
check("B4 transfer succeeds, balance debited, reference issued", r1['success'] and bal(u)==49499.75 and r1['reference'].startswith('PW-'), r1)
r2 = xfer(u, 500.25, ben, key=key)
check("B5 same idempotency key replays (no 2nd debit, same tx id)", r2['success'] and r2['replayed'] and r2['transaction_id']==r1['transaction_id'] and bal(u)==49499.75, r2)
row = one("SELECT row_to_json(t) FROM (SELECT amount,type,note,balance_after,beneficiary_id FROM public.transactions WHERE id=%s) t",(r1['transaction_id'],))
check("B6 ledger row is signed negative, keeps note + balance_after", float(row['amount'])==-500.25 and row['type']=='transfer' and row['note']=='rent share' and float(row['balance_after'])==49499.75, row)
check("B7 notification created server-side", one("SELECT count(*) FROM public.notifications WHERE user_id=%s AND type='transfer'",(str(u),))==1)
check("B8 ledger drift == 0", drift(u)==0, drift(u))
check("B9 amounts with >2 decimals rejected", xfer(u, 10.123, ben)['code']=='invalid_amount')
check("B10 insufficient funds -> code, no debit", xfer(u, 49999, ben)['code']=='insufficient_funds' and bal(u)==49499.75)

print("\n=== C. PIN lockout (counters survive failed attempts) ===")
u = signup(); ben = add_ben(u); set_pin(u)
codes = [xfer(u, 100, ben, pin="999000") for _ in range(5)]
check("C1 attempts_left counts down 4,3,2,1 then locks", [x.get('attempts_left') for x in codes[:4]]==[4,3,2,1] and codes[4]['code']=='pin_locked', codes)
res = xfer(u, 100, ben)
check("C2 correct PIN refused while locked", res['code']=='pin_locked' and bal(u)==50000, res)
admin(c).execute("UPDATE public.transaction_pins SET locked_until = now() - interval '1 second' WHERE user_id=%s",(str(u),)); c.commit()
check("C3 works again after the lock expires", xfer(u, 100, ben)['success'] is True)
check("C4 changing PIN needs the current PIN", set_pin(u,"739204","000000")['code']=='wrong_pin' and set_pin(u,"739204","482915")['success'] is True)

print("\n=== D. Limits (per-transfer, daily in Asia/Karachi) ===")
u = signup(); ben = add_ben(u); set_pin(u); fund(u, 500000)
check("D1 per-transfer limit 50,000", xfer(u, 50000.01, ben)['code']=='per_tx_limit')
fresh = [{"method":"totp","timestamp":int(time.time())-5}]
for _ in range(2):
    r = xfer(u, 40000, ben, aal='aal2', amr=fresh); assert r['success'], r
res = xfer(u, 30000, ben, aal='aal2', amr=fresh)
check("D2 daily limit 100,000 enforced (80k used, 30k refused)", res['code']=='daily_limit' and res['used_today']==80000, res)
check("D3 under the cap still works", xfer(u, 20000, ben, aal='aal2', amr=fresh)['success'] is True)
check("D4 ledger drift == 0 after limits scenario", drift(u)==0)

print("\n=== E. MFA step-up (checked from the signed JWT) ===")
u = signup(); ben = add_ben(u); set_pin(u)
check("E1 <10,000 needs no MFA", xfer(u, 9999.99, ben)['success'] is True)
res = xfer(u, 10000, ben)
check("E2 >=10,000, no TOTP enrolled -> mfa_not_enrolled", res['code']=='mfa_not_enrolled', res)
admin(c).execute("INSERT INTO auth.mfa_factors(user_id,factor_type,status) VALUES (%s,'totp','verified')",(str(u),)); c.commit()
res = xfer(u, 10000, ben)
check("E3 enrolled but session is aal1 -> mfa_required", res['code']=='mfa_required', res)
stale = [{"method":"totp","timestamp":int(time.time())-3600}]
res = xfer(u, 10000, ben, aal='aal2', amr=stale)
check("E4 aal2 but TOTP is 1h old -> mfa_required (freshness)", res['code']=='mfa_required', res)
res = xfer(u, 10000, ben, aal='aal2', amr=fresh)
check("E5 fresh TOTP -> success", res['success'] is True, res)
check("E6 client cannot claim aal2 without a totp event", xfer(u, 10000, ben, aal='aal2', amr=[{"method":"password","timestamp":int(time.time())}])['code']=='mfa_required')
check("E7 PIN attempts untouched by MFA failures", one("SELECT failed_attempts FROM public.transaction_pins WHERE user_id=%s",(str(u),))==0)

print("\n=== F. Concurrency ===")
u = signup(); ben = add_ben(u); set_pin(u)   # 50,000 balance
fresh = [{"method":"totp","timestamp":int(time.time())}]
admin(c).execute("INSERT INTO auth.mfa_factors(user_id,factor_type,status) VALUES (%s,'totp','verified')",(str(u),)); c.commit()
results = []
def worker(amount, key):
    cc = conn(db)
    try:
        with as_user(cc, u, aal='aal2', amr=fresh) as cur:
            cur.execute("SELECT execute_transfer(%s,%s,NULL,%s,'482915')", (amount, ben, key)); results.append(cur.fetchone()[0])
    finally: cc.close()
ts = [threading.Thread(target=worker, args=(30000, uuid.uuid4().hex)) for _ in range(2)]
[t.start() for t in ts]; [t.join() for t in ts]
ok = [r for r in results if r['success']]
check("F1 two parallel 30,000 transfers on a 50,000 wallet: exactly one succeeds", len(ok)==1 and bal(u)==20000, results)
u2 = signup(); ben2 = add_ben(u2); set_pin(u2); results.clear(); k = uuid.uuid4().hex
def worker2():
    cc = conn(db)
    try:
        with as_user(cc, u2) as cur:
            cur.execute("SELECT execute_transfer(100,%s,NULL,%s,'482915')", (ben2, k)); results.append(cur.fetchone()[0])
    finally: cc.close()
ts = [threading.Thread(target=worker2) for _ in range(6)]
[t.start() for t in ts]; [t.join() for t in ts]
check("F2 six parallel requests with ONE idempotency key: debited once, all succeed", bal(u2)==49900 and all(r['success'] for r in results) and sum(1 for r in results if not r['replayed'])==1, results)
check("F3 ledger drift == 0 after concurrency", drift(u)==0 and drift(u2)==0)

print("\n=== G. Savings goals ===")
u = signup()
with as_user(c,u) as cur:
    cur.execute("INSERT INTO public.savings_goals(user_id,name,target_amount,color) VALUES (%s,'Umrah',20000,'#f50') RETURNING id",(str(u),)); gid = cur.fetchone()[0]
def forge_goal():
    with as_user(c,u) as cur: cur.execute("UPDATE public.savings_goals SET current_amount=20000 WHERE id=%s",(str(gid),))
check("G0 client cannot edit goal money directly", try_("",forge_goal)[0]=="BLOCKED"); c.rollback()
k = uuid.uuid4().hex
r1 = rpc(u,"SELECT contribute_to_goal(%s,5000,%s)",(str(gid),k)); r2 = rpc(u,"SELECT contribute_to_goal(%s,5000,%s)",(str(gid),k))
check("G1 contribute + idempotent replay (one debit)", r1['success'] and r2['replayed'] and bal(u)==45000, (r1,r2))
check("G2 cannot exceed target", rpc(u,"SELECT contribute_to_goal(%s,16000,%s)",(str(gid),uuid.uuid4().hex))['code']=='exceeds_target')
check("G3 cannot withdraw more than saved", rpc(u,"SELECT withdraw_from_goal(%s,5000.01,%s)",(str(gid),uuid.uuid4().hex))['code']=='insufficient_goal_funds')
check("G4 negative contribution rejected", rpc(u,"SELECT contribute_to_goal(%s,-5,%s)",(str(gid),uuid.uuid4().hex))['code']=='invalid_amount')
w = rpc(u,"SELECT withdraw_from_goal(%s,2000,%s)",(str(gid),uuid.uuid4().hex))
check("G5 withdraw returns money to wallet", w['success'] and bal(u)==47000 and float(w['new_goal_amount'])==3000, w)
check("G6 ledger drift == 0", drift(u)==0)
stranger = signup()
check("G7 cannot touch another user's goal", rpc(stranger,"SELECT contribute_to_goal(%s,10,%s)",(str(gid),uuid.uuid4().hex))['code']=='goal_not_found')

print("\n=== H. Data rules ===")
u = signup()
def bad_iban():
    with as_user(c,u) as cur:
        good = iban(); bad = good[:-1] + str((int(good[-1])+1)%10)
        cur.execute("INSERT INTO public.beneficiaries(user_id,name,iban,bank) VALUES (%s,'X',%s,'B')",(str(u),bad))
check("H1 IBAN with a wrong check digit rejected", try_("",bad_iban)[0]=="BLOCKED"); c.rollback()
check("H2 known-good IBAN PK36SCBL0000001123456702 accepted", one("SELECT public.is_valid_pk_iban('PK36SCBL0000001123456702')") is True)
def dupe():
    add_ben(u,"A"); add_ben(u,"B")
check("H3 duplicate beneficiary (same IBAN) rejected", try_("",dupe)[0]=="BLOCKED"); c.rollback()
with as_user(c,u) as cur:
    cur.execute("UPDATE public.notifications SET is_read=true WHERE user_id=%s",(str(u),))
check("H4 client can mark notifications read", True)
def edit_notif():
    with as_user(c,u) as cur: cur.execute("UPDATE public.notifications SET title='hacked' WHERE user_id=%s",(str(u),))
check("H5 client cannot edit notification text", try_("",edit_notif)[0]=="BLOCKED"); c.rollback()
def ins_notif():
    with as_user(c,u) as cur: cur.execute("INSERT INTO public.notifications(user_id,title,message) VALUES (%s,'x','y')",(str(u),))
check("H6 client cannot create notifications", try_("",ins_notif)[0]=="BLOCKED"); c.rollback()
with as_user(c,u) as cur:
    cur.execute("UPDATE public.profiles SET full_name='Sana H.' WHERE id=%s",(str(u),))
check("H7 profile name editable", one("SELECT full_name FROM public.profiles WHERE id=%s",(str(u),))=="Sana H.")
def edit_email():
    with as_user(c,u) as cur: cur.execute("UPDATE public.profiles SET email='x@y.z' WHERE id=%s",(str(u),))
check("H8 profile email not client-editable", try_("",edit_email)[0]=="BLOCKED"); c.rollback()
a = signup(); b = signup()
with as_user(c,a) as cur:
    cur.execute("SELECT count(*) FROM public.transactions WHERE user_id=%s",(str(b),)); seen = cur.fetchone()[0]
check("H9 RLS: user A sees 0 of user B's transactions", seen==0)
n_bad = one("SELECT count(*) FROM private.ledger_drift WHERE drift <> 0 AND user_id IN (SELECT id FROM auth.users WHERE email LIKE '%%@t.local')")
check("H10 global ledger drift across every test user == 0", n_bad==0, n_bad)


print("\n=== I. Dashboard insights (real data, not hard-coded) ===")
u = signup(); ben = add_ben(u); set_pin(u)
ins0 = rpc(u, "SELECT get_insights(6)")
check("I1 new user: 6 months returned, current month has the welcome bonus", len(ins0['cashflow'])==6 and float(ins0['cashflow'][-1]['income'])==50000 and all(float(m['income'])==0 for m in ins0['cashflow'][:-1]), ins0['cashflow'])
xfer(u, 1500, ben); xfer(u, 2500.50, ben)
with as_user(c,u) as cur:
    cur.execute("INSERT INTO public.savings_goals(user_id,name,target_amount) VALUES (%s,'G',9000) RETURNING id",(str(u),)); gid=cur.fetchone()[0]
rpc(u,"SELECT contribute_to_goal(%s,1000,%s)",(str(gid),uuid.uuid4().hex))
ins = rpc(u, "SELECT get_insights(6)")
cur_m = ins['cashflow'][-1]
check("I2 expenses = transfers + savings contributions (5,000.50)", float(cur_m['expenses'])==5000.50 and float(cur_m['income'])==50000, cur_m)
check("I3 closing balance of current month == wallet balance", float(cur_m['closing_balance'])==bal(u)==float(ins['balance']), (cur_m, bal(u)))
cats = {x['category']: float(x['amount']) for x in ins['categories']}
check("I4 categories split Transfer vs Savings", cats.get('Transfer')==4000.50 and cats.get('Savings')==1000.0, cats)
check("I5 savings_rate = (income-expenses)/income", float(ins['totals']['savings_rate'])==round((50000-5000.50)/50000*100,1), ins['totals'])
# back-dated history: closing balances must walk backwards correctly
admin(c).execute("INSERT INTO public.transactions(user_id,amount,type,category,description,status,created_at) VALUES (%s,-700,'expense','Food','old','completed', now() - interval '65 days')",(str(u),)); c.commit()
ins = rpc(u, "SELECT get_insights(6)")
older = [m for m in ins['cashflow'] if float(m['expenses'])==700]
check("I6 back-dated expense lands in an older month", len(older)==1 and older[0]['month'] != cur_m['month'], ins['cashflow'])
def anon_insights():
    a = admin(c); a.execute("SET LOCAL ROLE anon"); a.execute("SELECT get_insights(6)")
check("I7 anon cannot call get_insights", try_("",anon_insights)[0]=="BLOCKED"); c.rollback()
other = signup()
check("I8 another user's insights are independent", float(rpc(other,"SELECT get_insights(6)")['totals']['expenses'])==0)


print("\n=== J. Guest (anonymous) sessions ===")
gid = uuid.uuid4(); a = admin(c)
a.execute("INSERT INTO auth.users(id,email,is_anonymous,raw_user_meta_data) VALUES (%s,NULL,true,%s)", (str(gid), json.dumps({"full_name":"Demo Guest"}))); c.commit()
check("J1 anonymous signup (NULL email) gets profile + wallet 50,000 + bonus tx", bal(gid)==50000 and one("SELECT full_name FROM public.profiles WHERE id=%s",(str(gid),))=="Demo Guest" and drift(gid)==0)
gben = add_ben(gid, "Guest Payee"); set_pin(gid)
check("J2 a guest can complete a transfer", xfer(gid, 250, gben)['success'] is True)
old = uuid.uuid4(); a = admin(c)
a.execute("INSERT INTO auth.users(id,email,is_anonymous,created_at) VALUES (%s,NULL,true, now() - interval '10 days')", (str(old),))
perm = signup(); a = admin(c)
a.execute("UPDATE auth.users SET created_at = now() - interval '30 days' WHERE id=%s", (str(perm),)); c.commit()
n = one("SELECT private.purge_stale_anonymous_users(7)")
check("J3 purge removes only OLD anonymous users", n>=1 and one("SELECT count(*) FROM auth.users WHERE id=%s",(str(old),))==0 and one("SELECT count(*) FROM auth.users WHERE id=%s",(str(gid),))==1 and one("SELECT count(*) FROM auth.users WHERE id=%s",(str(perm),))==1, n)
check("J4 purge cascades: no wallet/transactions left for the deleted guest", one("SELECT count(*) FROM public.wallets WHERE user_id=%s",(str(old),))==0 and one("SELECT count(*) FROM public.transactions WHERE user_id=%s",(str(old),))==0)
def call_purge():
    with as_user(c,gid) as cur: cur.execute("SELECT private.purge_stale_anonymous_users(1)")
check("J5 clients cannot call the purge function", try_("",call_purge)[0]=="BLOCKED"); c.rollback()

print(f"\n{'='*60}\n RESULT on {db}: {PASS} passed, {FAIL} failed\n{'='*60}")
sys.exit(1 if FAIL else 0)
