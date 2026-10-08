# World Cup 2026 — The Analyst’s Matchday Report

A visual, English-language football analyst report by **Mina Hany Wahba**. Built for presentation: a fast stadium walkout, a concise executive read, tournament context, record-breaking moments and 15 player stories.

## What the audience sees

- **Executive read:** the few tournament numbers and late-game signal that matter.
- **Tournament story:** the title route, final-four comparison and matchday highlights.
- **The record book:** 12 tournament and player milestones checked against FIFA and Guinness World Records.
- **Talent watch:** 15 player portraits, flags and clickable short profiles—breakout examples alongside record-setters.
- **Project room:** the playable dashboard walkthrough, source Power BI report and workbook, a visible CV link, and contact details.

The report follows the project’s green-and-gold dashboard palette, with large type, stadium lighting, football imagery, card/chart motion and short click-activated transitions. The entrance is quicker, the video has a direct-open fallback, and **there are no scroll-triggered animations**. A compact one-line toolkit sits under the dashboard video; the report itself focuses on football and business takeaways.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` and choose **Enter the Stadium** (or **Skip Walkout**). Use the top navigation to jump between sections.

## Publish with GitHub Pages

1. **Extract the ZIP** so `index.html`, `README.md`, `.nojekyll`, and `assets/` sit at the repository root. Do not upload the ZIP as the website itself.
2. Commit and push the extracted files to the repository’s `main` branch.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then save.
5. Open the published URL shown in **Settings → Pages**.

Keep the folder structure intact. The package stays below GitHub’s 100-file web-uploader selection limit. The browser-ready walkthrough is H.264/AAC at 854 × 480 with fast-start metadata; the separate original upload remains unchanged.

## Data and limitations

Tournament totals and player tournament-output cards are calculated from the supplied workbook. External historical records are separately linked to FIFA’s final tournament review, FIFA’s records report, and Guinness World Records. The player stories are selected examples, not a ranking or transfer recommendation. The source workbook does not include minutes, expected goals, contract, injury or fee data, so the report makes no per-90 comparisons, valuations or player-development predictions. See [Sources & Method](SOURCES_AND_METHOD.md) and [image credits](assets/data/ASSET_CREDITS.md).

This is an independent portfolio project, **not an official FIFA website or product**. Preserve the photo-attribution CSV and comply with each image’s licence if publishing publicly.
