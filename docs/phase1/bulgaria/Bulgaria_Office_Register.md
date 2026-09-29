# Bulgaria — office register guide

The canonical register is `Bulgaria_Office_Register.json`: **533 current in-scope entries**, **1 historical-only entry**, and **3,067 held submunicipal entries**, for **3,601 research rows**. One office row denotes an elected body/contest family, not one row per representative or candidate.

The 530 municipality-wide entries retain Prompt P's accepted status and exact identities. The three new current entries and one historical body remain BI drafts. This document grants no new approval.

| New office ID | Body / selection | Lifecycle | Seats / counting rule | Draft tier |
| --- | --- | --- | --- | --- |
| BG-NATIONAL-ASSEMBLY | National Assembly; directly elected, unicameral | Current | 240 currently, Article 63 | national |
| BG-PRESIDENT-JOINT-TICKET | President and Vice-President; direct joint ballot, possible runoff | Current | One contest family; no artificial two-seat assembly | national |
| BG-EUROPEAN-PARLIAMENT | Bulgarian national EP contest | Current | 17 currently; preserve election-era allocation | other (supranational scope) |
| BG-GRAND-NATIONAL-ASSEMBLY-1990 | Seventh Grand National Assembly; distinct constituent body | Historical-only 1990–1991 | 400; not a second current chamber | national |

The ordinary Assembly and Grand National Assembly are not concurrent upper/lower chambers. The EP uses draft tier `other` under P's frozen tier vocabulary, with supranational scope described separately; no enum/schema change is proposed. No second sovereign identity, Prime Minister ballot, party organisation, or regional governor election is created. Sofia has its municipality-wide mayor and council below; its districts remain held.

