# Romania identity rules

1. Current geography keys use immutable SIRUTA source codes: `RO-U-{SIRUTA}` and `RO-B-S{n}`; county keys use zero-padded official JUD codes.
2. Council and direct executive are distinct office identities (`-C`, `-M`, `-P`). Never collapse their contests.
3. Event identity is office + official election date/cycle + round. A runoff is not folded into first preference.
4. The annulled 2024 presidential round is retained with status `annulled`; no successor edge to 2025 is guessed.
5. County-president 2016 council investiture is documentary context, not a popular-election event.
6. Missing results remain absent/NULL; zero is allowed only when the source explicitly reports zero.
7. Renames, mergers, splits and status changes require a cited legal instrument. Same/similar names do not establish succession.
8. Bucharest General Council/general mayor and six sectors have separate identities. No neighbourhood boards are created.
9. Source snapshots are hashed; URL alone is not an immutable identity.
10. Tier status is draft until Justin approves exact bytes.
