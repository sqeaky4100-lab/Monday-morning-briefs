# Monday Morning Briefs

Static archive of the weekly Monday morning briefs, with a dashboard at the root
that lists every brief and opens it in a reading pane.

Live: <https://monday-morning-briefs.vercel.app/>

## Layout

```
index.html                 dashboard — side panel + reading pane
briefs.json                generated manifest the dashboard reads
briefs/YYYY-MM-DD-slug.html  one self-contained brief per file
assets/fonts.css           Fraunces face, extracted from the briefs
scripts/build-index.mjs    regenerates briefs.json from briefs/
```

Each brief is a standalone page with its own CSS and fonts inlined, so it can be
opened, emailed, or archived on its own. The dashboard only reads metadata from
them; it never rewrites them.

## Adding a brief

1. Save the brief as `briefs/YYYY-MM-DD-slug.html`. The `YYYY-MM-DD` prefix is
   required — it is what orders and groups the list.
2. Run `npm run index` to regenerate `briefs.json`.
3. Commit both and push. Vercel redeploys on push to `main`.

`build-index.mjs` pulls each entry from the brief itself:

| field      | source                       |
| ---------- | ---------------------------- |
| `title`    | `<title>`                    |
| `dateline` | first `<p class="daydate">`  |
| `lede`     | first `<h1>`                 |
| `sections` | every `<h2>`                 |

If a brief uses different markup, those fields come back empty and the dashboard
falls back to the slug and date — it still lists and links correctly.

## Local preview

```bash
npm run dev     # builds the index, serves on http://localhost:4000
```

Open it over HTTP rather than double-clicking `index.html`; the dashboard fetches
`briefs.json`, which `file://` blocks.

## Dashboard behaviour

- Deep links: `/#2026-09-07-week-ahead` opens straight to that brief.
- `↑`/`↓` (or `k`/`j`) move between briefs; the filter box searches titles,
  datelines, ledes and section names.
- Under 860px wide the reading pane drops away and the list links directly to
  each brief's own page.

## Deploying

No build step and no dependencies — Vercel serves the folder as-is. Framework
preset is **Other**, build command empty, output directory the repo root.
