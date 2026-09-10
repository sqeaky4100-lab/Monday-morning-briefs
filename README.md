# Monday Morning Briefs

Static archive of the weekly Monday morning briefs, with a dashboard at the root
that lists every brief and opens it in a reading pane.

Live: <https://monday-morning-briefs.vercel.app/>

## Layout

```
index.html                   dashboard — side panel + card gallery + reader
briefs.json                  generated metadata the dashboard paints from
search.json                  generated body text, fetched only for the filter
briefs/YYYY-MM-DD-slug.html  one self-contained brief per file
assets/fonts.css             Fraunces face, extracted from the briefs
scripts/build-index.mjs      regenerates both generated files from briefs/
```

Each brief is a standalone page with its own CSS and fonts inlined, so it can be
opened, emailed, or archived on its own. The dashboard only reads metadata from
them; it never rewrites them.

## Adding a brief

1. Save the brief as `briefs/YYYY-MM-DD-slug.html`. The `YYYY-MM-DD` prefix is
   required — it is what orders and groups the list.
2. Run `npm run index` to regenerate `briefs.json` and `search.json`.
3. Commit both and push. Vercel redeploys on push to `main`.

`build-index.mjs` pulls each entry from the brief itself:

| field      | source                                            |
| ---------- | ------------------------------------------------- |
| `title`    | `<title>`                                         |
| `dateline` | first element with `class="daydate"` (any tag)    |
| `lede`     | first `<h1>`                                      |
| `sections` | every `<h2>`                                      |
| body text  | everything outside `<style>`, capped at 20k chars |

Briefs have been written with both `<p class="daydate">` and
`<div class="daydate">`, so the match is on the class rather than the tag. If a
brief uses different markup entirely, those fields come back empty and the
dashboard falls back to the slug and date — it still lists and links correctly.

Cards and the list lead with the **lede**, not the title, because every brief's
`<title>` is just a restatement of its date. The title is kept for the reader
bar, the browser tab, and the hover tooltip.

## Local preview

```bash
npm run dev     # builds the index, serves on http://localhost:4000
```

Open it over HTTP rather than double-clicking `index.html`; the dashboard fetches
`briefs.json`, which `file://` blocks.

## Dashboard behaviour

The dashboard opens on a **gallery of cards**, never on a particular brief. Each
card carries a live scaled-down preview of the brief itself — an iframe at 1000px
scaled to the card width — so there is no screenshot pipeline to run and previews
can never go stale. Previews load lazily as cards scroll into view.

- The left pane lists every brief, grouped by month. On screens under 860px it
  becomes a drawer behind the &#9776; button in the header.
- Clicking a card or a list row opens that brief in a reading pane, with
  &larr; back to the gallery and **Open &#8599;** for the standalone page.
- Deep links work: `/#2026-09-07-week-ahead` opens straight to that brief, and
  the browser back button returns to the gallery.
- The filter box searches the full text of every brief, plus titles, datelines,
  ledes, section names and the date labels as displayed — so `aug`, `september`
  and `power query` all match. That text lives in `search.json`, which is
  fetched on idle after the gallery paints (and awaited if you type first), so
  the archive can grow without slowing the first load.
- `Esc` closes the drawer, then leaves a brief. `&uarr;`/`&darr;` (or `k`/`j`)
  move between briefs while reading.

Cards are real links, so cmd/ctrl-click opens a brief in a new tab.

## Deploying

No build step and no dependencies — Vercel serves the folder as-is. Framework
preset is **Other**, build command empty, output directory the repo root.
