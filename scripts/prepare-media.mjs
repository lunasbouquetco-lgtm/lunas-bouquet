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

// Twenty distinct arrangements. Deliberately no two angles of the same vase — the raw
// folder is full of near-identical bursts (IMG_3552-3565 is one arrangement shot
// fourteen times), and a gallery that repeats reads as padding.
const GALLERY = [
  ['IMG_8735.HEIC', 'g01-pink-garden-roses'],
  ['IMG_4911.HEIC', 'g02-peach-coral-airy'],
  ['IMG_1613.HEIC', 'g03-rust-chrysanthemum'],
  ['Gallery 1.HEIC', 'g04-banquet-run'],
  ['Extra Large Roses.JPG', 'g05-white-rose-globe'],
  ['Event 1.HEIC', 'g06-blush-on-black'],
  ['IMG_1239.HEIC', 'g07-white-hydrangea-event'],
  ['IMG_1236.HEIC', 'g08-blue-hydrangea-peach'],
  ['IMG_5390.HEIC', 'g09-coral-gerbera-window'],
  ['IMG_5398.HEIC', 'g10-desert-wall-gold'],
  ['IMG_6419.HEIC', 'g11-cream-peach-desert'],
  ['IMG_8874.HEIC', 'g12-office-yellow-gerbera'],
  ['IMG_8876.HEIC', 'g13-office-pink-daisy'],
  ['IMG_3198.JPG', 'g14-cream-rose-mass'],
  ['IMG_8933.HEIC', 'g15-red-rose-classic'],
  ['IMG_0159.HEIC', 'g16-pink-gladiolus'],
  ['IMG_0188.HEIC', 'g17-plum-cream-brick'],
  ['IMG_8720.HEIC', 'g18-magenta-tall-vase'],
  ['IMG_5019.HEIC', 'g19-sunflower-eucalyptus'],
  ['IMG_6688.JPG', 'g20-white-lily-table'],
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

for (const [file, slug] of VIDEOS) {
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
