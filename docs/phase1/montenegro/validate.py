#!/usr/bin/env python3
from pathlib import Path
import json, hashlib, sys
from collections import Counter, defaultdict
ROOT=Path(__file__).resolve().parent
def j(rel): return json.loads((ROOT/rel).read_text(encoding="utf-8"))
def jl(rel): return [json.loads(x) for x in (ROOT/rel).read_text(encoding="utf-8").splitlines() if x.strip()]
errors=[]; checks=[]
def ck(cond,name,detail=""):
    checks.append({"check":name,"pass":bool(cond),"detail":detail})
    if not cond: errors.append(f"{name}: {detail}")
cols=j("contracts/columns.json")
ck(len(cols)==20,"contract_table_count",str(len(cols)))
ck(sum(len(v) for v in cols.values())==223,"contract_column_count",str(sum(len(v) for v in cols.values())))
off=jl("data/office-register.jsonl"); tiers=jl("data/draft-tiers.jsonl"); ev=jl("data/events.jsonl"); res=jl("data/results.jsonl")
gaps=j("data/research-gaps.json"); approval=j("data/approval-state.json"); relations=j("data/transition-relations.json")
cur=[o for o in off if o["status"]=="current"]; hist=[o for o in off if o["status"]=="historical_only"]
ck(len(off)==29,"office_count"); ck(len(cur)==27,"current_count"); ck(len(hist)==2,"historical_count")
ck(sum(o["tier_scope"]=="local" and o["status"]=="current" for o in off)==25,"current_local_count")
ck(sum(bool(o["direct_executive"]) for o in cur)==1,"direct_exec_count")
ck(sum(bool(o["direct_executive"]) for o in cur if o["tier_scope"]=="local")==0,"no_direct_local_exec")
ck(next(o for o in cur if o["direct_executive"])["office_id"]=="ME-NAT-PRESIDENT","president_only_direct_exec")
ck(len(tiers)==len(off) and {t["office_id"] for t in tiers}=={o["office_id"] for o in off},"tiers_1_to_1")
ck(Counter(t["tier"] for t in tiers)==Counter({"municipal":27,"national":2}),"tier_histogram")
ck(all(t["review_status"]=="draft_for_human_review" and t["justin_approved"] is False for t in tiers),"tiers_unapproved")
names=" ".join((o["name"]+" "+o["office_type"]) for o in off).lower()
ck("european parliament" not in names and "ep delegation" not in names,"zero_ep_offices")
ck(not any("mayor" in o["office_type"].lower() or "gradonačelnik" in o["name"].lower() for o in off),"no_mayor_rows")
ck(len(ev)==71,"event_count"); ck(sum(e["office_id"]=="ME-NAT-PARLIAMENT" for e in ev)==6,"parliament_events")
ck(sum(e["office_id"]=="ME-NAT-PRESIDENT" for e in ev)==5,"presidential_events")
ck(sum(e["event_kind"] in ("local_assembly","historical_nested_local_assembly") for e in ev)==60,"local_events")
for o in [x for x in cur if x["tier_scope"]=="local"]:
    ck(any(e["office_id"]==o["office_id"] for e in ev),f"history_{o['office_id']}")
bud=sorted(e["date_label"] for e in ev if e["office_id"]=="ME-LOC-BUDVA-ASM" and e["date_label"].startswith("2024"))
ck(bud==["2024-05-26","2024-11-17"],"budva_two_2024_events",repr(bud))
pr23=sorted((e["round"],e["date_label"]) for e in ev if e["office_id"]=="ME-NAT-PRESIDENT" and e["date_label"].startswith("2023"))
ck(pr23==[(1,"2023-03-19"),(2,"2023-04-02")],"president_2023_rounds")
sav=[e for e in ev if e["office_id"]=="ME-LOC-SAVNIK-ASM" and e["date_label"].startswith("2022")]
ck(len(sav)==1 and sav[0]["legal_outcome"]=="unresolved_incomplete","savnik_unresolved")
ck(len(res)==153,"result_count")
by=defaultdict(list)
for r in res: by[r["event_id"]].append(r)
ck(all(e["event_id"] in by for e in ev),"every_event_result_state")
for r in res:
    if r["votes_status"]!="reported": ck(r["votes"] is None,f"votes_null_{r['result_id']}")
    if r["seats_status"]!="reported": ck(r["seats"] is None,f"seats_null_{r['result_id']}")
