# Sources & Method — Analyst’s Matchday Report

## Project inputs

- `assets/docs/World_Cup_2026_Data.xlsx` — supplied workbook; its nine tables drive the report’s calculated tournament and player-output figures.
- `assets/docs/W.C.2026.pbix` — supplied Power BI project (56 report pages).
- `assets/video/World_Cup_2026_Walkthrough.mp4` — browser-ready 854 × 480 H.264 Constrained Baseline video with AAC-LC audio and fast-start metadata. The source audio was effectively silent (−91 dB); the uploaded original remains unchanged.
- `assets/docs/Mina_Hany_Wahba_CV.pdf` — supplied CV, linked directly from the project section.

## Tournament calculations from the workbook

- **104 matches, 48 teams, 12 groups, 308 goals and 16 venues** are counted from the supplied workbook.
- **Goals per match:** 308 ÷ 104 = 2.96, rounded to two decimals.
- **Attendance:** total reported attendance is 6,810,966; average is 6,810,966 ÷ 104 = 65,490 spectators, rounded to the nearest person. This is workbook attendance, not a ticket audit.
- **Late goals:** `Goals.Time_Bucket` records 81 goals in the 76–90 interval: 81 ÷ 308 = 26.3%, the largest single time bucket.
- **Extra time:** 9 of the 32 knockout fixtures went beyond 90 minutes (28.1%). The denominator includes the Round of 32 through the final, including the third-place match.
- **Final four:** goals for/against from each team’s `Team_Matches` rows over the full tournament: Spain 14–1; Argentina 19–8; England 20–12; France 20–10.
- **Workbook-derived mini records:** Golden Boot and top scorer come from supplied awards/scorer rows; highest-scoring fixture and venue attendance are calculated from match rows and reported attendance.

## Historical records checked against published sources

These are historical achievements, not projections from the Excel model. The public record cards link to their sources.

- **308 goals:** FIFA calls the 2026 total a new tournament record.
- **6,810,966 spectators:** FIFA reports a new attendance record; its stated previous mark is 3,587,538 at USA 1994.
- **104 matches:** FIFA describes the 48-team event as the largest World Cup to date, with more matches than any previous edition.
- **Kylian Mbappé:** 22 career World Cup finals goals, the all-time player record.
- **Lionel Messi:** goals in nine successive World Cup appearances, a new record.
- **Michael Olise:** seven assists in one edition, surpassing Pelé’s six in 1970.
- **Rodri:** 790 completed passes in one edition, surpassing his previous 638-pass mark.
- **Cristiano Ronaldo:** the first player to score in six separate World Cup editions.
- **Unai Simón:** seven clean sheets in one edition; the previous best was five.
- **Eloy Room:** equalled the single-match record of 16 saves, doing so in 30 fewer minutes than the previous co-holder.
- **Teammate pairs:** Jude Bellingham/Harry Kane and Ousmane Dembélé/Kylian Mbappé were the first teammate pairs with six goals apiece in one edition.
- **Spain:** FIFA identifies Spain as the first nation to hold the men’s and women’s World Cup titles simultaneously.

Primary sources:

- [FIFA — Final tournament review](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/overall-tournament-review-spain-argentina)
- [FIFA — Records broken at the World Cup 2026](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/records-broken-set)
- [Guinness World Records — World Cup 2026 records](https://www.guinnessworldrecords.com/news/2026/7/fifa-world-cup-2026-biggest-and-best-records-broken-as-spain-defeat-argentina)

## Player stories

The page combines the six under-24 profiles from the workbook with nine additional tournament standouts and record-setters. These are **selected stories, not a ranking**. Their goals, assists, age and Player-of-the-Match counts are workbook snapshots.

- **Lamine Yamal (18, Spain):** 1 goal, 0 assists, 2 Player-of-the-Match awards; champion.
- **Jude Bellingham (22, England):** 7 goals, 1 assist, 4 Player-of-the-Match awards; third place.
- **Andreas Schjelderup (22, Norway):** 1 goal, 3 assists; quarter-final.
- **Florian Wirtz (23, Germany):** 0 goals, 3 assists; Round of 32.
- **Arda Güler (21, Türkiye/Turkey in the workbook):** 1 goal, 0 assists, 1 Player-of-the-Match award; group-stage exit.
- **Hannibal Mejbri (23, Tunisia):** 0 goals, 2 assists; group-stage exit.
- Additional player cards cover Kylian Mbappé, Lionel Messi, Michael Olise, Cristiano Ronaldo, Harry Kane, Ousmane Dembélé, Erling Haaland, Rodri and Eloy Room.

The shortlist is a cue for further video review, not a transfer recommendation or forecast of player development. The workbook does not include minutes/starts, expected goals or assists, progressive actions, defensive work, injury status, contract, salary or transfer fee. The report therefore avoids per-90 comparisons, valuations and claims of proven potential.

## Cross-checks, images and credits

- [FIFA — Final tournament standings](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-tournament-standings) — final results.
- [FIFA — Award winners](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/award-winners) — awards cross-check.
- [FIFA — Türkiye 3–2 USA match report](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/turkiye-usa-match-report-highlights) — Arda Güler context after Türkiye’s group-stage exit.
- **Player portraits:** workbook-linked Wikimedia-hosted thumbnails. Each creator, source page and licence is listed in `assets/data/photo-attribution.csv`; follow the licence shown for each image.
- **Flags:** stored locally and sourced from FlagCDN; see `assets/data/flag-sources.csv`.
- **Stadium/player/trophy artwork:** original AI-generated illustrative art created for this portfolio. The player silhouette is not a real person; the generic trophy is not represented as the official FIFA trophy.
- **Fonts:** Inter and Barlow Condensed are locally hosted Google Fonts under the SIL Open Font License; licence files are in `assets/fonts/`.
- This is an independent data project and is not affiliated with or endorsed by FIFA.
