# Prompt BK — Peru full office register + historic contests + upcoming calendar

Paste into ChatGPT. Research/documentation only. Do **not** invent offices, votes, seats, dates, or successor links. Do **not** write importer/SQLite/VPS/UI/repo changes (`applied_changes=0`). All Justin approval boxes stay **unchecked**.

## Standing Atlas policy (expanded scope, same as Uruguay BF / Georgia BG / Kosovo BH / Bulgaria BI / Chile BJ)
Atlas previously treated Peru as a LatAm stub with **zero offices** under an early continuity filter that deprioritized countries without tight elections inside ~18 months. That filter is **rescinded for Peru**.

For swing-capable democracies (Peru included): deliver the **full current office register** plus **historic contests/results**, even when next ordinary cycles fall outside the ~18-month alert window. That window filters global homepage/alerts only — **not** whether offices, history, or a country-level upcoming calendar exist.

**Required prominent calendar note:** the pack must include a first-class, source-cited **Upcoming elections** section (in README + Justin report + a dedicated `Peru_Upcoming_Elections.md`) listing **every** next ordinary contest family with:
- office family / contest name (e.g. President of the Republic + first/second round; Senate / Chamber of Deputies **when those chambers exist under the law in force for that cycle**; Congreso unicameral **for eras when Congress was unicameral**; Parlamento Andino seats **only if** popularly elected under Peruvian law for that cycle; gobernadores regionales + vicegobernadores + consejeros regionales; alcaldes + regidores for **provincial and district** municipalities; Callao / Lima Metropolitan special arrangements only as sources establish; any sourced runoff / second ballot / primary that ONPE–JNE administer as formal contests; any sourced extraordinary / early / vacancy-triggered path that is the next ordinary occurrence)
- scheduled or constitutionally/statutorily fixed date (or “date formula + next occurrence year” when JNE / ONPE / Presidency convocatoria has not yet been issued)
- whether the date is **constitutional/statutory formula**, **official convocatoria / decree / JNE cronograma**, or **research hold**
- last comparable contest date (for orientation)
- explicit statement that these dates must surface prominently on the Peru country surface even when they sit outside the ~18-month alert window
- **presidential vacancy / impeachment succession / early Congress / snap / runoff / repeat contingency** documented honestly when sources establish that the next ordinary formula may be overtaken — do **not** invent a snap date; record the contingency as a hold with the last comparable contest for orientation

Do **not** invent exact calendar days. Prefer ONPE (onpe.gob.pe), JNE (jne.gob.pe), RENIEC (padrones / territory), Constitución Política del Perú, Ley Orgánica de Elecciones and related electoral laws (incl. Ley de Elecciones Municipales, Ley de Elecciones Regionales, and reforms restoring / reshaping Senate–Diputados), El Peruano official acts used by election administration, and official territorial registers of departamentos / provincias / distritos (incl. Provincia Constitucional del Callao). If only a formula is sourced, record the formula and the derived next occurrence year honestly; mark formal convocatoria as pending when that is the case.

**Orientation (must be verified against primary sources, not copied as invention):** publicly reported JNE/ONPE calendars for the current research window include **Elecciones Generales 2026** (President + Congress chambers + Andean Parliament seats as the convocatoria defines them; first round / possible presidential runoff) and **Elecciones Regionales y Municipales 2026** (gobernadores / vicegobernadores / consejeros; provincial and district alcaldes / regidores). Confirm every date, chamber name, and office family from primary convocatoria / cronograma texts before writing calendar rows.

## Scope — Peru
Treat this pack as the **República del Perú** jurisdictions register (`country_id` peru / **PE**). Flip coverage from empty LatAm stub → full research pack. Do **not** invent MERCOSUR parliament seats as Peru national offices. Historical European Parliament: Peru is **not** an EU Member State — `EP offices = 0`.

