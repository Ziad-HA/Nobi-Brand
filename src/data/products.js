const img = (name) => `${import.meta.env.BASE_URL}images/${name}.jpg`
 export const products = [
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'Drop 09', colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], soldOut: false, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'New', colors: ['Black'], sizes: ['XS', 'S', 'M', 'L', 'XL'], soldOut: false, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'Core', colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], soldOut: false, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'Limited', colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], soldOut: false, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'Core', colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], soldOut: false, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'New', colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], soldOut: false, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'Core', colors: ['Black'], sizes: ['OS'], soldOut: false, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
  { id: 'Corteiz T-Shirt', name: 'Corteiz T-Shirt', price: 99, category: 'Outerwear', tag: 'Archive', colors: ['Black'], sizes: ['S', 'M', 'L'], soldOut: true, images: [img('Cortiez1')], description: 'Heavyweight black cotton tee with a large oval emblem printed across the back and a small matching mark on the chest. Oversized fit with a clean, structured neckline.' },
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