/** Sample menu used only inside the product mockups. */
export type FoodIcon = 'pizza' | 'sandwich' | 'coffee' | 'cake' | 'salad' | 'croissant'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  icon: FoodIcon
  tone: string
  veg: boolean
  ingredients: string[]
  allergens: string[]
}

export const MENU: MenuItem[] = [
  {
    id: 'pizza',
    name: 'Margherita Pizza',
    description: 'Tomato, mozzarella and fresh basil',
    price: 349,
    icon: 'pizza',
    tone: '#ffe9d6',
    veg: true,
    ingredients: ['Wheat dough', 'Tomato', 'Mozzarella', 'Basil'],
    allergens: ['Gluten', 'Dairy'],
  },
  {
    id: 'club',
    name: 'Classic Club Sandwich',
    description: 'Grilled chicken, lettuce and mayo',
    price: 229,
    icon: 'sandwich',
    tone: '#e5f4ff',
    veg: false,
    ingredients: ['Bread', 'Chicken', 'Lettuce', 'Mayonnaise', 'Onion'],
    allergens: ['Gluten', 'Egg'],
  },
  {
    id: 'coffee',
    name: 'Cold Coffee',
    description: 'Chilled and creamy',
    price: 149,
    icon: 'coffee',
    tone: '#f3eadf',
    veg: true,
    ingredients: ['Coffee', 'Milk', 'Ice', 'Sugar'],
    allergens: ['Dairy'],
  },
  {
    id: 'cake',
    name: 'Chocolate Truffle Slice',
    description: 'Rich and moist, served chilled',
    price: 189,
    icon: 'cake',
    tone: '#ffe3ec',
    veg: true,
    ingredients: ['Cocoa', 'Flour', 'Cream', 'Sugar'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
  },
]
