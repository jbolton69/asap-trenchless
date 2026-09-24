# Deploying to Cloudflare Pages

Two ways. Pick one — you don't need both.

## Option A — Git-connected (recommended)

Cloudflare builds on every push. No CI config, no tokens.

1. Push this repo to GitHub (or GitLab).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repo, then set:

   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `_site` |
   | Root directory | *(leave blank)* |

4. Environment variables → add `NODE_VERSION` = `22`.
5. Save and Deploy. First build takes ~1–2 minutes.

Every push to `main` deploys to production. Every other branch and every PR gets its own
preview URL — useful for showing the client a change before it's live.

## Option B — GitHub Actions

`.github/workflows/deploy.yml` is already here if you'd rather control the build yourself.
You need two repo secrets:

- `CLOUDFLARE_API_TOKEN` — Cloudflare dashboard → My Profile → API Tokens → Create Token →
  use the **Edit Cloudflare Workers** template, or a custom token with
  *Account → Cloudflare Pages → Edit*.
- `CLOUDFLARE_ACCOUNT_ID` — right sidebar of any Cloudflare account page.

Then create the Pages project once (Direct Upload type) or let the first Action run create it.

## Custom domain

1. Pages project → **Custom domains** → **Set up a custom domain** → `asap-trenchless.com`.
2. Add `www.asap-trenchless.com` too, then set one to redirect to the other (pick one as
   canonical — the site's canonical tags currently point at the apex, `https://asap-trenchless.com`).
3. If the domain's DNS is already on Cloudflare, records are added automatically. If it's
   elsewhere, Cloudflare gives you a CNAME to add.

SSL is automatic and free.

## Cutover checklist

Before pointing the live domain at this:

- [ ] `site.json` → `formEndpoint` set to a real endpoint, and a test submission received
- [ ] `site.json` → real CSLB license number
- [ ] Tracking numbers filled in for Riverside, San Bernardino, Ventura, Santa Barbara
- [ ] Analytics + call-tracking script added to `src/_includes/layouts/base.njk`
- [ ] `src/static/_redirects` — every URL the current site ranks for is mapped.
      Pull the list from Search Console → Pages, sorted by impressions, before you cut over.
      **This is the step that loses rankings if skipped.**
- [ ] Crawl the built `_site/` for broken links one more time
- [ ] Submit `https://asap-trenchless.com/sitemap.xml` in Search Console after go-live
- [ ] Keep the old site reachable for a few days if possible, so you can diff anything missed

## Local preview of a production build

```bash
npm run build
npx serve _site      # or: python3 -m http.server -d _site 8080
```

Note that `_redirects` and `_headers` only take effect on Cloudflare/Netlify, not in a
plain local server.
