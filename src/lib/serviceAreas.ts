// Service-area pages. Each is written to be genuinely distinct — real neighborhoods,
// a real local angle, a different opening — because near-identical "doorway" pages get
// a site demoted rather than ranked. The shared offering (prices, 48h notice, free
// delivery) is the same because it truthfully is; the uniqueness lives in the lead copy,
// the neighborhoods, and the meta.

export type ServiceArea = {
  slug: string
  city: string
  title: string // <title>
  metaDescription: string
  // The distinctive opening — no two cities share this.
  lead: string
  // A real local angle for this specific city.
  angle: { heading: string; body: string }
  neighborhoods: string[]
  faq: { q: string; a: string }[]
}

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: 'mesa',
    city: 'Mesa',
    title: 'Flower Delivery in Mesa, AZ | Luna’s Bouquet',
    metaDescription:
      'Fresh, hand-tied flower arrangements delivered free across Mesa — Las Sendas, Red Mountain, Eastmark and beyond. Seasonal bouquets $125, or 100 roses for $275. 48 hours notice.',
    lead: 'Mesa is home. A good share of what we make is delivered right here — to homes off Ivyglen and Culver, out toward Las Sendas, and across the east valley — so we know the streets, the gated turns, and how to get a delivery to your door on time.',
    angle: {
      heading: 'We know Mesa’s east side',
      body: 'From the Red Mountain foothills to Eastmark and Las Sendas, a lot of Mesa is newer master-planned neighborhoods with gates and guard entries. Add your gate code when you order and we handle the rest — no missed deliveries, no flowers left in the heat.',
    },
    neighborhoods: ['Las Sendas', 'Red Mountain', 'Eastmark', 'Dobson Ranch', 'Alta Mesa', 'Superstition Springs'],
    faq: [
      {
        q: 'Do you deliver anywhere in Mesa?',
        a: 'Yes — free delivery across all of Mesa, including the gated communities on the east side. We just ask for 48 hours notice.',
      },
      {
        q: 'How much is flower delivery in Mesa?',
        a: 'Delivery is free. A seasonal arrangement is $125 with the vase included; a 100-rose arrangement is $275.',
      },
    ],
  },
  {
    slug: 'scottsdale',
    city: 'Scottsdale',
    title: 'Flower Delivery in Scottsdale, AZ | Luna’s Bouquet',
    metaDescription:
      'Elegant, hand-tied flower arrangements delivered free across Scottsdale — North Scottsdale, McCormick Ranch, Scottsdale Mountain. Seasonal bouquets $125, 100 roses $275. 48 hours notice.',
    lead: 'Scottsdale asks for flowers that hold their own — in a foyer with tall ceilings, on a long dining table, at a gathering that took real planning. We hand-tie each arrangement to look considered rather than store-bought, and deliver it free anywhere in the city.',
    angle: {
      heading: 'Built for Scottsdale’s gated estates',
      body: 'Much of North Scottsdale sits behind gates — sometimes two, right next to each other, like the blocks up by Scottsdale Mountain. Leave your gate code and any “it’s the second entrance” detail in your order, and we’ll find the door.',
    },
    neighborhoods: ['North Scottsdale', 'McCormick Ranch', 'Scottsdale Mountain', 'Gainey Ranch', 'Grayhawk', 'DC Ranch'],
    faq: [
      {
        q: 'Do you deliver to North Scottsdale?',
        a: 'Yes — all of Scottsdale, including the gated communities in the north. Free delivery, 48 hours notice.',
      },
      {
        q: 'Can you deliver a large statement arrangement?',
        a: 'Yes. Our 100-rose arrangement ($275) is our biggest, and custom designs start at $375 for events and one-off pieces.',
      },
    ],
  },
  {
    slug: 'gilbert',
    city: 'Gilbert',
    title: 'Flower Delivery in Gilbert, AZ | Luna’s Bouquet',
    metaDescription:
      'Fresh flower arrangements delivered free across Gilbert — Val Vista Lakes, Power Ranch, Seville. Seasonal bouquets $125, 100 roses $275. Order 48 hours ahead.',
    lead: 'Gilbert is a town of front porches and family occasions — birthdays, new babies, a “thinking of you” on a hard week. Those are exactly the moments we love to make flowers for, hand-tied and delivered free to your door.',
    angle: {
      heading: 'For Gilbert’s everyday celebrations',
      body: 'Whether it’s a Halifax Circle cul-de-sac or a house in Seville, most of Gilbert is easy porch-drop delivery. Tell us where to leave it if you won’t be home, and we’ll place it in the shade, out of the afternoon sun.',
    },
    neighborhoods: ['Val Vista Lakes', 'Power Ranch', 'Seville', 'Agritopia', 'Higley Groves', 'Lyon’s Gate'],
    faq: [
      {
        q: 'Is flower delivery in Gilbert really free?',
        a: 'Yes — free across all of Gilbert, with 48 hours notice so we can source the freshest flowers for your date.',
      },
      {
        q: 'Can I have flowers left at the door?',
        a: 'Of course. Add a note with where to leave them and we’ll place them in the shade, away from the heat.',
      },
    ],
  },
  {
    slug: 'chandler',
    city: 'Chandler',
    title: 'Flower Delivery in Chandler, AZ | Luna’s Bouquet',
    metaDescription:
      'Hand-tied flower arrangements delivered free across Chandler — Ocotillo, Fulton Ranch, Downtown Chandler. Seasonal bouquets $125, 100 roses $275. 48 hours notice.',
    lead: 'Chandler mixes lakeside neighborhoods with a downtown that’s become a real destination. Wherever you’re sending flowers — a home on the water in Ocotillo or an office near downtown — we hand-tie the arrangement and deliver it free.',
    angle: {
      heading: 'From Ocotillo to downtown',
      body: 'Chandler runs from the lakes of Ocotillo and Fulton Ranch up to the shops and restaurants downtown. Corporate and nonprofit deliveries are welcome too — just give us the front-desk or reception details when you order.',
    },
    neighborhoods: ['Ocotillo', 'Fulton Ranch', 'Downtown Chandler', 'Sun Groves', 'Clemente Ranch', 'Pecos Ranch'],
    faq: [
      {
        q: 'Do you deliver to offices in Chandler?',
        a: 'Yes — homes and businesses. For an office, add the reception or front-desk details so we can hand it off. Delivery is free with 48 hours notice.',
      },
      {
        q: 'What does a Chandler flower delivery cost?',
        a: 'Delivery is free. A seasonal arrangement is $125 with vase; 100 roses is $275.',
      },
    ],
  },
  {
    slug: 'paradise-valley',
    city: 'Paradise Valley',
    title: 'Flower Delivery in Paradise Valley, AZ | Luna’s Bouquet',
    metaDescription:
      'Refined, hand-tied flower arrangements delivered free across Paradise Valley. Seasonal bouquets $125, 100 roses $275, custom designs from $375. 48 hours notice.',
    lead: 'Paradise Valley is a place of long private drives and quiet estates — the kind of setting where a beautiful arrangement makes an entrance feel complete. We design each one by hand and deliver it free, with the discretion the address deserves.',
    angle: {
      heading: 'Discreet delivery to private estates',
      body: 'Most of Paradise Valley sits behind gates and long driveways. Leave your gate code and any access notes in the order, and we’ll deliver quietly to the door — and never leave fresh flowers out in the desert heat.',
    },
    neighborhoods: ['Camelback', 'Mummy Mountain', 'Cheney Estates', 'Clearwater Hills', 'Casa Blanca', 'Tatum Canyon'],
    faq: [
      {
        q: 'Do you deliver to gated homes in Paradise Valley?',
        a: 'Yes. Add your gate code and access details when you order and we’ll handle the rest. Free delivery, 48 hours notice.',
      },
      {
        q: 'Can you create something for a private event?',
        a: 'Yes — custom arrangements and event work start at $375, designed around your setting and colors.',
      },
    ],
  },
]

export const areaBySlug = (slug: string) => SERVICE_AREAS.find((a) => a.slug === slug)
