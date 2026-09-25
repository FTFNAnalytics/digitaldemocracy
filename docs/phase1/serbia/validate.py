#!/usr/bin/env python3
from pathlib import Path
import json, hashlib, sys
from collections import Counter, defaultdict
R=Path(__file__).resolve().parent
def jl(p): return [json.loads(x) for x in (R/p).read_text(encoding="utf-8").splitlines() if x.strip()]
def js(p): return json.loads((R/p).read_text(encoding="utf-8"))
def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for b in iter(lambda:f.read(1048576),b""): h.update(b)
    return h.hexdigest()
err=[]
def ck(v,m):
    if not v: err.append(m)

o=jl("data/office-register.jsonl")
t=jl("data/draft-tiers.jsonl")
e=jl("data/events.jsonl")
r=jl("data/results.jsonl")
d=jl("data/research-dates.jsonl")
cw=js("data/successor-crosswalk.json")
g=js("data/research-gaps.json")
c=js("contracts/columns.json")

ck(len(c)==20 and sum(map(len,c.values()))==223,"20-table/223-column contract")
ck(len(o)==178,"office rows=178")
ck(sum(x["status"]=="current" for x in o)==173,"current offices=173")
ck(sum(x["status"]=="historical_only" for x in o)==5,"historical-only offices=5")
ck(sum(x["status"]=="current" and x["scope"]=="national" for x in o)==2,"national current=2")
ck(sum(x["status"]=="current" and x["scope"]=="provincial" for x in o)==1,"provincial current=1")
ck(sum(x["status"]=="current" and x["scope"] in ("local","city_municipality") for x in o)==170,"current local=170")
ck(sum(x["status"]=="current" and x.get("direct_executive") for x in o)==1,"one current direct executive")
ck(not any(x["status"]=="current" and x["scope"] in ("local","city_municipality") and x.get("direct_executive") for x in o),"zero direct local executives")
ck(not any("european parliament" in x["name"].lower() for x in o),"zero EP offices")
ck(not any("kosovo" in x["name"].lower() or "metohija" in x["name"].lower() for x in o),"Kosovo-gated rows absent")
ck(len(t)==len(o) and {x["office_id"] for x in t}=={x["office_id"] for x in o},"tiers exact 1:1")
ck(Counter(x["tier"] for x in t)==Counter({"municipal":175,"national":2,"regional":1}),"tier histogram")
ck(all(x["review_status"]=="draft_for_human_review" and x["justin_approved"] is False for x in t),"all tiers remain unapproved")
ck(len(cw)==5,"five status-change crosswalk rows")
ck(all(x["relationship"]=="same_territory_status_change" and x["boundary_change_claim"] is False for x in cw),"crosswalks are sourced status changes, not merger edges")
ck({x["predecessor_office_id"] for x in cw}=={"RS-HIST-MUN-VRSAC","RS-HIST-MUN-KIKINDA","RS-HIST-MUN-PIROT","RS-HIST-MUN-BOR","RS-HIST-MUN-PROKUPLJE"},"historical predecessor set")
ck(len(e)==531,"events=531")
ck(len(r)==671,"results=671")
by=defaultdict(list)
for x in r: by[x["event_id"]].append(x)
ck(all(x["event_id"] in by for x in e),"every event has a result record")
ck(len(by["RS-NAT-ASSEMBLY-2016"])==20,"2016 National Assembly vector=20")
ck(sum(x["office_id"]=="RS-NAT-ASSEMBLY" for x in e)==4,"four National Assembly events")
ck(sum(x["office_id"]=="RS-NAT-PRESIDENT" for x in e)==4,"four presidential events")
ck(sum(x["office_id"]=="RS-VOJ-ASSEMBLY" for x in e)==3,"three Vojvodina events")
ck(sum(x.get("date")=="2026-03-29" for x in e)==10,"ten exact-date 29 March 2026 local events")
ck(sum(x.get("result_kind")=="event_result_state" for x in r)==520,"520 local result-state rows")
ck(all(x["votes"] is None and x["share"] is None and x["seats"] is None for x in r if x.get("result_kind")=="event_result_state"),"untranscribed local numeric values stay NULL")
ck(any(x["gap_id"]=="RS-AX-G01" and x["status"]=="open" for x in g),"local numeric-vector hold stays open")
ck(any(x["gap_id"]=="RS-AX-G05" and x["status"]=="scope_gate" for x in g),"Kosovo scope gate retained")
report=(R/"JUSTIN_REPORT.md").read_text(encoding="utf-8")
ck("[x]" not in report.lower(),"Justin approvals must remain unchecked")
ck("applied_changes=0" in report,"applied_changes=0 required")
inv=js("data/source-inventory.json")
for s in inv:
    p=R/s["input_path"]
    ck(p.exists(),f"missing retained source {s['input_path']}")
    if p.exists(): ck(sha(p)==s["sha256"],f"retained source hash mismatch {s['input_path']}")
mf=R/"SHA256SUMS"
if mf.exists():
    for line in mf.read_text(encoding="utf-8").splitlines():
        if not line.strip(): continue
        hh,rel=line.split("  ",1)
        p=R/rel
        ck(p.exists(),f"manifest path missing {rel}")
        if p.exists(): ck(sha(p)==hh,f"manifest hash mismatch {rel}")
out={"status":"PASS" if not err else "FAIL","errors":err,
     "validated_counts":{"offices":len(o),"events":len(e),"results":len(r),"tables":len(c),"columns":sum(map(len,c.values()))}}
print(json.dumps(out,ensure_ascii=False,indent=2))
sys.exit(0 if not err else 1)
