# asap-trenchless.com — All Sewer and Plumbing Services (Eleventy + Tailwind)

Static site for All Sewer and Plumbing Services, LLC (Westminster, CO). Cloned from the
tsrtrenchless.com build and rewritten for the Colorado Front Range. No backend.

## Run / build

```powershell
npm install
npm start          # dev server at http://localhost:8080
npm run build      # production build into _site/
```

## Content — all in `src/_data/`

| File | What it holds |
|---|---|
| `site.json` | Name, **tracking number (720) 606-6223**, CTA text, HQ, form key, GA4 |
| `counties.json` | 9 hubs: Adams (home base), Denver, Jefferson, Arapahoe, Boulder, Douglas, Broomfield, Larimer, Weld |
| `cities.json` | 42 city / Denver-neighborhood pages (`local`, `local2`, `permitNote`, `signals`, 2 `faqs`, `sources`) |
| `projects.json` | 10 real jobs, cards link to the full write-ups on curedinplacepipe.net |
| `services.json` + `src/services/*.njk` | 7 service pages |
| `faqs.json`, `process.json`, `reviews.json` | FAQ page + homepage block, 6-step process, curated Google reviews |

Blog posts are markdown in `src/blog/` (3 Colorado posts to start).

The `sources` arrays in cities/counties are the research trail — they are not rendered.

## Before go-live

1. **Web3Forms key** → `site.json` → `form.accessKey`. Until then the form is hidden and a call CTA shows instead.
2. **GA4** → create a property, paste the ID, set `ga4Enabled: true`.
3. **Legal pages** → set `legal.effectiveDate` and remove the yellow "for the site owner" boxes after review.
4. **Review city facts** with Jeff/the crew (ownership rules, districts). Items the research could not confirm are hedged in the copy.
5. **Photos** → real job photos in `src/assets/img/` would help a lot.

## Deploy

Cloudflare Pages project `asap-trenchless`, build `npm run build`, output `_site`, `NODE_VERSION=22`.
See DEPLOY.md.
