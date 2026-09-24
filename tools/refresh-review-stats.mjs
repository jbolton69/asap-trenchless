#!/usr/bin/env node
/**
 * Refresh the live Google rating and review count in src/_data/reviews.json.
 *
 * Only touches `rating` and `count`. The curated `items` array is never modified —
 * those are chosen by hand so they can be matched to city pages.
 *
 * Setup:
 *   1. Google Cloud console -> enable "Places API (New)" -> create an API key.
 *      Restrict it to the Places API. No OAuth, no approval process.
 *   2. Set the key in the environment:
 *        PowerShell:  $env:GOOGLE_MAPS_API_KEY="AIza..."
 *        bash:        export GOOGLE_MAPS_API_KEY="AIza..."
 *   3. First run resolves and prints the Place ID. Paste it into reviews.json as
 *      "placeId" so later runs skip the lookup (one fewer billed call, and no risk
 *      of matching the wrong listing).
 *
 * Usage:
 *   node tools/refresh-review-stats.mjs
 *   node tools/refresh-review-stats.mjs --dry-run
 */

import fs from 'node:fs/promises';

const FILE = 'src/_data/reviews.json';
const KEY = process.env.GOOGLE_MAPS_API_KEY;
const DRY = process.argv.includes('--dry-run');

if (!KEY) {
  console.error('GOOGLE_MAPS_API_KEY is not set. See the header of this file.');
  process.exit(1);
}

function fail(msg) {
  console.error(`\n${msg}\n`);
  process.exit(1);
}

const raw = await fs.readFile(FILE, 'utf8');
const data = JSON.parse(raw);

async function resolvePlaceId() {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({
      textQuery: data.searchQuery || 'All Sewer and Plumbing Services Westminster CO',
    }),
  });
  if (!res.ok) fail(`Text search failed (HTTP ${res.status}).\n${await res.text()}`);
  const json = await res.json();
  const hit = json.places?.[0];
  if (!hit) fail('No place matched the search query. Set "searchQuery" in reviews.json, or set "placeId" directly.');
  console.log(`Resolved: ${hit.displayName?.text} — ${hit.formattedAddress}`);
  console.log(`Place ID: ${hit.id}`);
  console.log('Paste that into reviews.json as "placeId" to pin it.\n');
  return hit.id;
}

const placeId = data.placeId || (await resolvePlaceId());

const res = await fetch(
  `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,displayName`,
  { headers: { 'X-Goog-Api-Key': KEY } }
);
if (!res.ok) fail(`Place details failed (HTTP ${res.status}).\n${await res.text()}\n` +
  'Common causes: the key is not enabled for "Places API (New)", the key restriction blocks this call, ' +
  'or billing is not enabled on the Cloud project.');
const place = await res.json();

const nextRating = place.rating != null ? String(place.rating.toFixed(1)) : data.rating;
const nextCount = place.userRatingCount ?? data.count;

console.log(`${place.displayName?.text || 'Place'}: ${nextRating} stars, ${nextCount} reviews`);

const statsChanged = String(data.rating) !== String(nextRating) || data.count !== nextCount;
const pinningPlaceId = !data.placeId;

if (!statsChanged && !pinningPlaceId) {
  console.log('No change.');
  process.exit(0);
}

if (statsChanged) {
  console.log(`Updating: ${data.rating} -> ${nextRating}, ${data.count} -> ${nextCount}`);
} else {
  console.log('Stats unchanged — pinning placeId so future runs skip the lookup.');
}

if (DRY) {
  console.log('--dry-run: nothing written.');
  process.exit(0);
}

data.rating = nextRating;
data.count = nextCount;
if (!data.placeId) data.placeId = placeId;

await fs.writeFile(FILE, JSON.stringify(data, null, 2) + '\n');
console.log(`Wrote ${FILE}`);
