"""Extract Albania from the preserved Europe ZIP; no third-party packages.

Usage: python data/countries/albania/extract.py /path/to/Europe_...zip
Writes only this country folder's generated files. Does not alter the workbook.
"""
import csv
import datetime as dt
import hashlib
import html
import io
import json
from pathlib import Path
import posixpath
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parent
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
PREFIX = "Europe_Excluding_Russia/"
BOOK = PREFIX + "Europe_Excluding_Russia.xlsx"
DATE_COLUMNS = {"Next polling date", "First or scheduled date", "End or runoff date",
                "Publication date", "Fieldwork start", "Fieldwork end",
                "Ballot date if recorded", "Source date", "Accessed", "Ballot date"}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def colindex(ref):
    result = 0
    for letter in re.match(r"[A-Z]+", ref).group():
        result = result * 26 + ord(letter) - 64
    return result - 1


def workbook_rows(raw):
    with zipfile.ZipFile(io.BytesIO(raw)) as book:
        shared = []
        if "xl/sharedStrings.xml" in book.namelist():
            shared = ["".join(x.itertext()) for x in ET.fromstring(book.read("xl/sharedStrings.xml"))]
        rels = {x.get("Id"): x.get("Target") for x in ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))}
        workbook = ET.fromstring(book.read("xl/workbook.xml"))
        props = workbook.find("m:workbookPr", NS)
        assert props is None or props.get("date1904") not in ("1", "true"), "Unexpected date epoch"
        for sheet in workbook.find("m:sheets", NS):
            rel = sheet.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = rels[rel]
            target = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
            header = None
            for _, element in ET.iterparse(book.open(target), events=("end",)):
                if element.tag != "{" + NS["m"] + "}row":
                    continue
                values, formulas = {}, {}
                for cell in element:
                    index = colindex(cell.get("r"))
                    node = cell.find("m:v", NS)
                    inline = cell.find("m:is", NS)
                    value = node.text if node is not None else "".join(inline.itertext()) if inline is not None else None
                    kind = cell.get("t")
                    if value is not None:
                        if kind == "s":
                            value = shared[int(value)]
                        elif kind == "b":
                            value = value == "1"
                        elif kind not in ("inlineStr", "str", "e", "d"):
                            value = float(value)
                            if value.is_integer():
                                value = int(value)
                    formula = cell.find("m:f", NS)
                    if formula is not None:
                        formulas[cell.get("r")] = {"formula": formula.text, "attributes": formula.attrib, "cached_value": value}
                    values[index] = value
                row_number = int(element.get("r"))
                element.clear()
                if header is None:
                    header = [values.get(i) for i in range(max(values) + 1)]
                    assert all(isinstance(h, str) and h for h in header)
                    assert len(header) == len(set(header))
                    continue
                row = {h: values.get(i) for i, h in enumerate(header)}
                for label in DATE_COLUMNS.intersection(row):
                    value = row[label]
                    if isinstance(value, (int, float)) and not isinstance(value, bool):
                        assert value == int(value), "Unexpected time-of-day serial"
                        row[label] = (dt.datetime(1899, 12, 30) + dt.timedelta(days=value)).date().isoformat()
                yield sheet.get("name"), row_number, row, formulas


