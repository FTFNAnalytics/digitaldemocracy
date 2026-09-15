"""Validate this frozen extract; optionally verify original archive bytes."""
import collections
import hashlib
import json
import math
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parent


def main(archive=None):
    manifest = json.loads((ROOT / "manifest.json").read_text())
    assert manifest["country_code"] == "AD" and not manifest["coverage_complete"]
    assert manifest["site_ingestion_status"] == "pending_adapter"
    tables = collections.defaultdict(list)
    row_numbers = collections.defaultdict(list)
    for name, expected in manifest["files"].items():
        raw = (ROOT / name).read_bytes()
        assert len(raw) == expected["bytes"] and hashlib.sha256(raw).hexdigest() == expected["sha256"], name
        if name.startswith("tables/"):
            table = json.loads(raw)
            assert len(table["columns"]) == len(set(table["columns"]))
            assert len(table["source_rows"]) == len(table["rows"])
            for row in table["rows"]:
                assert len(row) == len(table["columns"])
                values = dict(zip(table["columns"], row))
                assert values.get("Country", "Andorra") == "Andorra"
                assert values.get("Country or territory", "Andorra") == "Andorra"
                tables[table["sheet"]].append(values)
            row_numbers[table["sheet"]].extend(table["source_rows"])
    for name, rows in tables.items():
        assert len(rows) == manifest["table_row_counts"][name], name
        assert len(row_numbers[name]) == len(set(row_numbers[name])), name
    offices = tables["Office register"]
    ids = {o["Office ID"] for o in offices}
    assert len(ids) == len(offices) == 7
    for office in offices:
        assert office["Office ID"].startswith("AD-")
        assert office["History entries"] == 3
        assert office["Mean Pedersen pp"] is None
        gaps = [office[c] for c in ("Latest eligible gap pp", "Middle gap pp", "Oldest gap pp")]
        if all(isinstance(g, (int, float)) for g in gaps):
            weighted = sum(g * w for g, w in zip(gaps, (0.6, 0.3, 0.1)))
            assert math.isclose(office["Weighted gap pp"], weighted, abs_tol=1e-10)
            assert math.isclose(office["Competition score"], max(0, 100 * (1 - weighted / 20)), abs_tol=1e-10)
        else:
            assert office["Weighted gap pp"] is None and office["Competition score"] is None
        assert (ROOT / "briefings" / (office["Office ID"] + ".html")).is_file()
    assert len(list((ROOT / "briefings").glob("*.html"))) == 7
    histories = tables["History index"]
    assert len(histories) == 21
    assert collections.Counter(h["Office ID"] for h in histories) == {i: 3 for i in ids}
    key = lambda r: (r["Office ID"], r["Ballot date if recorded"], r["Year"])
    history_keys = {key(h) for h in histories}
    assert len(history_keys) == 21
    sources = json.loads((ROOT / "source-links.json").read_text())
    source_urls = set(sources["registered_source_urls"] + sources["urls_without_master_source_row"])
    for h in histories:
        assert h["Source URL"] in source_urls and h["Coverage"] and h["Comparability status"]
    results = tables["Detailed returns"]
    assert len(results) == 53
    for row in results:
        assert row["Office ID"] in ids and key(row) in history_keys
        assert row["Source URL"] in source_urls
        for field in ("Votes or marks", "Seats"):
            value = row[field]
            assert value is None or isinstance(value, int) and value >= 0
        share = row["Share on stated basis"]
        assert share is None or isinstance(share, (int, float)) and 0 <= share <= 100
    assert {key(r) for r in results} == history_keys
    assert len(tables.get("Governing control", [])) == 7
    assert all(r["Office ID"] in ids and r["Evidence limits"] for r in tables.get("Governing control", []))
    assert len(tables["Election calendar"]) == 1
    assert len(tables.get("Polling evidence", [])) == 1
    assert sum(o["Competition score"] is not None for o in offices) == 5
    assert len({r["Source ID"] for r in tables["Sources"]}) == 10
    assert all(o["Next polling date"] is None for o in offices)
    crosscheck = json.loads((ROOT / "history-index-crosscheck.json").read_text())
    crosscheck = [dict(zip(crosscheck["columns"], r)) for r in crosscheck["rows"]]
    assert len(crosscheck) == len(histories)
    for original, extracted in zip(crosscheck, histories):
        assert original.keys() == extracted.keys()
        for column, value in extracted.items():
            if isinstance(value, (int, float)):
                assert math.isclose(float(original[column]), value, rel_tol=1e-12, abs_tol=1e-12), column
            else:
                assert original[column] == ("" if value is None else value), column
    if archive:
        path = Path(archive)
        assert path.stat().st_size == manifest["archive"]["bytes"]
        assert hashlib.sha256(path.read_bytes()).hexdigest() == manifest["archive"]["sha256"]
        with zipfile.ZipFile(path) as z:
            for name, expected in manifest["source_inputs"].items():
                raw = z.read(name)
                assert len(raw) == expected["bytes"] and hashlib.sha256(raw).hexdigest() == expected["sha256"], name
            for name, expected in manifest["files"].items():
                if "source_entry" in expected:
                    assert z.read(expected["source_entry"]) == (ROOT / name).read_bytes(), name
    print("PASS: 7 offices, 21 selected histories, 53 result rows, 7 control observations, 10 source rows and 7 briefings.")
    print("PASS: extracted history equals independent CSV; all content checksums match." + (" Original archive and briefings verified." if archive else ""))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
