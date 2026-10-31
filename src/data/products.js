const img = (name) => `${import.meta.env.BASE_URL}images/${name}.jpg`

export const products = [
  {
    id: 'corteiz-tshirt-1',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'Drop 00',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
  },
  {
    id: 'corteiz-tshirt-2',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'New',
    colors: ['Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
  },
  {
    id: 'corteiz-tshirt-3',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'Core',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
  },
  {
    id: 'corteiz-tshirt-4',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'Limited',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
  },
  {
    id: 'corteiz-tshirt-5',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'Core',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
  },
  {
    id: 'corteiz-tshirt-6',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'New',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
  },
  {
    id: 'corteiz-tshirt-7',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'Core',
    colors: ['Black'],
    sizes: ['OS'],
    soldOut: false,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
  },
  {
    id: 'corteiz-tshirt-8',
    name: 'Corteiz T-Shirt',
    price: 99,
    category: 'Outerwear',
    tag: 'Archive',
    colors: ['Black'],
    sizes: ['S', 'M', 'L'],
    soldOut: true,
    images: [img('Cortiez1')],
    description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.'
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
    images: [img('Cortiez1')],
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
    images: [img('Cortiez1')],
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
    images: [img('Cortiez1')],
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
    images: [img('Cortiez1')],
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