def eid(oid,date): return next(e["event_id"] for e in ev if e["office_id"]==oid and e["date_label"]==date)
valid={
eid("ME-NAT-PARLIAMENT","2009-03-29"):323992,eid("ME-NAT-PARLIAMENT","2012-10-14"):356950,
eid("ME-NAT-PARLIAMENT","2020-08-30"):409393,eid("ME-NAT-PARLIAMENT","2023-06-11"):302436,
eid("ME-NAT-PRESIDENT","2008-04-06"):329781,eid("ME-NAT-PRESIDENT","2013-04-07"):316229,
eid("ME-NAT-PRESIDENT","2018-04-15"):334462,eid("ME-NAT-PRESIDENT","2023-03-19"):338411,
eid("ME-NAT-PRESIDENT","2023-04-02"):376361}
for x,total in valid.items():
    ck(sum(r["votes"] for r in by[x] if r["votes"] is not None)==total,f"vote_sum_{x}")
e06=eid("ME-NAT-PARLIAMENT","2006-09-10")
ck(sum(r["votes"] for r in by[e06] if r["votes"] is not None)==338833,"parl_2006_list_sum")
ck(next(e for e in ev if e["event_id"]==e06)["valid_ballots"]==338835,"parl_2006_source_valid")
ck(any(g["gap_id"]=="ME-AY-G11" for g in gaps),"parl_2006_gap")
for d in ["2006-09-10","2009-03-29","2012-10-14","2020-08-30","2023-06-11"]:
    x=eid("ME-NAT-PARLIAMENT",d)
    ck(sum(r["seats"] for r in by[x] if r["seats"] is not None)==81,f"seat_sum_{d}")
z=eid("ME-LOC-ZABLJAK-ASM","2018-05-27")
num=[r for r in by[z] if r["votes"] is not None]
ck(sum(r["votes"] for r in num)==2334,"zabljak_votes"); ck(sum(r["seats"] for r in num)==31,"zabljak_seats")
ck(all(x.get("successor_office_id") is None for x in relations),"no_successor_links")
ck(not any(e["office_id"].startswith("ME-NAT-") and int(e["date_label"][:4])<2006 for e in ev),"no_pre2006_national")
ck(approval["applied_changes"]==0,"applied_changes_zero")
ck(all(v is False for v in approval["justin_approvals"].values()),"approvals_unchecked")
for s in j("data/source-inventory.json"):
    p=ROOT/s["input_path"]; ck(hashlib.sha256(p.read_bytes()).hexdigest()==s["sha256"],f"source_hash_{s['source_id']}")
m=ROOT/"SHA256SUMS"
if m.exists():
    for line in m.read_text(encoding="utf-8").splitlines():
        if not line.strip(): continue
        digest,rel=line.split("  ",1); p=ROOT/rel
        ck(p.exists(),f"manifest_exists_{rel}")
        if p.exists(): ck(hashlib.sha256(p.read_bytes()).hexdigest()==digest,f"manifest_hash_{rel}")
report={"status":"PASS" if not errors else "FAIL","applied_changes":0,"research_coverage_complete":False,
        "counts":{"offices":len(off),"current":len(cur),"historical_only":len(hist),"events":len(ev),"results":len(res),
                  "tables":len(cols),"columns":sum(len(v) for v in cols.values())},
        "checks":checks,"errors":errors}
(ROOT/"validation-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
print(json.dumps({"status":report["status"],"errors":errors,"counts":report["counts"]},ensure_ascii=False))
sys.exit(0 if not errors else 1)
