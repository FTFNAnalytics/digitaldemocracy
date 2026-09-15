# Atlas master SQLite (not in git)

Local / CI default path for the Election Atlas database:

```text
data/master/atlas.sqlite
```

Override with `ATLAS_SQLITE_PATH`. Production on the VPS should use:

```text
/var/lib/cdd/atlas.sqlite
```

The database file, WAL, and SHM siblings are gitignored. Creating this directory
or an empty file is **path readiness only** — not Phase 1 complete.

See [docs/atlas-plan.md](../../docs/atlas-plan.md) and [docs/atlas-phase1.md](../../docs/atlas-phase1.md).
