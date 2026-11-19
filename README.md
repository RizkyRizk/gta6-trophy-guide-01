# Leonida Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/RizkyRizk/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/RizkyRizk/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Tracker is the best offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a checklist saved in your browser, a seven-stage roadmap to the Platinum, the one missable trophy flagged, and a guide in our own words for every trophy, each citing its sources.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static file server — it works with the network off. `node main.ts` (with `MAKEFUN_OUTPUT_DIR=out`) hands the guide in as `out/` with its dossier.

## What is inside

- **Checklist** — all 55 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 hidden). Tick trophies off; progress saves in `localStorage`, exports to a file and imports back.
- **Filters** — by kind (story, missable, collectibles, activities, robbery, side stories, world), by grade, by search text, and hide-earned.
- **Spoiler-safe mode** — hides the names and descriptions of hidden story trophies until you earn them.
- **Platinum roadmap** — seven stages in order, from the first mission to 100% completion, built from the official descriptions: chapter saves, the duo, side stories, robberies, races and stunts, collectibles, and the 100% cleanup.
- **Missable flag** — exactly one trophy can be missed: Positive Mental Attitude, whose Chapter 1 balcony meditation disappears after Chapter 1 (no mission replay, so keep a Chapter 1 save).
- **Cited guides** — every trophy's guide is written in our own words and names its sources (the official list via Exophase / PSNProfiles, plus Output Lag, KeenGamer and GGRecon). No guide text is copied from another guide, and there is no Rockstar logo or official artwork anywhere.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself (static, no build step).
- `app/data/trophies.json` — the 55 official trophies with guides and sources.
- `app/data/roadmap.json` — the seven-stage roadmap.
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `screenshots/` — 4 screenshots of the guide running (cover first).

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
