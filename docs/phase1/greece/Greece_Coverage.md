# Greece coverage inventory

| Cycle | Municipalities | Regions | First-round candidates | Runoffs | Runoff candidates |
|---|---:|---:|---:|---:|---:|
| 2010 | 325 | 13 | 1,413 | 232 | 464 |
| 2014 | 325 | 13 | 1,545 | 223 | 446 |
| 2019 | 332 | 13 | 1,736 | 236 | 472 |
| 2023 | 332 | 13 | 1,289 | 90 | 180 |

Each authority-cycle has two office events. The above 1,366 authority-cycle vectors produce 2,732 local office events. National/European/presidential history contributes 42 additional events. Proceedings are separate objects and are not counted as new office-cycle events.

| Result office type | Rows |
|---|---:|
| european_parliament | 149 |
| mayor | 7,097 |
| municipal_council | 5,607 |
| parliament | 295 |
| president | 32 |
| regional_council | 376 |
| regional_governor | 448 |

Result rows with an exact vote count: 13,963. Rows with unknown votes: 41. Missing votes occur only in explicitly identified earlier national/EP/presidential observations. Unknown seats for executive roles mean not applicable; other unknown seats are never forced to zero.

| Office | Date | Precision | Result rows | Rows with votes | Known seats | Coverage |
|---|---|---|---:|---:|---:|---|
| GR-EP | 1981 | year | 0 | 0 | 0 | election_year_evidenced_by_EP_turnout_history_no_result_vector_asserted |
| GR-EP | 1984 | year | 5 | 0 | 24 | EP_constitutive_session_party_seats_and_available_shares |
| GR-EP | 1989 | year | 5 | 0 | 24 | EP_constitutive_session_party_seats_and_available_shares |
| GR-EP | 1994 | year | 6 | 0 | 25 | EP_constitutive_session_party_seats_and_available_shares |
| GR-EP | 1999 | year | 6 | 0 | 25 | EP_constitutive_session_party_seats_and_available_shares |
| GR-EP | 2004 | year | 6 | 0 | 24 | EP_constitutive_session_party_seats_and_available_shares |
| GR-EP | 2009 | year | 7 | 0 | 22 | EP_constitutive_session_party_seats_and_available_shares |
| GR-EP | 2014-05-25 | day | 43 | 43 | 21 | full_published_national_vector |
| GR-EP | 2019-05-26 | day | 40 | 40 | 21 | full_published_national_vector |
| GR-EP | 2024-06-09 | day | 31 | 31 | 21 | full_published_national_vector |
| GR-PARL | 1974-11-17 | day | 4 | 4 | 300 | seat_winning_parties_only |
| GR-PARL | 1977-11-20 | day | 7 | 7 | 300 | seat_winning_parties_only |
| GR-PARL | 1981-10-18 | day | 3 | 3 | 300 | seat_winning_parties_only |
| GR-PARL | 1985-06-02 | day | 4 | 4 | 300 | seat_winning_parties_only |
| GR-PARL | 1989-06-18 | day | 5 | 5 | 300 | seat_winning_parties_only |
| GR-PARL | 1989-11-05 | day | 5 | 4 | 300 | seat_winning_parties_only |
| GR-PARL | 1990-04-08 | day | 6 | 5 | 300 | seat_winning_parties_only |
| GR-PARL | 1993-10-10 | day | 4 | 4 | 300 | seat_winning_parties_only |
| GR-PARL | 1996-09-22 | day | 5 | 5 | 300 | seat_winning_parties_only |
| GR-PARL | 2000-04-09 | day | 4 | 4 | 300 | seat_winning_parties_only |
| GR-PARL | 2004-03-07 | day | 17 | 17 | 300 | full_published_national_vote_vector_seats_for_four_winning_parties |
| GR-PARL | 2007-09-16 | day | 22 | 22 | 300 | full_published_national_vector |
| GR-PARL | 2009-10-04 | day | 24 | 24 | 300 | full_published_national_vector |
| GR-PARL | 2012-05-06 | day | 32 | 32 | 300 | full_published_national_vector |
| GR-PARL | 2012-06-17 | day | 22 | 22 | 300 | full_published_national_vector |
| GR-PARL | 2015-01-25 | day | 23 | 23 | 300 | full_published_national_vector |
| GR-PARL | 2015-09-20 | day | 20 | 20 | 300 | full_published_national_vector |
| GR-PARL | 2019-07-07 | day | 21 | 21 | 300 | full_published_national_vector |
| GR-PARL | 2023-05-21 | day | 36 | 36 | 300 | full_published_national_vector |
| GR-PARL | 2023-06-25 | day | 31 | 31 | 300 | full_published_national_vector |

Zero result rows for an event means no result vector is asserted. The known-seat aggregate of an event-only record is a count of represented data, not an assertion that zero seats were available or won.

The four local cycles include every slate/head candidate published in the authority result vectors. National/EP scope is national list returns; individual district-candidate preference universes are not claimed. Presidential scope is individually evidenced parliamentary ballots/outcomes.
