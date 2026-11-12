'use client';

import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { SITE } from './data/site';
import { Button, Section, SectionHeading } from './ui';
import { CartScreen, DetailScreen, MenuScreen, PhoneFrame, TrackingScreen } from './mockups/Screens';

const TABS = [
  { id: 'menu', label: 'Digital menu', text: 'Photos, prices, categories and availability at a glance.', screen: <MenuScreen /> },
  { id: 'details', label: 'Food details', text: 'Ingredients, allergens and custom preferences before ordering.', screen: <DetailScreen /> },
  { id: 'cart', label: 'Cart & checkout', text: 'Review the order and pay online or at the restaurant.', screen: <CartScreen /> },
  { id: 'tracking', label: 'Order tracking', text: 'Customers follow progress from accepted to completed.', screen: <TrackingScreen /> },
];

export default function InByteLiveDemo() {
  const [active, setActive] = useState('menu');
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <Section id="live-demo" tone="alt" labelledBy="demo-title">
      <SectionHeading
        id="demo-title"
        eyebrow="Live demo"
        title="See Innbites in Action."
        subtitle="Preview the customer journey here, then open the real demo on your own phone."
      />
      <div className="demo-grid">
        <div className="demo-phone">
          <PhoneFrame label={`innbites ${tab.label} preview`}>{tab.screen}</PhoneFrame>
        </div>
        <div className="demo-side">
          <div role="tablist" aria-label="Product preview screens" className="demo-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active === t.id}
                aria-controls="demo-panel"
                className={active === t.id ? 'is-active' : ''}
                onClick={() => setActive(t.id)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>
          <p id="demo-panel" role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="demo-text">
            {tab.text}
          </p>
          <Button size="lg" href={SITE.demoUrl}>
            Explore Live Demo <ExternalLink size={16} />
          </Button>

          <div className="video" role="img" aria-label="Product demonstration video placeholder">
            <button type="button" className="video-play" aria-label="Demo video coming soon" disabled>
              <Play size={26} fill="currentColor" />
            </button>
            <div className="video-text">
              <b>Product demo video</b>
              <small>Coming soon. Live interactive ordering simulation.</small>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

