
const img = (name) => `${import.meta.env.BASE_URL}images/${name}.jpg`

const productImg = (number) =>
  `${import.meta.env.BASE_URL}nobi/${number}.jpg`

export const products = [
  {
    id: 'nobi-game-changers-raglan',
    season: 's26',
    name: 'Game Changers Raglan Jersey',
    price: 95,
    category: 'Tops',
    tag: 'Drop 26',
    colors: ['Off-White / Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [productImg(1)],
    description: 'Heavyweight pinstripe cotton raglan with contrast black sleeves and vintage heraldic crest print. Cut with an exaggerated boxy silhouette and ribbed collar, crafted for late-night movement.'
  },
  {
    id: 'nobi-contour-track-jacket',
    season: 's26',
    name: 'Night Contour Track Jacket',
    price: 135,
    category: 'Outerwear',
    tag: 'Core',
    colors: ['Pitch Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [productImg(2)],
    description: 'Technical matte nylon zip jacket featuring high-contrast white contour piping along the spine and sleeves. Finished with bold archival back typography, funnel neck, and elasticated storm cuffs.'
  },
  {
    id: 'nobi-washed-charcoal-hoodie',
    season: 's26',
    name: 'Washed Charcoal Heavy Hoodie',
    price: 115,
    category: 'Outerwear',
    tag: 'Limited',
    colors: ['Washed Charcoal'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [productImg(3)],
    description: '460 GSM custom-milled brushed French terry fleece in a vintage stone-wash treatment. Dropped shoulder cut with seamless kangaroo pocket, double-layered hood, and raw distressed seam detailing.'
  },
  {
    id: 'nobi-arabic-script-baggy-denim',
    season: 's26',
    name: 'Archival Arabic Script Denim',
    price: 125,
    category: 'Bottoms',
    tag: 'Drop 26',
    colors: ['Washed Indigo Blue'],
    sizes: ['30', '32', '34', '36'],
    soldOut: false,
    images: [productImg(4)],
    description: '14.5oz rigid raw-feel denim with an extreme wide-leg puddle drape and heavy sneaker stack. Features custom white Arabic script embroidery across back pockets and reinforced rivet construction.'
  },
  {
    id: 'nobi-night-contour-track-pants',
    season: 's26',
    name: 'Night Contour Track Pants',
    price: 105,
    category: 'Bottoms',
    tag: 'New',
    colors: ['Pitch Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [productImg(5)],
    description: 'Relaxed nylon track trousers mirroring the jacket with sweeping white contour lines along the outer legs. Elastic waistband with extended drawstring and zippered hems for custom silhouette flared stacking.'
  },
  {
    id: 'nobi-editorial-tracksuit-set',
    season: 's26',
    name: 'Contour Tracksuit Full Set',
    price: 220,
    category: 'Outerwear',
    tag: 'Exclusive',
    colors: ['Pitch Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [productImg(6)],
    description: 'Complete night uniform set comprising the contour track jacket and matching flared track trousers. Engineered in ultra-durable matte windbreaker nylon with distinctive fluid contour architecture.'
  },
  {
    id: 'nobi-tactical-knit-balaclava',
    season: 's26',
    name: 'Tactical Changer Balaclava',
    price: 45,
    category: 'Accessories',
    tag: 'Core',
    colors: ['Pitch Black'],
    sizes: ['One Size'],
    soldOut: false,
    images: [productImg(7)],
    description: 'Heavyweight thermal rib-knit tactical balaclava with contrast white jacquard lettering on the brow. Breathable, secure stretch fit engineered for night rides and sub-zero layered styling.'
  },
]

export const lookbook = [
  { id: 1, city: 'S26', image: img('S26') },
  { id: 2, city: 'S25', image: img('S25') },
  { id: 3, city: 'S24', image: img('S24') },
  { id: 4, city: 'S23', image: img('S23') },
  { id: 5, city: 'S22', image: img('S22') },
  { id: 6, city: 'S21', image: img('S21') },
]

export const categories = [
  'All',
  'Outerwear',
  'Tops',
  'Bottoms',
  'Accessories'
]
