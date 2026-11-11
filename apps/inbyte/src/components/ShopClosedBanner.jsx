import React from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ShopClosedBanner({ variant = 'home', className = '' }) {
    const { t } = useLanguage();
    const description = variant === 'cart' ? t('shop_closed_cart_desc') : t('shop_closed_home_desc');

    return (
        <div
            role="alert"
            data-testid="shop-closed-banner"
            className={`bg-rose-50 border border-rose-200 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-xs ${className}`}
        >
            <div className="mt-0.5 bg-rose-100 text-rose-600 rounded-full p-1.5 shrink-0">
                <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[#171212] text-sm font-extrabold leading-tight">
                    {t('shop_closed_title')}
                </p>
                <p className="text-rose-700 text-xs font-semibold mt-0.5 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

