# Atlas SQLite files (not in git)

Local / CI default paths for Election Atlas databases:

```text
data/master/atlas.sqlite           # master / staging (ATLAS_SQLITE_PATH)
data/master/atlas-attempts.sqlite  # durable attempt ledger (ATLAS_ATTEMPTS_SQLITE_PATH)
```

Production on the VPS should use:

```text
/var/lib/cdd/atlas.sqlite
/var/lib/cdd/atlas-attempts.sqlite
```

The attempt ledger is a sibling file. It is separately committed and is **never**
renamed or replaced when a master publication is swapped. There is no foreign
key across the two database files.

The database files, WAL, and SHM siblings are gitignored. Creating this directory
or an empty file is **path readiness only** — not Phase 1 complete.

See [docs/atlas-plan.md](../../docs/atlas-plan.md), [docs/atlas-phase1.md](../../docs/atlas-phase1.md),
and [docs/phase1/Phase1_DDL_Rationale.md](../../docs/phase1/Phase1_DDL_Rationale.md).