**Include (elected bodies only, as sources establish for Peruvian institutions)**
- President of the Republic — **popular** election; document first round + **ballotage / second round** as separate events when sources do; document Vice Presidents on the presidential ticket honestly as sources establish (ticket vs separately elected — do not invent a separate popular VP office if law elects them on the ticket)
- **Congreso / Senate / Chamber of Deputies** — document seat totals, chamber structure, and electoral system honestly **by era** (unicameral Congreso eras vs bicameral Senate + Diputados restoration / reform eras). Do **not** invent both a unicameral Congreso office set and a bicameral set for the same contemporaneous era
- **Parlamento Andino** — include Peruvian popular seats **only** where sources establish ONPE/JNE-administered popular election of Peru’s Andean Parliament representatives for that cycle; otherwise document exclusion / appointment / other mode in research-gaps and keep office count honest
- **Gobernadores regionales**, **vicegobernadores regionales**, and **consejeros del consejo regional** for every current regional government unit sources establish as popularly elected (departamentos + Callao as sources do) — full current inventory, not a near-term-election subset
- Municipality-wide **alcaldes** and **regidores** for every current **provincial municipality** and every current **district municipality** in the official Peruvian territorial register used by ONPE/JNE/RENIEC — **full current municipal inventory**, including Lima districts and Callao, not a subset
- Any sourced **national / regional primary** contests only if peer Atlas packs treat them as distinct documentary ONPE–JNE contests **and** sources establish them as formal administered contests; otherwise document in research-gaps, do not invent office rows for party organs
- Historical / extraordinary elected bodies **only if** sources identify them as distinct elected institutions, clearly typed as historical or extraordinary — do **not** invent them as today’s ordinary Congress offices

**Exclude / do not invent**
- Appointed ministers / cabinet / prefects / appointed-era regional authorities as popular offices
- Party organisations as offices
- Invented provincial elected “governor” tier where the popular executive is the provincial **alcalde** (or another sourced title) — type municipal layers honestly; do not invent a third executive tier
- Twin invented offices for abolished/merged/renamed distritos / provincias / departamentos unless historical-only rows are source-identified (**no guessed merger edges**)
- Invented indigenous parliament / parallel institutions without source identification of a popular elected body
- Invented colonial / pre-independence offices as if they were today’s national/regional/municipal offices without source identification
- EP seats for Peru (must remain 0)
- Invented MERCOSUR / other international parliament seats unless ONPE/JNE-administered popular election is source-established for Peru

**History**
- Prefer ONPE, JNE, Constitución and organic electoral laws + reforms, El Peruano acts used by election administration, official departamento/provincia/distrito territorial registers, OAS / EU observation reports when they cite certified figures
- Named gates: unicameral Congreso ↔ bicameral Senate/Diputados reforms; presidential ballotage rules; regional government popularization; provincial vs district municipal layers; Lima Metropolitan / Callao special arrangements; vacancy / succession / early election paths; annulment / repeat / replacement contests; concurrent vs staggered national vs regional–municipal calendars
- Retain historical units when sources identify them; type same-territory status changes honestly; keep annulled vs repeated vs runoff contests as separate events when sources do; **no guessed merger edges**
- Certified vs preliminary; missing ≠ zero; do not convert untranscribed vote/share/seat fields to zero; percentage-only rows retain shares with missing votes honestly

## Required deliverables
Same pack shape as Prompt Y/Z/AB–BJ: README, office register (national + regional-elected **only where popular** + provincial **and** district municipal council **and** direct executive rows only where applicable), draft tiers 1:1 with production vs hold disposition explicit for any unresolved submunicipal or appointed-era rows, events/results, 223-col field map, identity rules, ≥15 acceptance examples, source inventory+hashes, research-gaps (presidential ballotage + vacancy/succession paths; Congreso unicameral vs Senate/Diputados eras; Parlamento Andino popular-seat disposition; full regional inventory incl. Callao; full provincial + district municipal inventory incl. Lima districts; confirmation EP=0; confirmation coverage is no longer an empty stub; confirmation that next ordinary cycles may sit outside the ~18-month alert window and are still fully documented), SHA256SUMS + validator, Justin report, **plus** `Peru_Upcoming_Elections.md` as specified above. `applied_changes=0`; approvals unchecked.

Atlas currently has a Peru country stub with **0 offices** — there is no prior accepted municipal pack to preserve. Build the full register from official sources; do not invent successor edges from empty stub state.

## Return to Justin
ZIP + ZIP SHA-256 + count summary (current/historical; events; results; draft tier histogram; direct-executive offices vs councils; national / regional / provincial-municipal / district-municipal breakout; explicit confirmation of zero EP offices; explicit Parlamento Andino disposition; explicit provincial vs district municipal inventory completeness; **and a pasted Upcoming elections table** with sourced next dates/formulas for President (+ runoff if sourced), each Congress chamber applicable to the next cycle, Parlamento Andino if popular, gobernadores/vicegobernadores/consejeros regionales, provincial alcaldes/regidores, and district alcaldes/regidores, plus any honest early/snap/vacancy/repeat contingency hold).
