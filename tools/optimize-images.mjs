#!/usr/bin/env node
/**
 * Convert source photographs into web-ready WebP at the widths this site uses.
 *
 * Replaces optimize-images.sh, which needs ImageMagick on the PATH — not the
 * case on Windows here. sharp ships prebuilt binaries, so this works anywhere
 * npm install has run.
 *
 *   npm run img -- <file-or-dir> [more...]        # writes to src/assets/img
 *   npm run img -- harvest/x/files/photo.jpg --name camera-2
 *   npm run img -- harvest/x/files --widths 1600,800,400
 *
 * Output follows the site's convention: <name>-<width>.webp, which the blog
 * templates rely on to swap a hero image for a lighter card thumbnail.
 */
import sharp from "sharp";
import { readdir, stat, mkdir } from "node:fs/promises";
import { join, extname, basename, resolve } from "node:path";

const OUT_DIR = "src/assets/img";
const DEFAULT_WIDTHS = [1600, 800, 400];
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return null;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};

const nameOverride = flag("name");
const widths = (flag("widths") || "")
  .split(",")
  .map((w) => parseInt(w.trim(), 10))
  .filter(Boolean);
const WIDTHS = widths.length ? widths : DEFAULT_WIDTHS;
const inputs = args.filter((a) => !a.startsWith("--"));

if (!inputs.length) {
  console.error(`
  usage: npm run img -- <file-or-dir> [more...] [--name base] [--widths 1600,800]

  Writes <name>-<width>.webp into ${OUT_DIR}.
`);
  process.exit(1);
}

/** WordPress leaves size variants like photo-300x200.jpg lying around; those are
 *  already downscaled and never worth re-encoding. */
const isSizeVariant = (name) => /-\d+x\d+$/.test(name);

/** Strip the noise WordPress and stock sites add, so filenames stay readable. */
const cleanName = (name) =>
  name
    .replace(/-scaled$/, "")
    .replace(/-featured$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function collect(target) {
  const s = await stat(target);
  if (s.isFile()) return [target];
  const entries = await readdir(target);
  return entries
    .filter((e) => SOURCE_EXT.has(extname(e).toLowerCase()))
    .filter((e) => !isSizeVariant(basename(e, extname(e))))
    .map((e) => join(target, e));
}

async function convert(file) {
  const src = basename(file, extname(file));
  const name = nameOverride || cleanName(src);
  const meta = await sharp(file).metadata();
  const written = [];

  for (const w of WIDTHS) {
    // Never upscale — a 421px source blown up to 1600 just looks soft.
    if (meta.width && w > meta.width) continue;
    const out = join(OUT_DIR, `${name}-${w}.webp`);
    await sharp(file).resize({ width: w }).webp({ quality: 82 }).toFile(out);
    written.push(w);
  }

  if (!written.length) {
    console.log(`  ! ${src} is only ${meta.width}px — smaller than every target width, skipped`);
    return;
  }
  console.log(`  ${src}  ->  ${name}-{${written.join(",")}}.webp   (source ${meta.width}x${meta.height})`);
}

await mkdir(OUT_DIR, { recursive: true });
for (const input of inputs) {
  for (const file of await collect(resolve(input))) {
    try {
      await convert(file);
    } catch (e) {
      console.log(`  ! ${basename(file)} failed: ${e.message}`);
    }
  }
}
