#!/usr/bin/env python3
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

R = Path(__file__).resolve().parent
SLIM_ROOT = R.parents[2]

def read_json(rel):
    return json.loads((R / rel).read_text(encoding="utf-8"))

def read_jsonl(rel):
    return [json.loads(line) for line in (R / rel).read_text(encoding="utf-8").splitlines() if line.strip()]

def fail(message):
    print("FAIL:", message)
    sys.exit(1)

cols = read_json("contract/columns.json")
offices = read_jsonl("data/office-register.jsonl")
tiers = read_jsonl("data/draft-tiers.jsonl")
counts = read_json("data/counts.json")
metadata = read_json("metadata.json")
gaps = read_json("data/research-gaps.json")
transitions = read_json("data/historical-office-transitions.json")
prompt_o = read_json("data/prompt-o-detailed-results-reference.json")

if len(cols) != 20 or sum(len(v) for v in cols.values()) != 223:
    fail("contract must be 20 tables / 223 columns")
if len(offices) != 346 or sum(x.get("office_status") == "current" for x in offices) != 306 or sum(x.get("office_status") == "historical_only" for x in offices) != 40:
    fail("office counts")
if len(tiers) != 346 or {x["office_id"] for x in tiers} != {x["office_id"] for x in offices}:
    fail("tiers not 1:1")
if Counter(x["tier"] for x in tiers) != Counter({"municipal": 327, "regional": 15, "national": 4}):
    fail("tier histogram")
if any(x.get("justin_approved") for x in offices + tiers):
    fail("Justin approval set true")
if any("European Parliament" in x.get("name", "") or x.get("office_type") == "european_parliament" for x in offices):
    fail("EP office found")
if len(transitions) != 20 or any(x.get("successor_edge_asserted") for x in transitions):
    fail("historical transitions must be 20 with no asserted successor edges")
if prompt_o.get("prior_detailed_result_rows") != 749 or prompt_o.get("prior_historical_events") != 39 or prompt_o.get("prior_offices") != 13:
    fail("Prompt O continuity counts")
if prompt_o.get("identity_vector_git_blob_sha") != "5228f504e759b24e5b6fe36a1ad56db5b0874f29":
    fail("Prompt O vector blob pin")
if not any(g.get("gap_id") == "BA-AW-G09" and g.get("status") == "source_discrepancy" for g in gaps):
    fail("2024 mayor discrepancy missing")
if metadata.get("applied_changes") != 0 or any(metadata.get("approval", {}).values()):
    fail("approval/applied_changes guard")
if metadata.get("research_coverage_complete") is not False:
    fail("research_coverage_complete must remain false")
if (R / "data/events.jsonl").exists() or (R / "data/results.jsonl").exists() or (R / "sources").exists():
    fail("omitted bulky paths present")
# Pack checksum list excludes itself and the generated validation report.
for line in (R / "SHA256SUMS").read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    expected, rel = line.split("  ", 1)
    fp = SLIM_ROOT / rel
    if not fp.exists():
        fail("missing hashed file " + rel)
    if hashlib.sha256(fp.read_bytes()).hexdigest() != expected:
        fail("hash mismatch " + rel)
print(json.dumps({"status": "PASS", "tables": 20, "columns": 223, "offices": len(offices), "events": counts["events"], "results": counts["results"], "events_results_omitted": True, "checksums": sum(bool(x.strip()) for x in (R / "SHA256SUMS").read_text(encoding="utf-8").splitlines())}, indent=2))
