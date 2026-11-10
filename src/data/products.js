const img = (name) => `${import.meta.env.BASE_URL}images/${name}.jpg`

export const products = [
  {
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
    tag: 'Core',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
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
    category: 'Bottoms',
    tag: 'S24',
    colors: ['Camo'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('S24')],
    description: 'Wide-leg camo cargo pants with deep utility pockets and a relaxed drop.'
  },
  {
    id: 's23-washed-grey-shorts',
    season: 's23',
    name: 'Washed Grey Shorts',
    price: 40,
    category: 'Bottoms',
    tag: 'S23',
    colors: ['Grey'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('S23')],
    description: 'Washed grey fleece shorts with a printed side graphic and an easy fit.'
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

export const categories = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Accessories']
