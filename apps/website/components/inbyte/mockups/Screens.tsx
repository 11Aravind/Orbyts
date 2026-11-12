import type { ReactNode } from 'react'
import { Check, ChevronLeft, CakeSlice, Coffee, Croissant, Minus, Pizza, Plus, Salad, Sandwich, ShoppingBag, Clock } from 'lucide-react'
import { MENU, type FoodIcon, type MenuItem } from '../data/menu'

const ICONS: Record<FoodIcon, typeof Pizza> = {
  pizza: Pizza,
  sandwich: Sandwich,
  coffee: Coffee,
  cake: CakeSlice,
  salad: Salad,
  croissant: Croissant,
}

export function FoodTile({ item, size = 48 }: { item: MenuItem; size?: number }) {
  const Icon = ICONS[item.icon]
  return (
    <span className="food-tile" style={{ background: item.tone, width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.5)} strokeWidth={1.8} />
    </span>
  )
}

export function PhoneFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="phone" role="img" aria-label={label ?? 'innbites customer ordering screen'}>
      <div className="phone-notch" />
      <div className="phone-screen">{children}</div>
    </div>
  )
}

function Bar({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="scr-bar">
      <div>
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </div>
      <span className="scr-cart">
        <ShoppingBag size={16} />
        <i>2</i>
      </span>
    </div>
  )
}

export function MenuScreen() {
  return (
    <div className="scr">
      <Bar title="Sample Café" sub="Table 4" />
      <div className="scr-chips">
        <span className="on">Popular</span>
        <span>Mains</span>
        <span>Drinks</span>
        <span>Dessert</span>
      </div>
      <div className="scr-list">
        {MENU.map((m: MenuItem) => (
          <div className="scr-item" key={m.id}>
            <FoodTile item={m} />
            <div className="scr-item-text">
              <b>{m.name}</b>
              <small>{m.description}</small>
              <span>₹{m.price}</span>
            </div>
            <span className="scr-add" aria-hidden="true">
              <Plus size={14} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DetailScreen() {
  const m = MENU[1]
  return (
    <div className="scr">
      <div className="scr-back">
        <ChevronLeft size={18} /> Back
      </div>
      <div className="scr-hero" style={{ background: m.tone }}>
        <FoodTile item={m} size={84} />
      </div>
      <div className="scr-title">
        <b>{m.name}</b>
        <span>₹{m.price}</span>
      </div>
      <div className="scr-label">Ingredients</div>
      <div className="scr-tags">
        {m.ingredients.map((i: string) => (
          <span key={i}>{i}</span>
        ))}
      </div>
      <div className="scr-label">Allergens</div>
      <div className="scr-tags warn">
        {m.allergens.map((i: string) => (
          <span key={i}>{i}</span>
        ))}
      </div>
      <div className="scr-label">Your preferences</div>
      <div className="scr-toggles">
        <span className="on">
          <Check size={12} /> Less mayonnaise
        </span>
        <span className="on">
          <Check size={12} /> No onion
        </span>
        <span>Extra cheese</span>
      </div>
      <div className="scr-cta">Add to cart · ₹{m.price}</div>
    </div>
  )
}

export function CartScreen() {
  const lines = [
    { item: MENU[1], qty: 1 },
    { item: MENU[2], qty: 2 },
  ]
  const total = lines.reduce((s, l) => s + l.item.price * l.qty, 0)
  return (
    <div className="scr">
      <div className="scr-back">
        <ChevronLeft size={18} /> Your order · Table 4
      </div>
      <div className="scr-list">
        {lines.map(({ item, qty }) => (
          <div className="scr-item" key={item.id}>
            <FoodTile item={item} size={42} />
            <div className="scr-item-text">
              <b>{item.name}</b>
              <span>₹{item.price * qty}</span>
            </div>
            <span className="scr-qty">
              <Minus size={12} /> {qty} <Plus size={12} />
            </span>
          </div>
        ))}
      </div>
      <div className="scr-sum">
        <span>Total</span>
        <b>₹{total}</b>
      </div>
      <div className="scr-label">Payment</div>
      <div className="scr-pay on">Pay online</div>
      <div className="scr-pay">Pay at restaurant</div>
      <div className="scr-cta">Place order</div>
    </div>
  )
}

const TRACK = ['Accepted', 'Preparing', 'Ready', 'Completed']

export function TrackingScreen({ active = 1 }: { active?: number }) {
  return (
    <div className="scr">
      <div className="scr-back">Order #1024 · Table 4</div>
      <div className="scr-eta">
        <Clock size={16} /> Ready in about 12 min
      </div>
      <ol className="scr-track">
        {TRACK.map((t, i) => (
          <li key={t} className={i < active ? 'done' : i === active ? 'now' : ''}>
            <span>{i < active ? <Check size={12} /> : i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
      <div className="scr-label">Items</div>
      <div className="scr-summary-line">1× Classic Club Sandwich</div>
      <div className="scr-summary-line">2× Cold Coffee</div>
    </div>
  )
}
