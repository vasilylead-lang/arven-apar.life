// Single source of truth for names, numbers and copy used across the page and
// in the JSON-LD block in index.html. Keep the two in sync when editing.

export const SITE = {
  name: 'ARVEN',
  tagline: 'A Private Alpine Reserve',
  origin: 'https://arven-apar.life',
  valley: "Val d'Hérens",
  canton: 'Valais, Switzerland',
  coords: '46°06′ N · 07°30′ E',
  hectares: 4000,
  altitudeLow: 1780,
  altitudeHigh: 3240,
  doors: 22,
  email: 'enquiries@arven-apar.life',
  phone: '+41 27 000 00 00',
}

export const SECTIONS = [
  { id: 'reserve', index: '01', label: 'The Reserve' },
  { id: 'atmosphere', index: '02', label: 'Atmosphere' },
  { id: 'colony', index: '03', label: 'The Colony' },
  { id: 'settlement', index: '04', label: 'The Settlement' },
  { id: 'collection', index: '05', label: 'The Collection' },
  { id: 'enquire', index: '06', label: 'Enquire' },
]

// Anchors are x/z in model space (the slab is 100 x 76, centred on the origin).
// The marker's height is sampled off the generated terrain at runtime, so the
// pins always sit on the surface. See src/three/terrain.js.
export const LOCATIONS = [
  {
    id: 'refuge',
    name: 'Le Refuge',
    kind: 'The lodge',
    altitude: 1840,
    anchor: [-2, 19],
    note: 'Eleven rooms, a long table, and the only road in. Built in 1948 as a customs post; the stone is original.',
  },
  {
    id: 'cembraie',
    name: 'La Cembraie',
    kind: 'The arolla forest',
    altitude: 2050,
    anchor: [18, 14],
    note: 'Four hundred hectares of Pinus cembra, none of it planted by us. The oldest trees were seedlings before the Reformation.',
  },
  {
    id: 'lac-noir',
    name: 'Lac Noir',
    kind: 'The tarn',
    altitude: 2310,
    anchor: [-4, 9],
    note: 'Ice-free for eleven weeks a year. Fed entirely by snowmelt, so it runs clear to the bottom by August.',
  },
  {
    id: 'arete',
    name: "L'Arête",
    kind: 'The ridge',
    altitude: 3240,
    anchor: [12, -29],
    note: 'The reserve’s northern boundary and its highest ground. On a föhn day you can see into three cantons.',
  },
  {
    id: 'observatoire',
    name: "L'Observatoire",
    kind: 'The dark-sky station',
    altitude: 2690,
    anchor: [-30, -14],
    note: 'A Bortle 2 sky. No permanent light source within nine kilometres, and none permitted inside the boundary.',
  },
  {
    id: 'caches',
    name: 'Les Caches',
    kind: 'The homesites',
    altitude: 1960,
    anchor: [26, 2],
    note: 'Fourteen parcels on the ridge shoulder, sited so that no two are within sight of one another.',
  },
]

export const BIRDS = [
  {
    id: 'nutcracker',
    name: 'Spotted Nutcracker',
    latin: 'Nucifraga caryocatactes',
    french: 'Casse-noix moucheté',
    stat: '100,000',
    statLabel: 'seeds cached per bird, per autumn',
    image: 'nutcracker',
    body: 'The arolla pine cannot open its own cones. It depends entirely on this bird, which prises the seeds out and buries them in thousands of small caches across the slope. The caches it never returns for become the forest. Every cembraie in the Alps — including ours — was planted by nutcrackers.',
  },
  {
    id: 'lammergeier',
    name: 'Bearded Vulture',
    latin: 'Gypaetus barbatus',
    french: 'Gypaète barbu',
    stat: '2.8 m',
    statLabel: 'wingspan',
    image: 'lammergeier',
    body: 'Shot out of the Alps entirely — the last wild Alpine bird was killed in 1913. Reintroduction began in 1986, and the first chick to fledge in the wild in almost a century flew in 1997. It lives on bone, which it drops onto rock until it breaks.',
  },
  {
    id: 'chough',
    name: 'Alpine Chough',
    latin: 'Pyrrhocorax graculus',
    french: 'Chocard à bec jaune',
    stat: '6,500 m',
    statLabel: 'highest recorded nest',
    image: 'chough',
    body: 'It breeds higher than any other bird on earth and has followed expeditions above 8,000 metres on Everest. Yellow bill, red legs, and a habit of arriving the moment you stop walking. The flock over L’Arête runs to two hundred birds in October.',
  },
  {
    id: 'eagle',
    name: 'Golden Eagle',
    latin: 'Aquila chrysaetos',
    french: 'Aigle royal',
    stat: '1 pair',
    statLabel: 'holds the whole reserve as territory',
    image: 'eagle',
    body: 'A breeding pair defends fifty to a hundred square kilometres, which means the whole of ARVEN sits inside a single territory. The same two birds have held the ridge since we began keeping records. You will hear the choughs announce them before you see them.',
  },
]

export const OFFERINGS = [
  {
    id: 'lodge',
    index: '01',
    name: 'The Lodge Residences',
    count: 8,
    price: 'from CHF 6.4 m',
    image: 'interior',
    spec: [
      ['Configuration', 'Turn-key, three to five bedrooms'],
      ['Position', 'Woven into Le Refuge'],
      ['Included', 'Full lodge service, rental programme optional'],
    ],
    body: 'Eight residences built into the fabric of the lodge itself, finished and furnished. You arrive to a lit fire and leave without closing the house down.',
  },
  {
    id: 'caches',
    index: '02',
    name: 'The Caches',
    count: 14,
    price: 'from CHF 1.9 m',
    image: 'homesite',
    spec: [
      ['Configuration', 'Private homesites, built to your architect'],
      ['Parcel', '0.8 to 2.1 hectares'],
      ['Covenant', 'One dwelling, no ridge-line silhouettes, no exterior light above 2700 K'],
    ],
    body: 'Fourteen parcels on the ridge shoulder. We sited them the way the nutcracker sites its caches — scattered, and never two within sight of one another.',
  },
]

export const COLLECTION = [
  {
    id: 'valletta-alta',
    name: 'Valletta Alta',
    region: 'Dolomites, Alto Adige',
    country: 'Italy',
    hectares: '2,600 ha',
    doors: '18 residences',
    status: 'Open',
    image: 'dolomites',
  },
  {
    id: 'havstind',
    name: 'Havstind',
    region: 'Lofoten',
    country: 'Norway',
    hectares: '1,900 ha',
    doors: '12 residences',
    status: 'Releasing 2027',
    image: 'lofoten',
  },
  {
    id: 'cairn-dubh',
    name: 'Cairn Dubh',
    region: 'Cairngorms',
    country: 'Scotland',
    hectares: '5,400 ha',
    doors: '16 residences',
    status: 'Enquiries open',
    image: 'cairngorms',
  },
  {
    id: 'pic-de-lours',
    name: "Pic de l'Ours",
    region: 'Ariège Pyrenees',
    country: 'France',
    hectares: '3,100 ha',
    doors: '20 residences',
    status: 'Releasing 2028',
    image: 'pyrenees',
  },
]