def main(archive_path):
    files, inputs = {}, {}
    with zipfile.ZipFile(archive_path) as archive:
        package_manifest = json.loads(archive.read("PACKAGE_MANIFEST.json"))

        def source(name):
            raw = archive.read(name)
            expected = package_manifest["files"][name]
            assert digest(raw) == expected["sha256"] and len(raw) == expected["bytes"], name
            inputs[name] = {"sha256": digest(raw), "bytes": len(raw)}
            return raw

        def write(name, raw, source_entry=None):
            path = ROOT / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(raw)
            files[name] = {"sha256": digest(raw), "bytes": len(raw)}
            if source_entry:
                files[name]["source_entry"] = source_entry

        def write_json(name, data):
            write(name, (json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode())

        tables, formula_cells, all_sources = {}, {}, []
        for sheet, number, row, formulas in workbook_rows(source(BOOK)):
            if sheet == "Sources":
                all_sources.append((number, row))
                continue
            selected = row.get("Country") == "Albania" or row.get("Country or territory") == "Albania" or str(row.get("Office ID", "")).startswith("AL-")
            if sheet in ("Parameters", "Read me"):
                selected = True
            if selected:
                tables.setdefault(sheet, []).append({"source_row": number, "values": row})
                if formulas:
                    formula_cells.setdefault(sheet, {}).update(formulas)

        office_rows = tables["Office register"]
        office_ids = {r["values"]["Office ID"] for r in office_rows}
        assert len(office_ids) == len(office_rows) == 122
        links = set()
        class Links(__import__("html.parser", fromlist=["HTMLParser"]).HTMLParser):
            def handle_starttag(self, tag, attrs):
                if tag == "a":
                    links.update(v for k, v in attrs if k == "href" and v.startswith(("http://", "https://")))

        for office_id in sorted(office_ids):
            entry = PREFIX + "Office_Briefings/Offices/" + office_id + ".html"
            raw = source(entry)
            Links().feed(raw.decode("utf-8"))
            write("briefings/" + office_id + ".html", raw, entry)
        for rows in tables.values():
            for record in rows:
                links.update(v for v in record["values"].values() if isinstance(v, str) and v.startswith(("http://", "https://")))
        tables["Sources"] = [{"source_row": n, "values": row} for n, row in all_sources if row.get("Source URL") in links]
        registered = {r["values"]["Source URL"] for r in tables["Sources"]}
        write_json("source-links.json", {"registered_source_urls": sorted(registered), "urls_without_master_source_row": sorted(links - registered), "note": "URLs without a master source row retain inline context in their originating table or briefing; do not fabricate publisher, title or retrieval dates."})
        for sheet, rows in tables.items():
            name = re.sub(r"[^a-z0-9]+", "-", sheet.lower()).strip("-")
            # Row arrays with one shared header keep the extracted data compact.
            columns = list(rows[0]["values"])
            payload = {"sheet": sheet, "columns": columns, "source_rows": [r["source_row"] for r in rows], "rows": [[r["values"][c] for c in columns] for r in rows]}
            # Keep individual files below 100 KiB when possible.
            parts, part = [], []
            for item in zip(payload["source_rows"], payload["rows"]):
                if part and len(json.dumps(part, ensure_ascii=False).encode()) + len(json.dumps(item, ensure_ascii=False).encode()) > 80000:
                    parts.append(part)
                    part = []
                part.append(item)
            if part:
                parts.append(part)
            for index, part in enumerate(parts, 1):
                suffix = "" if len(parts) == 1 else "-" + str(index).zfill(3)
                write_json("tables/" + name + suffix + ".json", {**payload, "source_rows": [x[0] for x in part], "rows": [x[1] for x in part]})
        write_json("cached-formulas.json", {"note": "Original formula text and cached values, not recalculated. Source row/column references refer to the full original workbook.", "sheets": formula_cells})

        coverage_rows = list(csv.DictReader(io.StringIO(source(PREFIX + "Europe_Country_Coverage.csv").decode("utf-8-sig"))))
        coverage = next(r for r in coverage_rows if r["country"] == "Albania")
        write_json("coverage.json", coverage)
        history = list(csv.DictReader(io.StringIO(source(PREFIX + "Europe_History_Index.csv").decode("utf-8-sig"))))
        history = [r for r in history if r["Country"] == "Albania"]
        # Independent CSV is retained to reconcile the workbook-selected history.
        write_json("history-index-crosscheck.json", {"columns": list(history[0]), "rows": [list(r.values()) for r in history]})
        index = "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><title>Albania research briefings</title><h1>Albania research briefings</h1><p>Research checked through 11 September 2026. Partial coverage; exact 2027 polling date and final boundaries remain unverified. <a href=\"README.md\">Read scope and limitations</a>.</p><ul>"
        for record in sorted(office_rows, key=lambda r: r["values"]["Office ID"]):
            row = record["values"]
            index += '<li><a href="briefings/' + row["Office ID"] + '.html">' + html.escape(row["Jurisdiction"] + " — " + row["Office"]) + '</a></li>'
        write("albania.html", (index + "</ul></html>\n").encode())
        counts = {sheet: len(rows) for sheet, rows in tables.items()}
        assert counts["History index"] == len(history) == 366
        manifest = {"schema_version": "europe-country-extract/1", "country": "Albania", "country_code": "AL", "region": "Europe", "research_checked_through": "2026-09-11", "packaged_on": "2026-09-15", "window": {"start": "2026-09-08", "end": "2028-03-08", "inclusive": True}, "coverage_complete": False, "site_ingestion_status": "pending_adapter", "archive": {"filename": Path(archive_path).name, "bytes": Path(archive_path).stat().st_size, "sha256": digest(Path(archive_path).read_bytes())}, "source_inputs": inputs, "table_row_counts": counts, "individual_briefings": len(office_ids), "source_link_counts": {"registered": len(registered), "inline_only": len(links - registered)}, "files": files}
        (ROOT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({"counts": counts, "files": len(files), "bytes": sum(v["bytes"] for v in files.values()), "largest_file": max(v["bytes"] for v in files.values())}, indent=2))


if __name__ == "__main__":
    main(sys.argv[1])
