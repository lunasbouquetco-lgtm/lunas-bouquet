// Every photo and video on the site, in one place. Built by scripts/prepare-media.mjs
// from Annie's Arrangement Photos folder — re-run that script after she adds more.
//
// Stills are imported so Vite fingerprints them; videos live in /public and are
// referenced by path, because bundling multi-megabyte MP4s into the JS graph is a
// waste and they stream better served as plain files.

import valentines from '@/assets/media/holiday-valentines.jpg'
import mothersDay from '@/assets/media/holiday-mothers-day.jpg'
import thanksgivingPoster from '@/assets/media/holiday-thanksgiving-poster.jpg'
import christmasPoster from '@/assets/media/holiday-christmas-poster.jpg'
import easterPoster from '@/assets/media/holiday-easter-poster.jpg'
import ahnaleighAbout from '@/assets/media/ahnaleigh-about.jpg'

import g01 from '@/assets/media/g01-pink-garden-roses.jpg'
import g02 from '@/assets/media/g02-peach-coral-airy.jpg'
import g03 from '@/assets/media/g03-rust-chrysanthemum.jpg'
import g04 from '@/assets/media/g04-banquet-run.jpg'
import g05 from '@/assets/media/g05-white-rose-globe.jpg'
import g06 from '@/assets/media/g06-blush-on-black.jpg'
import g07 from '@/assets/media/g07-white-hydrangea-event.jpg'
import g08 from '@/assets/media/g08-blue-hydrangea-peach.jpg'
import g09 from '@/assets/media/g09-coral-gerbera-window.jpg'
import g10 from '@/assets/media/g10-desert-wall-gold.jpg'
import g11 from '@/assets/media/g11-cream-peach-desert.jpg'
import g12 from '@/assets/media/g12-office-yellow-gerbera.jpg'
import g13 from '@/assets/media/g13-office-pink-daisy.jpg'
import g14 from '@/assets/media/g14-cream-rose-mass.jpg'
import g15 from '@/assets/media/g15-red-rose-classic.jpg'
import g16 from '@/assets/media/g16-pink-gladiolus.jpg'
import g17 from '@/assets/media/g17-plum-cream-brick.jpg'
import g18 from '@/assets/media/g18-magenta-tall-vase.jpg'
import g19 from '@/assets/media/g19-sunflower-eucalyptus.jpg'
import g20 from '@/assets/media/g20-white-lily-table.jpg'

export { ahnaleighAbout }

export type HolidayMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster: string; alt: string }

// Keyed by the ids in lib/arrangements.ts.
export const HOLIDAY_MEDIA: Record<string, HolidayMedia> = {
  thanksgiving: {
    kind: 'video',
    src: '/media/holiday-thanksgiving.mp4',
    poster: thanksgivingPoster,
    alt: 'A fall arrangement in gold, rust and deep red',
  },
  christmas: {
    kind: 'video',
    src: '/media/holiday-christmas.mp4',
    poster: christmasPoster,
    alt: 'A Christmas arrangement with red roses, white lilies and winterberry',
  },
  valentines: {
    kind: 'image',
    src: valentines,
    alt: "A Valentine's arrangement of magenta and blush roses",
  },
  easter: {
    kind: 'video',
    src: '/media/holiday-easter.mp4',
    poster: easterPoster,
    alt: 'A spring arrangement in pale pink, lavender and white',
  },
  'mothers-day': {
    kind: 'image',
    src: mothersDay,
    alt: "A Mother's Day arrangement of garden roses in pink and plum",
  },
}

// Twenty distinct arrangements — no two angles of the same vase. The source folder is
// full of near-identical bursts, and a gallery that repeats itself reads as padding.
export const GALLERY: { src: string; alt: string }[] = [
  { src: g01, alt: 'Pink and burgundy garden roses' },
  { src: g02, alt: 'An airy peach and coral arrangement with eucalyptus' },
  { src: g03, alt: 'Rust chrysanthemums and orange roses' },
  { src: g04, alt: 'A long banquet table run in autumn colors' },
  { src: g05, alt: 'A globe vase massed with white roses' },
  { src: g06, alt: 'Blush and cream blooms against black' },
  { src: g07, alt: 'White hydrangea and daisies at a corporate event' },
  { src: g08, alt: 'Blue hydrangea with peach roses' },
  { src: g09, alt: 'Coral gerbera daisies in window light' },
  { src: g10, alt: 'Gold and white blooms against a desert wall' },
  { src: g11, alt: 'Cream and peach roses with desert agave behind' },
  { src: g12, alt: 'Yellow gerbera and lilies brightening an office' },
  { src: g13, alt: 'Pink and white daisies on an office counter' },
  { src: g14, alt: 'A mass of cream roses' },
  { src: g15, alt: "Classic red roses with baby's breath" },
  { src: g16, alt: 'Pink gladiolus and snapdragons' },
  { src: g17, alt: 'Plum and cream blooms against brick' },
  { src: g18, alt: 'Magenta roses in a tall vase' },
  { src: g19, alt: 'Sunflowers and eucalyptus' },
  { src: g20, alt: 'White lilies and roses on a white table' },
]
