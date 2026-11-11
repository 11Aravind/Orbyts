import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from 'react-use-cart';
import ImageWithSkeleton from './ImageWithSkeleton';
import VegNonVegSymbol from './VegNonVegSymbol';
import DishPreviewModal from './DishPreviewModal';
import QuantityControl from './QuantityControl';
import { showAddToCartToast } from '../utils/toastUtils';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'react-hot-toast';

export default function FoodCard({
    id,
    image,
    images,
    name,
    price,
    basePrice,
    base_price,
    description,
    preparation,
    isAvailable = true,
    isPopular = false,
    isSpecial = false,
    isVeg = true,
    portions,
    className = ''
}) {
    const navigate = useNavigate();
    const { addItem, updateItemQuantity, removeItem, getItem, items } = useCart();
    const { t, getDishTitle, getDishDescription } = useLanguage();
    const { settings } = useSettings();
    const isShopClosed = Boolean(settings?.is_closed);
    const localizedName = getDishTitle(name);
    const localizedDescription = getDishDescription(description, name);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const matchingItems = (items || []).filter(
        (i) => String(i.dish_id || i.id) === String(id)
    );
    const quantity = matchingItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    const singleCartItem = getItem(id) || (matchingItems.length === 1 ? matchingItems[0] : null);

    const displayImage = (images && images.length > 0) ? images[0] : (image || '/placeholderfood.png');
    const rawPrice = Number(basePrice || base_price || price || 0);
    const formattedPrice = rawPrice.toFixed(2);

    const hasPortions = portions && portions.length > 1;

    const handleAddClick = (e) => {
        e.stopPropagation();
        if (!isAvailable) return;
        if (isShopClosed) {
            toast.error(t('shop_closed_btn'), { id: 'shop-closed-toast' });
            return;
        }
        if (hasPortions || matchingItems.length > 1) {
            setIsPreviewOpen(true);
        } else if (singleCartItem) {
            updateItemQuantity(singleCartItem.id, (Number(singleCartItem.quantity) || 0) + 1);
        } else {
            addItem({
                id,
                dish_id: id,
                name,
                price: rawPrice,
                image: displayImage,
                description
            }, 1);
            showAddToCartToast(name, navigate);
        }
    };

    const handleIncrease = (e) => {
        e.stopPropagation();
        if (!isAvailable) return;
        if (isShopClosed) {
            toast.error(t('shop_closed_btn'), { id: 'shop-closed-toast' });
            return;
        }
        if (hasPortions || matchingItems.length > 1) {
            setIsPreviewOpen(true);
        } else if (singleCartItem) {
            updateItemQuantity(singleCartItem.id, (Number(singleCartItem.quantity) || 0) + 1);
        } else {
            addItem({
                id,
                dish_id: id,
                name,
                price: rawPrice,
                image: displayImage,
                description
            }, 1);
        }
    };

    const handleDecrease = (e) => {
        e.stopPropagation();
        if (!isAvailable) return;
        if (matchingItems.length > 1) {
            setIsPreviewOpen(true);
            return;
        }
        if (singleCartItem) {
            const currentQty = Number(singleCartItem.quantity) || 0;
            if (currentQty > 1) {
                updateItemQuantity(singleCartItem.id, currentQty - 1);
            } else if (currentQty === 1) {
                removeItem(singleCartItem.id);
            }
        }
    };

    const handleOpenPreview = (e) => {
        e.stopPropagation();
        setIsPreviewOpen(true);
    };

    return (
        <>
            <div
                className={`bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md rounded-3xl p-3.5 flex gap-4 items-start justify-between transition-all duration-200 group cursor-pointer relative ${!isAvailable ? 'opacity-75' : ''} ${className}`}
                onClick={handleOpenPreview}
            >
                {/* Left Side: Details Column */}
                <div className="flex flex-col justify-between flex-1 min-w-0 pr-1 self-stretch">
                    <div className="space-y-1">
                        {/* Top Indicator & Bestseller Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <VegNonVegSymbol isVeg={isVeg} size="sm" />
                            {(isPopular || isSpecial) && (
                                <span className="text-rose-600 font-extrabold text-[11px] tracking-tight flex items-center gap-0.5">
                                    <span className="text-rose-500">🌟</span>
                                    <span>{isSpecial ? t('chefs_special') : t('bestseller')}</span>
                                </span>
                            )}
                        </div>

                        {/* Dish Name */}
                        <h3 className="text-slate-900 text-base font-extrabold leading-snug line-clamp-2 break-words group-hover:text-[#114536] transition-colors">
                            {localizedName}
                        </h3>

                        {/* Price */}
                        <div className="text-slate-900 text-sm font-black tracking-tight">
                            ₹{formattedPrice}
                        </div>

                        {/* Short Description + Clickable "... more" */}
                        {localizedDescription && (
                            <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2 break-words mt-1">
                                {localizedDescription}{' '}
                                <button
                                    type="button"
                                    onClick={handleOpenPreview}
                                    className="text-slate-900 font-bold hover:underline ml-0.5 inline-block cursor-pointer"
                                >
                                    {t('more')}
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Side: Image & Overlaid ADD Button (Swiggy / Zomato style) */}
                <div className="relative w-32 sm:w-36 h-32 sm:h-36 shrink-0 flex flex-col items-center">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-2xs relative">
                        <ImageWithSkeleton
                            src={displayImage}
                            alt={name}
                            aspectRatio="aspect-square"
                            className={`w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300 ${!isAvailable ? 'grayscale-[60%]' : ''}`}
                        />

                        {!isAvailable && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider text-center p-1 rounded-2xl">
                                {t('out_of_stock')}
                            </div>
                        )}
                    </div>

                    {/* Overlaid ADD Button / Quantity Control Pill */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                        {quantity > 0 ? (
                            <div onClick={(e) => e.stopPropagation()}>
                                <QuantityControl
                                    quantity={quantity}
                                    onIncrease={handleIncrease}
                                    onDecrease={handleDecrease}
                                    disabled={!isAvailable}
                                    disableIncrease={isShopClosed}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={!isAvailable || isShopClosed}
                                onClick={handleAddClick}
                                title={isShopClosed ? t('shop_closed_btn') : t('add')}
                                className={`border font-extrabold rounded-xl shadow-md uppercase tracking-wider transition-all whitespace-nowrap min-w-[70px] max-w-[124px] truncate text-center ${
                                    isShopClosed
                                        ? 'bg-slate-100 border-slate-200 text-slate-500 text-[10px] px-2.5 py-1.5 cursor-not-allowed'
                                        : 'bg-white hover:bg-emerald-50/60 border-slate-200/90 text-[#114536] text-xs px-3.5 sm:px-5 py-1.5 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                            >
                                {isShopClosed ? t('shop_closed_btn') : t('add')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Dish Preview & Portion Selection Popup Modal */}
            {isPreviewOpen && (
                <DishPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    dish={{
                        id,
                        name,
                        image,
                        images,
                        price,
                        basePrice,
                        base_price,
                        description,
                        preparation,
                        isAvailable,
                        isPopular,
                        isSpecial,
                        isVeg,
                        portions
                    }}
                />
            )}
        </>
    );
}