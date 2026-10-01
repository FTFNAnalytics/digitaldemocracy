"""Reproduce this country package from the frozen Europe archive (stdlib only)."""
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
DATE_COLUMNS = {"Actual ballot date, if recorded", "Next date", "Term expiry (not polling day)", "Next polling date", "First or scheduled date", "End or runoff date",
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



import gzip
import tarfile
from collections import Counter
from html.parser import HTMLParser

COUNTRY = 'Belgium'
CODE = 'BE'
COMPANION = None

def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode()

def main(archive_path):
    contents, inputs, tables, formula_cells, sources, links = {}, {}, {}, {}, [], set()
    with zipfile.ZipFile(archive_path) as archive:
        package_manifest = json.loads(archive.read("PACKAGE_MANIFEST.json"))
        def source(name):
            raw = archive.read(name)
            expected = package_manifest["files"][name]
            assert digest(raw) == expected["sha256"] and len(raw) == expected["bytes"], name
            inputs[name] = expected
            return raw
        def add_table(group, sheet, number, row, formulas):
            key = group + "/" + re.sub(r"[^a-z0-9]+", "-", sheet.lower()).strip("-")
            table = tables.setdefault(key, {"sheet": sheet, "columns": list(row), "source_rows": [], "rows": []})
            table["source_rows"].append(number)
            table["rows"].append(list(row.values()))
            if formulas:
                formula_cells.setdefault(key, {}).update(formulas)
            links.update(v for v in row.values() if isinstance(v, str) and v.startswith(("https://", "http://")))
        for sheet, number, row, formulas in workbook_rows(source(BOOK)):
            if sheet == "Sources":
                sources.append((number, row, formulas))
            elif row.get("Country") == COUNTRY or row.get("Country or territory") == COUNTRY or str(row.get("Office ID", "")).startswith(CODE + "-") or sheet in ("Parameters", "Read me"):
                add_table("master", sheet, number, row, formulas)
        if COMPANION:
            raw = source(PREFIX + COMPANION)
            contents["workbooks/" + COMPANION] = raw
            for sheet, number, row, formulas in workbook_rows(raw):
                add_table("companion", sheet, number, row, formulas)
        coverage_rows = list(csv.DictReader(io.StringIO(source(PREFIX + "Europe_Country_Coverage.csv").decode("utf-8-sig"))))
        coverage = next(r for r in coverage_rows if r["country"] == COUNTRY)
        history = list(csv.DictReader(io.StringIO(source(PREFIX + "Europe_History_Index.csv").decode("utf-8-sig"))))
        history = [r for r in history if r["Country"] == COUNTRY]
        contents["history-index.json"] = json_bytes(history)
        links.update(r["Source URL"] for r in history if r["Source URL"])
        office_table = tables.get("master/office-register", {"columns": [], "rows": []})
        offices = [dict(zip(office_table["columns"], r)) for r in office_table["rows"]]
        ids = {r["Office ID"] for r in offices}
        assert len(ids) == len(offices) == int(coverage["records"])
        assert len(history) == int(coverage["history_entries"])
        assert all(r["Office ID"] in ids for r in history)
        assert Counter(r["Office ID"] for r in history) == Counter({r["Office ID"]: r["History entries"] for r in offices if r["History entries"]})
        class Links(HTMLParser):
            def handle_starttag(self, tag, attrs):
                if tag == "a":
                    links.update(v for k,v in attrs if k == "href" and v and v.startswith(("http://", "https://")))
        for office_id in sorted(ids):
            name = "Office_Briefings/Offices/" + office_id + ".html"
            raw = source(PREFIX + name)
            contents[name] = raw
            Links().feed(raw.decode("utf-8"))
        name = "Office_Briefings/" + 'belgium' + ".html"
        contents[name] = source(PREFIX + name)
        Links().feed(contents[name].decode("utf-8"))
        for number, row, formulas in sources:
            if row.get("Source URL") in links:
                add_table("master", "Sources", number, row, formulas)
        for key, table in tables.items():
            contents["tables/" + key + ".json"] = json_bytes(table)
        contents["formula-cache.json"] = json_bytes(formula_cells)
        registered = {row.get("Source URL") for _,row,_ in sources if row.get("Source URL") in links}
        contents["source-links.json"] = json_bytes({"registered_in_master":sorted(registered),"without_master_source_row":sorted(links-registered),"note":"Companion source metadata and inline citations are retained separately. No new source metadata inferred."})
        companion_ids = set()
        if COMPANION:
            table=tables["companion/jurisdictions"]
            companion_ids={r[table["columns"].index("Jurisdiction ID")] for r in table["rows"]}
            assert companion_ids <= ids
            ch=tables["companion/histories"]
            assert len(ch["rows"]) == sum(r["Office ID"] in companion_ids for r in history)
        summary={"country":COUNTRY,"office_records":len(ids),"history_entries":len(history),"calendar_cohorts":len(tables.get("master/election-calendar",{}).get("rows",[])),"companion_offices":len(companion_ids),"offices_outside_companion":sorted(ids-companion_ids),"companion_full_result_rows":len(tables.get("companion/full-results",{}).get("rows",[])),"office_briefings":len(ids),"table_row_counts":{k:len(v["rows"]) for k,v in tables.items()}}
        assert summary["calendar_cohorts"] == int(coverage["calendar_cohorts"])
        inventory={"source_entries":inputs,"contents":{n:{"sha256":digest(b),"bytes":len(b)} for n,b in sorted(contents.items())}}
        contents["inventory.json"]=json_bytes(inventory)
        payload=io.BytesIO()
        with tarfile.open(fileobj=payload,mode="w",format=tarfile.USTAR_FORMAT) as tar:
            for name,raw in sorted(contents.items()):
                item=tarfile.TarInfo(name); item.size=len(raw); item.mode=0o644; item.mtime=0
                tar.addfile(item,io.BytesIO(raw))
        compressed=gzip.compress(payload.getvalue(),compresslevel=9,mtime=0)
        chunks={}
        (ROOT/"payload").mkdir(exist_ok=True)
        for n,start in enumerate(range(0,len(compressed),98304),1):
            name=f"payload/data.tar.gz.part{n:03d}"
            raw=compressed[start:start+98304]
            (ROOT/name).write_bytes(raw)
            chunks[name]={"sha256":digest(raw),"bytes":len(raw)}
        manifest={"country":COUNTRY,"research_snapshot":"2026-09-11","packaged":"2026-09-15","window":{"start":"2026-09-08","end":"2028-03-08","inclusive":True},"website_ingestion":"pending","archive_name":Path(archive_path).name,"archive_sha256":digest(Path(archive_path).read_bytes()),"source_entries":inputs,"summary":summary,"compression":"Concatenate chunks in manifest order to obtain a gzip-compressed POSIX tar archive.","payload_sha256":digest(compressed),"chunks":chunks,"contents":{n:{"sha256":digest(b),"bytes":len(b)} for n,b in sorted(contents.items())},"transformations":["Original country and office HTML bytes preserved unchanged. Selected master workbook rows are extracted; the original master XLSX remains in the regional ZIP, with its source checksum retained.","Table arrays preserve row order, headers, original source row numbers, numeric precision and nulls. Recognized Excel dates converted using 1900 epoch to ISO dates; partial date strings remain unchanged.","Formula text, attributes and original caches retained separately; formulas are not recalculated.","History index is filtered from the regional CSV and overlaps the master History index table. Do not sum these datasets.","Master Parameters and Read me are regional methodology, not country totals."]}
        manifest.pop("source_entries")
        manifest.pop("contents")
        manifest["inventory"]={"path":"inventory.json","sha256":digest(contents["inventory.json"]),"bytes":len(contents["inventory.json"])}
        (ROOT/"coverage.json").write_bytes(json_bytes(coverage))
        (ROOT/"manifest.json").write_bytes(json_bytes(manifest))
        print(json.dumps({**summary,"compressed_bytes":len(compressed),"chunks":len(chunks)},ensure_ascii=False))

if __name__ == "__main__":
    main(sys.argv[1])
