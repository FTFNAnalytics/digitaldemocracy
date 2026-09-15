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
    assert manifest["country_code"] == "AL" and not manifest["coverage_complete"]
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
                assert values.get("Country", "Albania") == "Albania"
                assert values.get("Country or territory", "Albania") == "Albania"
                tables[table["sheet"]].append(values)
            row_numbers[table["sheet"]].extend(table["source_rows"])
    for name, rows in tables.items():
        assert len(rows) == manifest["table_row_counts"][name], name
        assert len(row_numbers[name]) == len(set(row_numbers[name])), name
    offices = tables["Office register"]
    ids = {o["Office ID"] for o in offices}
    assert len(ids) == len(offices) == 122
    assert len({o["Jurisdiction"] for o in offices}) == 61
    assert collections.Counter(o["Office"] for o in offices) == {"Mayor": 61, "Municipal council": 61}
    for office in offices:
        assert office["Office ID"].startswith("AL-")
        assert office["History entries"] == 3
        assert office["Next polling date"] is None
        assert office["Competition score"] is None and office["Mean Pedersen pp"] is None
        assert (ROOT / "briefings" / (office["Office ID"] + ".html")).is_file()
    assert len(list((ROOT / "briefings").glob("*.html"))) == 122
    histories = tables["History index"]
    assert len(histories) == 366
    assert collections.Counter(h["Office ID"] for h in histories) == {i: 3 for i in ids}
    key = lambda r: (r["Office ID"], r["Ballot date if recorded"], r["Year"])
    history_keys = {key(h) for h in histories}
    assert len(history_keys) == 366
    sources = json.loads((ROOT / "source-links.json").read_text())
    source_urls = set(sources["registered_source_urls"] + sources["urls_without_master_source_row"])
    for h in histories:
        assert h["Source URL"] in source_urls and h["Coverage"] and h["Comparability status"]
    results = tables["Detailed returns"]
    assert len(results) == 3843
    for row in results:
        assert row["Office ID"] in ids and key(row) in history_keys
        assert row["Source URL"] in source_urls
        for field in ("Votes or marks", "Seats"):
            value = row[field]
            assert value is None or isinstance(value, int) and value >= 0
        share = row["Share on stated basis"]
        assert share is None or isinstance(share, (int, float)) and 0 <= share <= 100
    assert {key(r) for r in results} == history_keys
    assert len(tables["Governing control"]) == 45
    assert all(r["Office ID"] in ids and r["Evidence limits"] for r in tables["Governing control"])
    assert len(tables["Election calendar"]) == len(tables["Polling evidence"]) == 1
    assert tables["Election calendar"][0]["First or scheduled date"] is None
    assert len({r["Source ID"] for r in tables["Sources"]}) == 182
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
    print("PASS: 122 offices, 366 selected histories, 3,843 result rows, 45 control observations, 182 source rows and 122 briefings.")
    print("PASS: extracted history equals independent CSV; all content checksums match." + (" Original archive and briefings verified." if archive else ""))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
