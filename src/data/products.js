
const img = (name) => `${import.meta.env.BASE_URL}images/${name}.jpg`

const productImg = (number) =>
  `${import.meta.env.BASE_URL}nobi/${number}.jpg`

export const products = [
  {
<<<<<<< HEAD
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
=======
    id: 'nobi-signal-tee',
    name: 'Signal Tee',
    price: 45,
    category: 'Tops',
    tag: 'Drop 00',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('tee-signal'), img('tee-signal-front')],
    description: 'Boxy heavyweight black tee with an oversized NOBI signal-wave graphic across the back and a mini wave mark on the chest. Cracked ink print, dropped shoulders and a clean ribbed collar.'
  },
  {
    id: 'nobi-after-hours-tee',
    name: 'After Hours Tee',
    price: 48,
    category: 'Tops',
    tag: 'New',
    colors: ['Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('tee-afterhours'), img('tee-afterhours-front')],
    description: 'A crescent moon over the city skyline printed large across the back, with a tiny moon on the chest. Oversized black tee made for the late shift.'
  },
  {
    id: 'nobi-static-tee',
    name: 'Static Tee',
    price: 42,
    category: 'Tops',
>>>>>>> 3546285a82257991cb529a8cd051b16bccacef79
    tag: 'Core',
    colors: ['Pitch Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
<<<<<<< HEAD
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
=======
    images: [img('tee-static'), img('tee-static-front')],
    description: 'Glitched NO SIGNAL graphic with scan-line slices and a barcode strip on the back, small N mark on the chest. Heavy black cotton in a relaxed, oversized fit.'
  },
  {
    id: 'nobi-orbit-tee',
    name: 'Orbit Tee',
    price: 55,
    category: 'Tops',
    tag: 'Limited',
    colors: ['Black'],
    sizes: ['S', 'M', 'L'],
    soldOut: false,
    images: [img('tee-orbit'), img('tee-orbit-front')],
    description: 'Limited run. A lime orbit-ring graphic with arced NOBI ORBIT CLUB lettering on the back and a matching mini ring on the chest. Boxy black tee, small batch only.'
  },
  {
    id: 'nobi-concrete-tee',
    name: 'Concrete Tee',
    price: 50,
    category: 'Tops',
    tag: 'Core',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('tee-concrete'), img('tee-concrete-front')],
    description: 'Block-grid city graphic with CONCRETE lettering across the back and a small NOBI WORKS tag on the chest. Heavy black cotton, boxy cut, built hard.'
  },
  {
    id: 'nobi-barbed-n-tee',
    name: 'Barbed N Tee',
    price: 52,
    category: 'Tops',
    tag: 'New',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('tee-barbed'), img('tee-barbed-front')],
    description: 'A barbed-wire wreath wrapped around the NOBI N on the back, with a small N mark on the chest. Oversized black tee with a hard street edge.'
  },
  {
    id: 'nobi-core-logo-tee',
    name: 'Core Logo Tee',
    price: 35,
    category: 'Tops',
    tag: 'Core',
    colors: ['Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    soldOut: false,
    images: [img('tee-core'), img('tee-core-front')],
    description: 'The everyday NOBI tee. Big wordmark and glitch N across the back, small N on the chest. Heavyweight black cotton, oversized fit, ribbed collar.'
  },
  {
    id: 'nobi-archive-tee',
    name: 'Archive Tee',
    price: 38,
    category: 'Tops',
    tag: 'Archive',
    colors: ['Washed Grey'],
    sizes: ['S', 'M', 'L'],
    soldOut: true,
    images: [img('tee-archive'), img('tee-archive-front')],
    description: 'Washed grey tee with an all-over repeating NOBI text print on the back and a small ARCHIVE tag on the chest. A piece from the first drop, now sold out.'
  },

  {
    id: 's26-night-zip-hoodie',
    season: 's26',
    name: 'Night Zip Hoodie',
    price: 65,
    category: 'Outerwear',
    tag: 'S26',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('S26')],
    description: 'Heavyweight black zip hoodie with oversized fit and bold back graphics. Built for the night.'
  },
  {
    id: 's25-stitched-denim-jacket',
    season: 's25',
    name: 'Stitched Denim Jacket',
    price: 80,
    category: 'Outerwear',
    tag: 'S25',
    colors: ['Indigo'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('S25')],
    description: 'Raw indigo denim jacket with contrast stitching and a boxy, cropped cut.'
  },
  {
    id: 's24-wide-camo-cargo-pants',
    season: 's24',
    name: 'Wide Camo Cargo Pants',
    price: 70,
>>>>>>> 3546285a82257991cb529a8cd051b16bccacef79
    category: 'Bottoms',
    tag: 'Drop 26',
    colors: ['Washed Indigo Blue'],
    sizes: ['30', '32', '34', '36'],
    soldOut: false,
<<<<<<< HEAD
    images: [productImg(4)],
    description: '14.5oz rigid raw-feel denim with an extreme wide-leg puddle drape and heavy sneaker stack. Features custom white Arabic script embroidery across back pockets and reinforced rivet construction.'
=======
    images: [img('S24')],
    description: 'Wide-leg camo cargo pants with deep utility pockets and a relaxed drop.'
>>>>>>> 3546285a82257991cb529a8cd051b16bccacef79
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
<<<<<<< HEAD
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
=======
    images: [img('S23')],
    description: 'Washed grey fleece shorts with a printed side graphic and an easy fit.'
>>>>>>> 3546285a82257991cb529a8cd051b16bccacef79
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

<<<<<<< HEAD
export const categories = [
  'All',
  'Outerwear',
  'Tops',
  'Bottoms',
  'Accessories'
]
=======
export const categories = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Accessories']
>>>>>>> 3546285a82257991cb529a8cd051b16bccacef79
