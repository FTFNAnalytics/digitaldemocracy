# Source → documentary projection contract

All paths below are under data/research/portugal. Original source URLs/hashes are in sources.json; exact archive members/hashes are in Archive_Member_Inventory.json. Extraction is read-only; no upstream scripts or formulas executed.

## Current register

CNE2025_al_mandatos_cm_am.xlsx / Mandatos: data rows after header3; C=DDCC_t exact4-character code, D=Concelho, B=region/district, E=parishcount,F=electors,G=CMsize,H=AM elected component. All308 rows instantiate AM/CM/PCM legal mandates. Numbers are retained metadata, not elected result seats.

CNE2025_al_mandatos_af.xlsx / AF_Mandatos: D=DTMNFR exact6-character code, E=officialparishname,B=district,C=municipality,F=electors,G=AFmandates,H=Obs. ColumnsI:N are retained internal comparison columns; NEVER substitute them for D. All3258rows instantiate JF/PJF; the3221 nonplenary rows also instantiateAF.37 G=0, H=Plenário(1) mean no electedAF. Result-table490101Corvo blank AF placeholder is absent from this register and creates no parish.

Lei169/99 arts21–24,42,56–57 supplies body/mandate mechanisms; Constitution arts121,147,225–231 and official election maps evidence national/regional bodies. Regional government president is appointed considering election result. CNE2025 plenary guidance distinguishes list vs nominal voting; do not infer which method a parish used without minutes.

## Five local cycles

2025 archive2025al-mapa-oficial_retificado: mapa_1_resultados_retificado.xlsx Folha1; mapa_2_perc_mandatos_retificado.xlsx Folha1; mapa_anexo.xlsx. 2021 archive2021al_mapa_oficial: mapa_1_resultados.xlsx mapa_I; mapa_2_perc_mandatos.xlsx mapa_II; mapa_anexo.xlsx.2017 archiveal2017_mapaoficial_retif02_01out2018:01-mapa_I_vf_r2.xls Formatar;02-mapa_II_perc_mandatos-vf_r2.xls mapaII_perc_mandatos;04-mapa_anexo-vf_r2.xls.2013 archiveal2013_mapaoficial_retif:Parte1_resultadosv7_retif.xls Sheet1;Parte2_perc_mandatosv7_retif.xls Sheet1;Parte4_anexov7_retif.xls.2009 originalresultados_al2009.xls Mapa_01 andpercentagem_de_votos_expressos_nas_candidaturas_e_mandatos.xls.

Locate literalCÓD header;2013 has leading blankA, other maps beginA. Relative columns1code,2municipality,3parish,4organ,5registered,6voters,7blank,8null; columns9+ literalparty/slot candidatevotes. Accept only CM/AM/AF rows. Numericcandidate cells yield one result; blank/dash means no numeric return, never a zero candidate. Votes parsed as exactwhole integer. MapII uses same code+organ and verified name, paired%/M columns headed by sameparty/slot; typedshare andseats copied, notcalculated. Oncode conflict use only unique same municipality/organ/parish-name binding and retain bothlocators. Bracketedslot[A] resolves only through same ballot's annex[A]SIGLA cell; unresolvedslots remainliteral. Coalition/candidate IDs not globally inferred.

Every result's evidence includes exact source sheet,row,vote column and share/seat columns; R.raw keeps source scalars/header. Eventraw retains all source values and declared totals. Plenary(P) or no numeric list cells remain unresolved-inputs without a fabricated completed event. All local dates year-only pending per-row repeat-date audit. MapIII elected persons, ODS counterparts, annex comparisons and MAI snapshots are retained, not additive result vectors. First source/projection duplicates never add histories.

## Parliamentary maps2009–2025

Each cycle has22 constituency contexts attached toPT-AR.2009/2011 headerrow4: Bcode,Cname,Dregistered,Evoters,Gblank,Inull;K onwardpartytriplets(Number,Percentagem,Md).2015 headerrow2:Acode,Bname,Cregistered,Dvoters,Fblank,Hnull;J onwardtriplets. Percentages use VTT including blank/invalid; no normalization.

2019+ transposedmaps: literalCírculo row (2019row3; othersrow2),22 numberedconstituencycolumnsC:X; followingname row. Relativeheader+2registered,+3voters,+6blank,+8null,+10VVE. Partyblocks beginheader+12: label inA,Number row; nextrow%/VVE; nextrowmd. Copy cachednumeric source cells exactly. ExcludeTotalcolumnY to avoid duplication. Candidate dash is not a votezero. AR2022 Europe final-repeat date retainsyear-only.

## Official PDF maps

pdf-transcriptions.json enumerates every typedPDF result with originalphysicalpage/table/row/column and typedvalues; pdf-text retains exactpdftotext projection. Originals remain authoritative and representative tables were visually inspected. Madeira2023/24/25 horizontalTotal/%VVE/MD; PR2021 and2026 first/secondsufrágio samehorizontalcolumns. PR2016 page1 rotatedcandidatecolumns1–10 were visually read; no ballotallocation from lostMargarita votes. PR2026 first/runoff are two proceedings ofoneevent. Exact publishedrunoff numbers remain disputed duepublisher's omitted-vote caveat.

Açores2024/2020 use Totalcolumn only, notCompensaçãoquotients or sumofislandandtotalrows.2016 Totaisgerais row usesN.º,%VVE,md (NOT adjacent%V). c.r.(rejectedcandidature) isunknownnumeric, preservedraw withdispute; no inferredtotalfromoneisland. Older officialmaps retained butnotadditive.2024retification concernsan electedname;2016PPMquotientcaveat retained.

EP2024 officialmapTotal/%VVE/MD.2019/2014/2009 districtsummaryTotalPE row only forvotes; no addedNacional/Estrangeiro/territorialrows. Older share/seatofficialmaps retained pendingbinding, so typedNULL/unknown isdisclosed; do notcalculatepercentage ormandates.

## Holds and raw survival

Numericpublishedclaims are not repaired. aggregate-conflicts.json records independent candidate-sum checks; result evidence disputed for thoseevents. Presidential2026 omissions andAzoresrejectedlist remain separateholds. All unmodeledmetadata, score/control/coalition narratives, candidatepersonlists, proceduralnotes, timingandlegalannotations remain byte-identical retainedinput andraw wherebound. No metrics tables, computedmargins, party mapping or fabricatedsourceFK.
