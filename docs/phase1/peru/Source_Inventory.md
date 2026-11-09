# Sources and retained hashes

`source_inventory.json` supplies the URL, publisher attribution, retained path, byte count and SHA-256 for every retained original. Original bytes are never corrected. `retrieval_failures.json` records failed attempts without invented hashes.

Primary source hierarchy: enacted law / official call → JNE certified return → ONPE published election data → INEI territorial/government directory. Source conflicts are resolved claim-by-claim, never by assuming a page title identifies the downloaded file.

Key evidence: Compendio 2026 secondedition; Decree 001-2026-PCM; Law 31988; revisedLOE; Law 28360; Law 32729; INEI September and 14 October municipal directories andMarchregionaldirectory; JNE 1135/1625/1411/1412/1413; ONPEregional/municipal archives 2002–2025 andnationaldatasets 2000–2021.

Repository contract references: `FTFNAnalytics/digitaldemocracy`, master DDL blob `993d6cc69161e6ca294f10af6f8dab250798de59` and attempt-ledger DDL blob `74c160dd4aa293ed0ce576c2a23a9e8fd175c02d`. These are reference text only, retained undercontracts/; noSQL execution.


Refresh retains 318 original source files in total. Added originals establish the October roster, regional runoff schedule, centros poblados date and local statutory formula. See `refresh_retrieval_log.json` for failures and successful recoveries; failed requests receive no invented content hash.
