import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from 'react-use-cart';
import { apiService } from '../utils/apiService';
import { useLanguage } from '../context/LanguageContext';
import { X, Star, Sparkles, Utensils } from 'lucide-react';

export default function BottomNavigation({
    categories: propCats,
    allDishes: propDishes,
    onSelectCategory
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { totalUniqueItems } = useCart();
    const { t, getCategoryTitle } = useLanguage();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerRef = useRef(null);

    const hasPropCats = Array.isArray(propCats) && propCats.length > 0;
    const hasPropDishes = Array.isArray(propDishes) && propDishes.length > 0;

    const [categories, setCategories] = useState(() => (hasPropCats ? propCats : []));
    const [allDishes, setAllDishes] = useState(() => (hasPropDishes ? propDishes : []));

    useEffect(() => {
        if (hasPropCats) setCategories(propCats);
        if (hasPropDishes) setAllDishes(propDishes);
    }, [hasPropCats, hasPropDishes, propCats, propDishes]);

    useEffect(() => {
        const needsCats = !hasPropCats;
        const needsDishes = !hasPropDishes;
        if (!needsCats && !needsDishes) return;

        let isMounted = true;

        const syncCats = apiService.getCategoriesSync();
        const syncFoods = apiService.getDishesSync();
        if (syncCats && syncFoods) {
            if (needsCats) setCategories(syncCats);
            if (needsDishes) setAllDishes(syncFoods);
        } else {
            Promise.all([
                apiService.getCategories(),
                apiService.getDishes()
            ]).then(([cats, dishes]) => {
                if (!isMounted) return;
                if (needsCats) setCategories(cats || []);
                if (needsDishes) setAllDishes(dishes || []);
            }).catch(err => console.warn('BottomNavigation load error:', err));
        }

        const unsubscribe = apiService.subscribeStoreUpdates(() => {
            Promise.all([
                needsCats ? apiService.getCategories() : Promise.resolve(null),
                needsDishes ? apiService.getDishes() : Promise.resolve(null)
            ]).then(([cats, dishes]) => {
                if (!isMounted) return;
                if (cats) setCategories(cats);
                if (dishes) setAllDishes(dishes);
            }).catch(() => {});
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [hasPropCats, hasPropDishes]);

    // Prevent body scroll when drawer is open and handle Esc key
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    setIsDrawerOpen(false);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isDrawerOpen]);

    const isHome = location.pathname === '/' && !location.hash && !isDrawerOpen;
    const isMenu = isDrawerOpen || (location.pathname === '/' && location.hash === '#categories');
    const isCart = location.pathname === '/cart' && !isDrawerOpen;

    const handleHomeClick = (e) => {
        e.preventDefault();
        setIsDrawerOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (location.hash) {
                navigate('/', { replace: true });
            }
        }
    };

    const handleMenuClick = (e) => {
        e.preventDefault();
        setIsDrawerOpen(prev => !prev);
    };

    const handleCartClick = (e) => {
        e.preventDefault();
        setIsDrawerOpen(false);
        navigate('/cart');
    };

    // Calculate dish counts per category
    const recommendedCount = useMemo(() => {
        return allDishes.filter(d => d.is_popular || d.isPopular).length;
    }, [allDishes]);

    const chefSpecialCount = useMemo(() => {
        return allDishes.filter(d => d.is_special || d.isSpecial).length;
    }, [allDishes]);

    const categoryCounts = useMemo(() => {
        return categories.map(cat => {
            const count = allDishes.filter(d => {
                const dCatId = String(d.category_id || d.categoryId || d.category || '');
                const cId = String(cat.id || '');
                const dCatName = (d.category_name || '').toLowerCase();
                const cName = (cat.name || '').toLowerCase();
                return (dCatId && cId && dCatId === cId) || (dCatName && cName && dCatName === cName);
            }).length;
            return {
                ...cat,
                count: count || (cat.dishes_count || 0)
            };
        });
    }, [categories, allDishes]);

    const handleCategoryClick = (catType, item) => {
        setIsDrawerOpen(false);
        if (onSelectCategory) {
            onSelectCategory(catType, item);
        } else {
            if (catType === 'popular') {
                navigate('/CategoryDetails/popular');
            } else if (catType === 'special') {
                navigate('/CategoryDetails/special');
            } else if (catType === 'category' && item?.id) {
                navigate(`/CategoryDetails/${item.id}`);
            }
        }
    };

    return (
        <>
            <div className="flex gap-2 border-t border-[#f4f1f1] bg-white px-4 pb-2 pt-2 fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto sm:border-x shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
                {/* Home Option */}
                <a
                    className={`flex flex-1 flex-col items-center justify-end gap-1 ${isHome ? 'text-[#114536]' : 'text-[#82686a]'}`}
                    href="/"
                    onClick={handleHomeClick}
                >
                    <div
                        className={`flex h-8 items-center justify-center transition-colors ${isHome ? 'text-[#114536]' : 'text-[#82686a]'}`}
                        data-icon="House"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24px"
                            height="24px"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                        </svg>
                    </div>
                    <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isHome ? 'text-[#114536] font-bold' : 'text-[#82686a]'}`}>{t('home')}</p>
                </a>

                {/* Center Menu Option */}
                <button
                    type="button"
                    className={`flex flex-1 flex-col items-center justify-end gap-1 cursor-pointer transition-colors ${isMenu ? 'text-[#114536]' : 'text-[#82686a]'}`}
                    onClick={handleMenuClick}
                    aria-label={`Open ${t('our_categories')}`}
                    title="Menu Categories"
                >
                    <div
                        className={`flex h-8 items-center justify-center transition-colors ${isMenu ? 'text-[#114536]' : 'text-[#82686a]'}`}
                        data-icon="Utensils"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24px"
                            height="24px"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M80,32a8,8,0,0,0-8,8V88H64V40a8,8,0,0,0-16,0V88a24,24,0,0,0,24,24v96a8,8,0,0,0,16,0V112A24,24,0,0,0,112,88V40a8,8,0,0,0-16,0V88H88V40A8,8,0,0,0,80,32ZM208,32a8,8,0,0,0-7.39,4.93l-32,80A8,8,0,0,0,176,128h24v80a8,8,0,0,0,16,0V40A8,8,0,0,0,208,32Z"></path>
                        </svg>
                    </div>
                    <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isMenu ? 'text-[#114536] font-bold' : 'text-[#82686a]'}`}>{t('menu')}</p>
                </button>

                {/* Cart Option */}
                <a
                    className={`flex flex-1 flex-col items-center justify-end gap-1 ${isCart ? 'text-[#114536]' : 'text-[#82686a]'}`}
                    href="/cart"
                    onClick={handleCartClick}
                >
                    <div
                        className={`flex h-8 items-center justify-center relative transition-colors ${isCart ? 'text-[#114536]' : 'text-[#82686a]'}`}
                        data-icon="ShoppingCart"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24px"
                            height="24px"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
                        </svg>
                        {totalUniqueItems > 0 && (
                            <span className="absolute -top-1 -right-2 bg-[#114536] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                                {totalUniqueItems}
                            </span>
                        )}
                    </div>
                    <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isCart ? 'text-[#114536] font-bold' : 'text-[#82686a]'}`}>{t('cart')}</p>
                </a>
            </div>

            {/* Interactive Category Drawer / Bottom Sheet */}
            {isDrawerOpen && createPortal(
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[999] flex items-end justify-center p-0"
                    onClick={() => setIsDrawerOpen(false)}
                >
                    <div
                        ref={drawerRef}
                        className="bg-white rounded-t-[32px] w-full max-w-lg max-h-[82vh] shadow-2xl flex flex-col text-slate-900 border-t border-slate-100 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Grab Handle */}
                        <div className="pt-3 pb-1 flex justify-center">
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#114536] flex items-center justify-center shrink-0">
                                    <Utensils className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                        {t('menu_categories')}
                                    </h3>
                                    <p className="text-[11px] text-[#82686a] font-medium truncate">
                                        {categoryCounts.length} {t('categories_available')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 ml-2"
                                aria-label="Close categories menu"
                            >
                                <X className="w-5 h-5 stroke-[2.2]" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto px-4 py-4 space-y-4 flex-1">
                            {/* Featured Bestsellers & Specials */}
                            {(recommendedCount > 0 || chefSpecialCount > 0) && (
                                <div className="grid grid-cols-2 gap-2.5">
                                    {recommendedCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryClick('popular', null)}
                                            className="flex items-center justify-between gap-1.5 p-2.5 sm:p-3 bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/80 rounded-2xl text-left transition-all hover:shadow-xs active:scale-95 group cursor-pointer min-w-0 overflow-hidden"
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                                    <Star className="w-4 h-4 fill-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-xs font-extrabold text-amber-950 block truncate">
                                                        {t('recommended_dishes')}
                                                    </span>
                                                    <span className="text-[10px] text-amber-800 font-semibold block truncate">
                                                        {t('bestseller')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-mono text-[11px] font-black text-amber-900 bg-white/90 px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0 ml-1">
                                                {recommendedCount}
                                            </span>
                                        </button>
                                    )}

                                    {chefSpecialCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryClick('special', null)}
                                            className="flex items-center justify-between gap-1.5 p-2.5 sm:p-3 bg-gradient-to-br from-rose-50 to-rose-100/60 border border-rose-200/80 rounded-2xl text-left transition-all hover:shadow-xs active:scale-95 group cursor-pointer min-w-0 overflow-hidden"
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                                    <Sparkles className="w-4 h-4 fill-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-xs font-extrabold text-rose-950 block truncate">
                                                        {t('chefs_special')}
                                                    </span>
                                                    <span className="text-[10px] text-rose-800 font-semibold block truncate">
                                                        {t('signature')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-mono text-[11px] font-black text-rose-900 bg-white/90 px-1.5 py-0.5 rounded-full border border-rose-200 shrink-0 ml-1">
                                                {chefSpecialCount}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* All Store Categories */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5 px-1">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        {t('our_categories')}
                                    </span>
                                </div>

                                {categoryCounts.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-xs font-medium">
                                        No categories available
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2.5 pb-2">
                                        {categoryCounts.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => handleCategoryClick('category', cat)}
                                                className="flex items-center gap-2.5 p-2.5 bg-slate-50/80 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-300 rounded-2xl text-left transition-all group active:scale-95 cursor-pointer min-w-0 overflow-hidden"
                                            >
                                                <div className="w-11 h-11 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center">
                                                    {cat.image_url || cat.image ? (
                                                        <img
                                                            src={cat.image_url || cat.image}
                                                            alt={getCategoryTitle(cat.name)}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-[#114536]">
                                                            <Utensils className="w-5 h-5 opacity-70" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#114536] truncate">
                                                        {getCategoryTitle(cat.name)}
                                                    </p>
                                                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">
                                                        {cat.count} {cat.count === 1 ? t('dish_singular') : t('dish_plural')}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}