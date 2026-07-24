// Turns Annie's phone exports into web assets.
//
// Two problems this solves. Her stills are HEIC, which no browser can display, and her
// videos are straight off an iPhone: audio track attached and far too heavy to sit on a
// landing page. Everything here is deterministic, so re-running after she adds photos is
// safe — it just overwrites.
//
// Run: node scripts/prepare-media.mjs

import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = '/Users/christinereichenbach/Desktop/Clients/Luna’s Bouquet/Arrangement Photos'
// The folder name uses a straight apostrophe on disk; resolve whichever exists.
const SRC_DIR = [
  "/Users/christinereichenbach/Desktop/Clients/Luna's Bouquet/Arrangement Photos",
  SRC,
].find((p) => existsSync(p))

const OUT_IMG = join(ROOT, 'src/assets/media')
const OUT_VID = join(ROOT, 'public/media')

if (!SRC_DIR) {
  console.error('Could not find the Arrangement Photos folder.')
  process.exit(1)
}

mkdirSync(OUT_IMG, { recursive: true })
mkdirSync(OUT_VID, { recursive: true })

// --- what goes where -------------------------------------------------------------
// Chosen by Christine 2026-07-23. Holiday heroes first, then the gallery.

const STILLS = [
  // [source file, output slug, long edge px]
  ['Valentines Day Pink Picture.HEIC', 'holiday-valentines', 1600],
  ['Mothers day.HEIC', 'holiday-mothers-day', 1600],
  ['IMG_6422.HEIC', 'ahnaleigh-about', 1600],
]

const VIDEOS = [
  // [source file, output slug]
  ['Fall 1 Video.MP4', 'holiday-thanksgiving'],
  ['Christmas 4 Video.MP4', 'holiday-christmas'],
  ['IMG_6407.MP4', 'holiday-easter'],
]

// Gallery = only the files Christine named herself (2026-07-23). Nothing from the
// untouched IMG_#### pile, and no two angles of the same arrangement:
//   Christmas 2       skipped — same arrangement as Christmas, different angle
//   Christmas 4 Video skipped — already the Christmas holiday card
//   Fall 1 Video      skipped — already the Thanksgiving card
//   Mothers day       skipped — already the Mother's Day card
//   Valentines Pink   skipped — picture is the Valentine's card, video is the same vase
//   Ahnaleigh About   skipped — reserved for her story, not the work rail
const GALLERY = [
  ['Gallery 1.HEIC', 'g01-banquet-run'],
  ['Event 1.HEIC', 'g02-blush-on-black'],
  ['Extra Large Roses.JPG', 'g03-extra-large-roses'],
  ['Adhoc Flowers 3.HEIC', 'g04-gerbera-mix'],
  ['Christmas.HEIC', 'g05-christmas'],
]

// Named videos that belong in the gallery rail, looping and silent like the holiday cards.
const GALLERY_VIDEOS = [
  ['Adhoc Flowers 1.MP4', 'gv01-adhoc-one'],
  ['Adhoc Flowers 2.MP4', 'gv02-adhoc-two'],
  ['Christmas 3.MP4', 'gv03-christmas-three'],
]

// --- helpers ---------------------------------------------------------------------

function sips(src, dest, longEdge) {
  // sips is the only thing on macOS that reliably decodes HEIC.
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z',
    String(longEdge), src, '--out', dest], { stdio: 'pipe' })
}

function encodeVideo(src, destMp4, destPoster) {
  // -an drops the audio track outright. Muting in HTML would hide the sound but still
  // ship it, and Christine asked for no audio, not quiet audio.
  execFileSync(ffmpegPath, [
    '-y', '-i', src,
    '-an',
    '-vf', "scale='min(1280,iw)':-2",
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '26', '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', // lets playback start before the whole file lands
    destMp4,
  ], { stdio: 'pipe' })

  // A poster means the card isn't blank while the video loads.
  execFileSync(ffmpegPath, [
    '-y', '-i', src, '-ss', '00:00:01', '-frames:v', '1',
    '-vf', "scale='min(1280,iw)':-2", '-q:v', '4', destPoster,
  ], { stdio: 'pipe' })
}

const mb = (p) => (statSync(p).size / 1048576).toFixed(2)

// --- run -------------------------------------------------------------------------

let ok = 0
const missing = []

for (const [file, slug, edge] of [...STILLS, ...GALLERY.map(([f, s]) => [f, s, 1400])]) {
  const src = join(SRC_DIR, file)
  if (!existsSync(src)) { missing.push(file); continue }
  const dest = join(OUT_IMG, `${slug}.jpg`)
  sips(src, dest, edge)
  console.log(`  still  ${slug}.jpg  ${mb(dest)} MB`)
  ok++
}

for (const [file, slug] of [...VIDEOS, ...GALLERY_VIDEOS]) {
  const src = join(SRC_DIR, file)
  if (!existsSync(src)) { missing.push(file); continue }
  const destMp4 = join(OUT_VID, `${slug}.mp4`)
  const destPoster = join(OUT_IMG, `${slug}-poster.jpg`)
  encodeVideo(src, destMp4, destPoster)
  // Prove the audio is actually gone rather than trusting the flag. `ffmpeg -i` with no
  // output file always exits nonzero, so read its stderr rather than its exit code.
  let probe = ''
  try {
    execFileSync(ffmpegPath, ['-i', destMp4], { stdio: ['pipe', 'pipe', 'pipe'] })
  } catch (err) {
    probe = String(err.stderr ?? '')
  }
  const hasAudio = /Stream #\d+:\d+.*: Audio:/.test(probe)
  if (hasAudio) throw new Error(`${slug}.mp4 still has an audio track`)
  console.log(`  video  ${slug}.mp4  ${mb(destMp4)} MB (was ${mb(src)} MB) — no audio track`)
  ok++
}

console.log(`\n${ok} files written.`)
if (missing.length) console.log(`MISSING (skipped): ${missing.join(', ')}`)
