# Romania 223-column field map

`column-map.json` maps every column in the unchanged 20-table / 223-column Atlas master contract. It is a documentary destination map, not an import. Source-specific raw fields remain in raw JSON; unknown is never coerced to zero. Country lineage is `country-package-romania`; release, attempt and publication identities are future implementation concerns.

The bundled SQL contracts are byte-for-byte copies of the pinned repository schema used for this review. The validator counts their declared columns and requires exactly 223. `schema_migration` is excluded from the research table count.
