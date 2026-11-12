import { Bell, Check, CreditCard, Store, Wallet } from 'lucide-react'
import type { PreviewKind } from '../data/content'
import { FoodTile } from './Screens'
import { MENU, type MenuItem } from '../data/menu'

function QrArt() {
  // 9x9 pseudo-QR pattern, drawn as SVG squares
  const rows = ['111111101', '100000101', '101110101', '101110100', '101110111', '100000100', '111111101', '000000011', '110101101']
  return (
    <svg viewBox="0 0 9 9" className="qr-art" aria-hidden="true">
      {rows.flatMap((r, y) =>
        r.split('').map((c, x) => (c === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" rx="0.15" /> : null)),
      )}
    </svg>
  )
}

export function FeaturePreview({ kind }: { kind: PreviewKind }) {
  switch (kind) {
    case 'qr':
      return (
        <div className="fp fp-qr" aria-hidden="true">
          <QrArt />
          <span>Table 4</span>
        </div>
      )
    case 'menu':
      return (
        <div className="fp fp-menu" aria-hidden="true">
          {MENU.slice(0, 3).map((m: MenuItem) => (
            <div key={m.id}>
              <FoodTile item={m} size={36} />
              <b>₹{m.price}</b>
            </div>
          ))}
        </div>
      )
    case 'allergen':
      return (
        <div className="fp fp-chips" aria-hidden="true">
          <span>Tomato</span>
          <span>Mozzarella</span>
          <span className="warn">Gluten</span>
          <span className="warn">Dairy</span>
        </div>
      )
    case 'prefs':
      return (
        <div className="fp fp-prefs" aria-hidden="true">
          <span className="on">
            <Check size={12} /> No onion
          </span>
          <span className="on">
            <Check size={12} /> Less mayonnaise
          </span>
          <span>Extra cheese</span>
        </div>
      )
    case 'cart':
      return (
        <div className="fp fp-cart" aria-hidden="true">
          <div>
            <span>2× Sandwich</span>
            <b>₹458</b>
          </div>
          <div>
            <span>1× Cold Coffee</span>
            <b>₹149</b>
          </div>
          <div className="total">
            <span>Total</span>
            <b>₹607</b>
          </div>
        </div>
      )
    case 'payments':
      return (
        <div className="fp fp-pay" aria-hidden="true">
          <span className="on">
            <CreditCard size={14} /> Pay online
          </span>
          <span>
            <Wallet size={14} /> Pay at restaurant
          </span>
        </div>
      )
    case 'notify':
      return (
        <div className="fp fp-notify" aria-hidden="true">
          <Bell size={16} />
          <div>
            <b>New order · Table 4</b>
            <small>3 items · just now</small>
          </div>
        </div>
      )
    case 'tracking':
      return (
        <div className="fp fp-track" aria-hidden="true">
          {['Accepted', 'Preparing', 'Ready', 'Completed'].map((t, i) => (
            <span key={t} className={i === 0 ? 'done' : i === 1 ? 'now' : ''}>
              <i />
              {t}
            </span>
          ))}
        </div>
      )
    case 'manage':
      return (
        <div className="fp fp-manage" aria-hidden="true">
          <div>
            <small>New</small>
            <span>#1026</span>
          </div>
          <div>
            <small>Preparing</small>
            <span>#1024</span>
            <span>#1025</span>
          </div>
          <div>
            <small>Ready</small>
            <span>#1023</span>
          </div>
        </div>
      )
    case 'multiqr':
      return (
        <div className="fp fp-multi" aria-hidden="true">
          {['T1', 'T2', 'T3', 'Bar', 'Patio', 'Room 12'].map((t) => (
            <span key={t}>
              <Store size={12} /> {t}
            </span>
          ))}
        </div>
      )
  }
}