Sources: [Constitution, Articles 63–64](https://www.constcourt.bg/bg/legal-info-92), [Articles 93–94 and 157–162](https://www.constcourt.bg/en/legal-info-92), [EP 2024 national allocation](https://results.elections.europa.eu/en/national-results/bulgaria/2024-2029/), [NSI 2025 territorial inventory](https://www.nsi.bg/en/press-release/administrative-territorial-and-territorial-division-of-the-republic-of-bulgaria-9010). NSI confirms 265 municipalities at 31 December 2025. A complete fresh 2026 name/code download was not obtained; this pack carries forward P's complete 265-pair roster and asserts no unsupported adds/removes. The 3,041 NSI mayoralties are an administrative count, not an automatic election-eligibility list or a replacement for P's 3,067 held rows.

## All 265 municipality-wide pairs

All entries in this table have `inherited_P_accepted` disposition. Source: the pinned original register and identity vectors in `baseline/Prompt_P/`. Labels are copied exactly, so no translation or municipality-prefix inference changes identity.

| Municipality label in P | Mayor ID | Council ID |
| --- | --- | --- |
| Аврен | BG-VAR01-M | BG-VAR01-C |
| Айтос | BG-BGS01-M | BG-BGS01-C |
| Аксаково | BG-VAR02-M | BG-VAR02-C |
| Алфатар | BG-SLS01-M | BG-SLS01-C |
| Антон | BG-SFO54-M | BG-SFO54-C |
| Антоново | BG-TGV02-M | BG-TGV02-C |
| Априлци | BG-LOV02-M | BG-LOV02-C |
| Ардино | BG-KRZ02-M | BG-KRZ02-C |
| Асеновград | BG-PDV01-M | BG-PDV01-C |
| Балчик | BG-DOB03-M | BG-DOB03-C |
| Баните | BG-SML02-M | BG-SML02-C |
| Банско | BG-BLG01-M | BG-BLG01-C |
| Батак | BG-PAZ03-M | BG-PAZ03-C |
| Белене | BG-PVN03-M | BG-PVN03-C |
| Белица | BG-BLG02-M | BG-BLG02-C |
| Белово | BG-PAZ04-M | BG-PAZ04-C |
| Белоградчик | BG-VID01-M | BG-VID01-C |
| Белослав | BG-VAR04-M | BG-VAR04-C |
| Берковица | BG-MON02-M | BG-MON02-C |
| Благоевград | BG-BLG03-M | BG-BLG03-C |
| Бобов дол | BG-KNL04-M | BG-KNL04-C |
| Бобошево | BG-KNL05-M | BG-KNL05-C |
| Божурище | BG-SFO06-M | BG-SFO06-C |
| Бойница | BG-VID03-M | BG-VID03-C |
| Бойчиновци | BG-MON04-M | BG-MON04-C |
| Болярово | BG-JAM03-M | BG-JAM03-C |
| Борино | BG-SML05-M | BG-SML05-C |
| Борован | BG-VRC05-M | BG-VRC05-C |
| Борово | BG-RSE03-M | BG-RSE03-C |
| Ботевград | BG-SFO07-M | BG-SFO07-C |
| Братя Даскалови | BG-SZR04-M | BG-SZR04-C |
| Брацигово | BG-PAZ06-M | BG-PAZ06-C |
| Брегово | BG-VID06-M | BG-VID06-C |
| Брезник | BG-PER08-M | BG-PER08-C |
| Брезово | BG-PDV07-M | BG-PDV07-C |
| Брусарци | BG-MON07-M | BG-MON07-C |
| Бургас | BG-BGS04-M | BG-BGS04-C |
| Бяла | BG-RSE04-M | BG-RSE04-C |
| Бяла | BG-VAR05-M | BG-VAR05-C |
| Бяла Слатина | BG-VRC08-M | BG-VRC08-C |
| Варна | BG-VAR06-M | BG-VAR06-C |
| Велики Преслав | BG-SHU23-M | BG-SHU23-C |
| Велико Търново | BG-VTR04-M | BG-VTR04-C |
| Велинград | BG-PAZ08-M | BG-PAZ08-C |
| Венец | BG-SHU07-M | BG-SHU07-C |
| Ветово | BG-RSE05-M | BG-RSE05-C |
| Ветрино | BG-VAR08-M | BG-VAR08-C |
| Видин | BG-VID09-M | BG-VID09-C |
| Враца | BG-VRC10-M | BG-VRC10-C |
| Вълчедръм | BG-MON11-M | BG-MON11-C |
| Вълчи дол | BG-VAR09-M | BG-VAR09-C |
| Върбица | BG-SHU10-M | BG-SHU10-C |
| Вършец | BG-MON12-M | BG-MON12-C |
| Габрово | BG-GAB05-M | BG-GAB05-C |
| Генерал Тошево | BG-DOB12-M | BG-DOB12-C |
| Георги Дамяново | BG-MON14-M | BG-MON14-C |
| Главиница | BG-SLS07-M | BG-SLS07-C |
| Годеч | BG-SFO09-M | BG-SFO09-C |
| Горна Малина | BG-SFO10-M | BG-SFO10-C |
| Горна Оряховица | BG-VTR06-M | BG-VTR06-C |
| Гоце Делчев | BG-BLG11-M | BG-BLG11-C |
| Грамада | BG-VID15-M | BG-VID15-C |
| Гулянци | BG-PVN08-M | BG-PVN08-C |
| Гурково | BG-SZR37-M | BG-SZR37-C |
| Гълъбово | BG-SZR07-M | BG-SZR07-C |
| Гърмен | BG-BLG13-M | BG-BLG13-C |
| Две могили | BG-RSE08-M | BG-RSE08-C |
| Девин | BG-SML09-M | BG-SML09-C |
| Девня | BG-VAR14-M | BG-VAR14-C |
| Джебел | BG-KRZ08-M | BG-KRZ08-C |
| Димитровград | BG-HKV09-M | BG-HKV09-C |
| Димово | BG-VID16-M | BG-VID16-C |
| Добрич | BG-DOB28-M | BG-DOB28-C |
| Добричка | BG-DOB15-M | BG-DOB15-C |
| Долна Митрополия | BG-PVN10-M | BG-PVN10-C |
| Долна баня | BG-SFO59-M | BG-SFO59-C |
| Долни Дъбник | BG-PVN11-M | BG-PVN11-C |
| Долни чифлик | BG-VAR13-M | BG-VAR13-C |
| Доспат | BG-SML10-M | BG-SML10-C |
| Драгоман | BG-SFO16-M | BG-SFO16-C |
| Дряново | BG-GAB12-M | BG-GAB12-C |
| Дулово | BG-SLS10-M | BG-SLS10-C |
| Дупница | BG-KNL48-M | BG-KNL48-C |
| Дългопол | BG-VAR16-M | BG-VAR16-C |
| Елена | BG-VTR13-M | BG-VTR13-C |
| Елин Пелин | BG-SFO17-M | BG-SFO17-C |
| Елхово | BG-JAM07-M | BG-JAM07-C |
| Етрополе | BG-SFO18-M | BG-SFO18-C |
| Завет | BG-RAZ11-M | BG-RAZ11-C |
| Земен | BG-PER19-M | BG-PER19-C |
| Златарица | BG-VTR14-M | BG-VTR14-C |
| Златица | BG-SFO47-M | BG-SFO47-C |
| Златоград | BG-SML11-M | BG-SML11-C |
| Ивайловград | BG-HKV11-M | BG-HKV11-C |
| Иваново | BG-RSE13-M | BG-RSE13-C |
| Искър | BG-PVN23-M | BG-PVN23-C |
| Исперих | BG-RAZ14-M | BG-RAZ14-C |
| Ихтиман | BG-SFO20-M | BG-SFO20-C |
| Каварна | BG-DOB17-M | BG-DOB17-C |
| Казанлък | BG-SZR12-M | BG-SZR12-C |
| Кайнарджа | BG-SLS15-M | BG-SLS15-C |
| Калояново | BG-PDV12-M | BG-PDV12-C |
| Камено | BG-BGS08-M | BG-BGS08-C |
| Каолиново | BG-SHU18-M | BG-SHU18-C |
| Карлово | BG-PDV13-M | BG-PDV13-C |
| Карнобат | BG-BGS09-M | BG-BGS09-C |
| Каспичан | BG-SHU19-M | BG-SHU19-C |
| Кирково | BG-KRZ14-M | BG-KRZ14-C |
| Кнежа | BG-PVN39-M | BG-PVN39-C |
| Ковачевци | BG-PER22-M | BG-PER22-C |
| Козлодуй | BG-VRC20-M | BG-VRC20-C |
| Копривщица | BG-SFO24-M | BG-SFO24-C |
| Костенец | BG-SFO25-M | BG-SFO25-C |
| Костинброд | BG-SFO26-M | BG-SFO26-C |
| Котел | BG-SLV11-M | BG-SLV11-C |
| Кочериново | BG-KNL27-M | BG-KNL27-C |
| Кресна | BG-BLG28-M | BG-BLG28-C |
| Криводол | BG-VRC21-M | BG-VRC21-C |
| Кричим | BG-PDV39-M | BG-PDV39-C |
| Крумовград | BG-KRZ15-M | BG-KRZ15-C |
| Крушари | BG-DOB20-M | BG-DOB20-C |
| Кубрат | BG-RAZ16-M | BG-RAZ16-C |
| Куклен | BG-PDV42-M | BG-PDV42-C |
| Кула | BG-VID22-M | BG-VID22-C |
| Кърджали | BG-KRZ16-M | BG-KRZ16-C |
| Кюстендил | BG-KNL29-M | BG-KNL29-C |
| Левски | BG-PVN16-M | BG-PVN16-C |
| Лесичово | BG-PAZ14-M | BG-PAZ14-C |
| Летница | BG-LOV17-M | BG-LOV17-C |
| Ловеч | BG-LOV18-M | BG-LOV18-C |
| Лозница | BG-RAZ17-M | BG-RAZ17-C |
| Лом | BG-MON24-M | BG-MON24-C |
| Луковит | BG-LOV19-M | BG-LOV19-C |
| Лъки | BG-PDV15-M | BG-PDV15-C |
| Любимец | BG-HKV17-M | BG-HKV17-C |
| Лясковец | BG-VTR20-M | BG-VTR20-C |
| Мадан | BG-SML16-M | BG-SML16-C |
| Маджарово | BG-HKV18-M | BG-HKV18-C |
| Макреш | BG-VID25-M | BG-VID25-C |
| Малко Търново | BG-BGS12-M | BG-BGS12-C |
| Марица | BG-PDV17-M | BG-PDV17-C |
| Медковец | BG-MON26-M | BG-MON26-C |
| Мездра | BG-VRC27-M | BG-VRC27-C |
| Мизия | BG-VRC28-M | BG-VRC28-C |
| Минерални бани | BG-HKV19-M | BG-HKV19-C |
| Мирково | BG-SFO56-M | BG-SFO56-C |
| Момчилград | BG-KRZ21-M | BG-KRZ21-C |
| Монтана | BG-MON29-M | BG-MON29-C |
| Мъглиж | BG-SZR22-M | BG-SZR22-C |
| Невестино | BG-KNL31-M | BG-KNL31-C |
| Неделино | BG-SML18-M | BG-SML18-C |
| Несебър | BG-BGS15-M | BG-BGS15-C |
| Никола Козлево | BG-SHU21-M | BG-SHU21-C |
| Николаево | BG-SZR38-M | BG-SZR38-C |
| Никопол | BG-PVN21-M | BG-PVN21-C |
| Нова Загора | BG-SLV16-M | BG-SLV16-C |
| Нови пазар | BG-SHU22-M | BG-SHU22-C |
| Ново село | BG-VID30-M | BG-VID30-C |
| Омуртаг | BG-TGV22-M | BG-TGV22-C |
| Опака | BG-TGV23-M | BG-TGV23-C |
| Опан | BG-SZR23-M | BG-SZR23-C |
| Оряхово | BG-VRC31-M | BG-VRC31-C |
| Павел баня | BG-SZR24-M | BG-SZR24-C |
| Павликени | BG-VTR22-M | BG-VTR22-C |
| Пазарджик | BG-PAZ19-M | BG-PAZ19-C |
| Панагюрище | BG-PAZ20-M | BG-PAZ20-C |
| Перник | BG-PER32-M | BG-PER32-C |
| Перущица | BG-PDV40-M | BG-PDV40-C |
| Петрич | BG-BLG33-M | BG-BLG33-C |
| Пещера | BG-PAZ21-M | BG-PAZ21-C |
| Пирдоп | BG-SFO55-M | BG-SFO55-C |
| Плевен | BG-PVN24-M | BG-PVN24-C |
| Пловдив | BG-PDV22-M | BG-PDV22-C |
| Полски Тръмбеш | BG-VTR26-M | BG-VTR26-C |
| Поморие | BG-BGS17-M | BG-BGS17-C |
| Попово | BG-TGV24-M | BG-TGV24-C |
| Пордим | BG-PVN27-M | BG-PVN27-C |
| Правец | BG-SFO34-M | BG-SFO34-C |
| Приморско | BG-BGS27-M | BG-BGS27-C |
| Провадия | BG-VAR24-M | BG-VAR24-C |
| Първомай | BG-PDV23-M | BG-PDV23-C |
| Раднево | BG-SZR27-M | BG-SZR27-C |
| Радомир | BG-PER36-M | BG-PER36-C |
| Разград | BG-RAZ26-M | BG-RAZ26-C |
| Разлог | BG-BLG37-M | BG-BLG37-C |
| Ракитово | BG-PAZ24-M | BG-PAZ24-C |
| Раковски | BG-PDV25-M | BG-PDV25-C |
| Рила | BG-KNL38-M | BG-KNL38-C |
| Родопи | BG-PDV26-M | BG-PDV26-C |
| Роман | BG-VRC32-M | BG-VRC32-C |
| Рудозем | BG-SML27-M | BG-SML27-C |
| Руен | BG-BGS18-M | BG-BGS18-C |
| Ружинци | BG-VID33-M | BG-VID33-C |
| Русе | BG-RSE27-M | BG-RSE27-C |
| Садово | BG-PDV28-M | BG-PDV28-C |
| Самоков | BG-SFO39-M | BG-SFO39-C |
| Самуил | BG-RAZ29-M | BG-RAZ29-C |
| Сандански | BG-BLG40-M | BG-BLG40-C |
| Сапарева баня | BG-KNL41-M | BG-KNL41-C |
| Сатовча | BG-BLG42-M | BG-BLG42-C |
| Свиленград | BG-HKV28-M | BG-HKV28-C |
| Свищов | BG-VTR28-M | BG-VTR28-C |
| Своге | BG-SFO43-M | BG-SFO43-C |
| Севлиево | BG-GAB29-M | BG-GAB29-C |
| Септември | BG-PAZ29-M | BG-PAZ29-C |
| Силистра | BG-SLS31-M | BG-SLS31-C |
| Симеоновград | BG-HKV29-M | BG-HKV29-C |
| Симитли | BG-BLG44-M | BG-BLG44-C |
| Ситово | BG-SLS32-M | BG-SLS32-C |
| Сливен | BG-SLV20-M | BG-SLV20-C |
| Сливница | BG-SFO45-M | BG-SFO45-C |
| Сливо поле | BG-RSE33-M | BG-RSE33-C |
| Смолян | BG-SML31-M | BG-SML31-C |
| Смядово | BG-SHU25-M | BG-SHU25-C |
| Созопол | BG-BGS21-M | BG-BGS21-C |
| Сопот | BG-PDV43-M | BG-PDV43-C |
| Средец | BG-BGS06-M | BG-BGS06-C |
| Стамболийски | BG-PDV41-M | BG-PDV41-C |
| Стамболово | BG-HKV30-M | BG-HKV30-C |
| Стара Загора | BG-SZR31-M | BG-SZR31-C |
| Столична | BG-SOF-M | BG-SOF-C |
| Стражица | BG-VTR31-M | BG-VTR31-C |
| Стралджа | BG-JAM22-M | BG-JAM22-C |
| Стрелча | BG-PAZ32-M | BG-PAZ32-C |
| Струмяни | BG-BLG49-M | BG-BLG49-C |
| Суворово | BG-VAR26-M | BG-VAR26-C |
| Сунгурларе | BG-BGS23-M | BG-BGS23-C |
| Сухиндол | BG-VTR32-M | BG-VTR32-C |
| Съединение | BG-PDV33-M | BG-PDV33-C |
| Сърница | BG-PAZ39-M | BG-PAZ39-C |
| Твърдица | BG-SLV24-M | BG-SLV24-C |
| Тервел | BG-DOB27-M | BG-DOB27-C |
| Тетевен | BG-LOV33-M | BG-LOV33-C |
| Тополовград | BG-HKV32-M | BG-HKV32-C |
| Трекляно | BG-KNL50-M | BG-KNL50-C |
| Троян | BG-LOV34-M | BG-LOV34-C |
| Трън | BG-PER51-M | BG-PER51-C |
| Трявна | BG-GAB35-M | BG-GAB35-C |
| Тунджа | BG-JAM25-M | BG-JAM25-C |
| Тутракан | BG-SLS34-M | BG-SLS34-C |
| Търговище | BG-TGV35-M | BG-TGV35-C |
| Угърчин | BG-LOV36-M | BG-LOV36-C |
| Хаджидимово | BG-BLG52-M | BG-BLG52-C |
| Хайредин | BG-VRC35-M | BG-VRC35-C |
| Харманли | BG-HKV33-M | BG-HKV33-C |
| Хасково | BG-HKV34-M | BG-HKV34-C |
| Хисаря | BG-PDV37-M | BG-PDV37-C |
| Хитрино | BG-SHU11-M | BG-SHU11-C |
| Цар Калоян | BG-RAZ36-M | BG-RAZ36-C |
| Царево | BG-BGS13-M | BG-BGS13-C |
| Ценово | BG-RSE37-M | BG-RSE37-C |
| Чавдар | BG-SFO57-M | BG-SFO57-C |
| Челопеч | BG-SFO58-M | BG-SFO58-C |
| Чепеларе | BG-SML38-M | BG-SML38-C |
| Червен бряг | BG-PVN37-M | BG-PVN37-C |
| Черноочене | BG-KRZ35-M | BG-KRZ35-C |
| Чипровци | BG-MON36-M | BG-MON36-C |
| Чирпан | BG-SZR36-M | BG-SZR36-C |
| Чупрене | BG-VID37-M | BG-VID37-C |
| Шабла | BG-DOB29-M | BG-DOB29-C |
| Шумен | BG-SHU30-M | BG-SHU30-C |
| Ябланица | BG-LOV38-M | BG-LOV38-C |
| Якимово | BG-MON38-M | BG-MON38-C |
| Якоруда | BG-BLG53-M | BG-BLG53-C |
| Ямбол | BG-JAM26-M | BG-JAM26-C |

## Held rows

All 35 district mayor and 3,032 village mayor IDs are retained individually in the JSON register and draft tiers. `held_baseline_not_2027_eligibility` is not a claim of present election eligibility. None is included in the 533 current in-scope count. No separately elected nested assembly is invented.
