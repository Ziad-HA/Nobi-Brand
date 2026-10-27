export const products = [
  {
    id: 'shadow-core-hoodie',
    name: 'Shadow Core Hoodie',
    price: 148,
    category: 'Outerwear',
    tag: 'Drop 09',
    colors: ['Ink', 'Ash'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: ['/images/hoodie.jpg', '/images/hoodie-2.jpg'],
    description:
      'Heavy 460gsm fleece with a dropped shoulder and double-lined hood. Cut oversized so it sits like armor without the bulk.',
  },
  {
    id: 'volt-graphic-tee',
    name: 'Volt Graphic Tee',
    price: 68,
    category: 'Tops',
    tag: 'New',
    colors: ['Black', 'Volt'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    soldOut: false,
    images: ['/images/tee.jpg', '/images/tee-2.jpg'],
    description:
      'Boxy 240gsm cotton with a cracked-ink KAGE mark. Pre-washed so the drape is broken in from day one.',
  },
  {
    id: 'night-cargo',
    name: 'Night Cargo',
    price: 164,
    category: 'Bottoms',
    tag: 'Core',
    colors: ['Black', 'Olive'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: ['/images/cargo.jpg', '/images/pants.jpg'],
    description:
      'Relaxed cargo with articulated knees and hidden zip pockets. Built for late trains and longer nights.',
  },
  {
    id: 'rift-bomber',
    name: 'Rift Bomber',
    price: 248,
    category: 'Outerwear',
    tag: 'Limited',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: ['/images/bomber.jpg', '/images/jacket.jpg'],
    description:
      'Matte nylon shell, quilted lining, and a cropped hem that hits at the hip. Hardware in raw black steel.',
  },
  {
    id: 'ashline-longsleeve',
    name: 'Ashline Longsleeve',
    price: 88,
    category: 'Tops',
    tag: 'Core',
    colors: ['Ash', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: ['/images/longsleeve.jpg', '/images/tee-2.jpg'],
    description:
      'Elongated sleeve, raw cuff, and a faint tonal print down the spine. Everyday layer that still reads editorial.',
  },
  {
    id: 'track-cut',
    name: 'Track Cut Pant',
    price: 128,
    category: 'Bottoms',
    tag: 'New',
    colors: ['Black', 'Grey'],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: false,
    images: ['/images/track.jpg', '/images/pants.jpg'],
    description:
      'Tapered track pant with contrast piping and an elasticated waist. Soft shell that still holds a sharp line.',
  },
  {
    id: 'panel-cap',
    name: 'Five Panel Cap',
    price: 48,
    category: 'Accessories',
    tag: 'Core',
    colors: ['Black', 'Volt'],
    sizes: ['OS'],
    soldOut: false,
    images: ['/images/cap.jpg', '/images/cap-2.jpg'],
    description:
      'Structured five-panel with a low profile and embroidered KAGE mark. One size, internal adjuster.',
  },
  {
    id: 'utility-vest',
    name: 'Utility Vest',
    price: 186,
    category: 'Outerwear',
    tag: 'Archive',
    colors: ['Black'],
    sizes: ['S', 'M', 'L'],
    soldOut: true,
    images: ['/images/jacket.jpg', '/images/bomber.jpg'],
    description:
      'Sleeveless shell with stacked pockets and a two-way zip. Sold through — join the waitlist on restock.',
  },
]

export const lookbook = [
  { id: 1, city: 'Osaka', image: '/images/look-osaka.jpg' },
  { id: 2, city: 'Berlin', image: '/images/look-berlin.jpg' },
  { id: 3, city: 'London', image: '/images/look-london.jpg' },
  { id: 4, city: 'Seoul', image: '/images/look-seoul.jpg' },
  { id: 5, city: 'NYC', image: '/images/look-nyc.jpg' },
  { id: 6, city: 'Tokyo', image: '/images/look-tokyo.jpg' },
]

export const categories = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Accessories']
