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

import g01 from '@/assets/media/g01-banquet-run.jpg'
import g02 from '@/assets/media/g02-blush-on-black.jpg'
import g03 from '@/assets/media/g03-extra-large-roses.jpg'
import g04 from '@/assets/media/g04-gerbera-mix.jpg'
import g05 from '@/assets/media/g05-christmas.jpg'
import gv01Poster from '@/assets/media/gv01-adhoc-one-poster.jpg'
import gv02Poster from '@/assets/media/gv02-adhoc-two-poster.jpg'
import gv03Poster from '@/assets/media/gv03-christmas-three-poster.jpg'

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

export type GalleryItem =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster: string; alt: string }

// Only the files Christine named herself. Nothing from the untouched IMG_#### pile, and
// no arrangement appears twice — the ones already used as holiday cards are not repeated
// here, and second angles of the same vase are left out.
export const GALLERY: GalleryItem[] = [
  { kind: 'image', src: g01, alt: 'A long banquet table run in autumn colors' },
  { kind: 'video', src: '/media/gv01-adhoc-one.mp4', poster: gv01Poster, alt: 'A mixed seasonal arrangement' },
  { kind: 'image', src: g02, alt: 'Blush and cream blooms against black' },
  { kind: 'video', src: '/media/gv02-adhoc-two.mp4', poster: gv02Poster, alt: 'White chrysanthemums with pink roses' },
  { kind: 'image', src: g03, alt: 'A globe vase massed with extra large roses' },
  { kind: 'video', src: '/media/gv03-christmas-three.mp4', poster: gv03Poster, alt: 'A Christmas arrangement with red roses and lilies' },
  { kind: 'image', src: g04, alt: 'A bright mix of gerbera daisies' },
  { kind: 'image', src: g05, alt: 'A Christmas arrangement with winterberry and pine' },
]
