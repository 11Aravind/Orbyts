import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import SearchResults from '../components/SearchResults';
import FoodCard from '../components/FoodCard';
import CategoryCard from '../components/CategoryCard';
import BannerCarousel from '../components/BannerCarousel';
import BottomNavigation from '../components/BottomNavigation';
import CustomerOrderDetailsModal from '../components/CustomerOrderDetailsModal';
import FloatingMenuButton from '../components/FloatingMenuButton';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { apiService } from '../utils/apiService';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { secureStorage } from '../utils/secureStorage';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'react-hot-toast';
import { Search, Phone, Mic, Utensils, ChevronRight, XCircle } from 'lucide-react';
import { syncActiveOrdersWithServer } from '../utils/orderUtils';
import { getOrCreateCustomerSession } from '../utils/session';
import { stopReadyAlarm, subscribeAlarmState, unlockAudio } from '../utils/sound';
import { requestNotificationPermission } from '../utils/notifications';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import ShopClosedBanner from '../components/ShopClosedBanner';

export default function Home() {
    const handleCall = () => {
        window.location.href = 'tel:+1234567890';
    };

    const navigate = useNavigate();
    const location = useLocation();
    const { appName, logoUrl, settings, loading: settingsLoading } = useSettings();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const isSearching = false;
    const [isListening, setIsListening] = useState(false);
    const [alarmState, setAlarmState] = useState({ active: false, data: null });

    useEffect(() => {
        const unsub = subscribeAlarmState((active, data) => {
            setAlarmState({ active, data });
        });
        return () => unsub();
    }, []);

    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice search is not supported in this browser.", { id: 'mic-toast' });
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
                toast('🎙️ Listening... Speak dish name (e.g. Pizza)', { id: 'mic-toast', duration: 4000 });
            };

            recognition.onresult = (event) => {
                const spokenText = event.results[0][0].transcript;
                if (spokenText) {
                    setSearchQuery(spokenText);
                    // voice search sets query directly
                    toast.success(`Searching for "${spokenText}"`, { id: 'mic-toast' });
                }
                setIsListening(false);
            };

            recognition.onerror = (err) => {
                console.error('Speech recognition error:', err);
                setIsListening(false);
                toast.error('Voice search failed. Please type search term.', { id: 'mic-toast' });
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } catch (e) {
            console.error('Speech mic error:', e);
            toast.error('Could not start voice search.', { id: 'mic-toast' });
        }
    };


    const [showAllCategories, setShowAllCategories] = useState(false);

    useEffect(() => {
        if (location.hash === '#categories' || searchParams.get('menu') === 'true') {
            setShowAllCategories(true);
            setTimeout(() => {
                const el = document.getElementById('categories-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        }
    }, [location.hash, searchParams]);

    useEffect(() => {
        const handleShowAll = () => {
            setShowAllCategories(true);
        };
        window.addEventListener('show-all-categories', handleShowAll);
        return () => window.removeEventListener('show-all-categories', handleShowAll);
    }, []);

    // Active order modal state
    const [activeOrders, setActiveOrders] = useState([]);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const session = getOrCreateCustomerSession();
    const isSelfService = (settings?.service_mode || session.service_mode) === 'SELF_SERVICE';

    // Table detection from QR Code URL (?table=X) or customer session
    const [tableNumber, setTableNumber] = useState(() => {
        const urlTable = searchParams.get('table');
        if (urlTable) {
            secureStorage.setItem('orderly_table_number', urlTable);
            return urlTable;
        }
        return session.table_number || secureStorage.getItem('orderly_table_number') || '';
    });

    // API Data state
    const [homeData, setHomeData] = useState(null);
    const [allDishes, setAllDishes] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);

    const loadAndSyncActiveOrders = async () => {
        try {
            const session = getOrCreateCustomerSession();
            const urlTable = searchParams.get('table');
            const currentTable = urlTable || secureStorage.getItem('orderly_table_number');
            const activeList = await syncActiveOrdersWithServer({
                sessionId: session?.session_id,
                tableNumber: currentTable
            });
            setActiveOrders(activeList || []);
            if (activeList && activeList.length > 0) {
                unlockAudio();
                requestNotificationPermission().catch(() => {});
            }
        } catch (e) {
            console.error('Error syncing active orders in Home:', e);
        }






    };

    useEffect(() => {
        loadAndSyncActiveOrders();

        const interval = setInterval(() => {
            loadAndSyncActiveOrders();
        }, 15000);










        let subscription;
        if (isSupabaseConfigured && supabase) {
            const currentSession = getOrCreateCustomerSession();
            const channelFilter = currentSession?.session_id ? `session_id=eq.${currentSession.session_id}` : undefined;
            subscription = supabase
                .channel(`home_orders_${currentSession?.session_id || 'guest'}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    ...(channelFilter ? { filter: channelFilter } : {})
                }, (payload) => {
                    if (payload.eventType === 'DELETE' || payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        loadAndSyncActiveOrders();
                    }
                })
                .subscribe();
        }

        return () => {
            clearInterval(interval);
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [searchParams]);

    useEffect(() => {
        const tableFromUrl = searchParams.get('table');
        if (tableFromUrl) {
            secureStorage.setItem('orderly_table_number', tableFromUrl);
            setTableNumber(tableFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        setApiLoading(true);
        apiService.getHomePageData()
            .then((data) => {
                if (data) {
                    setHomeData(data);
                    setAllDishes(data.all_dishes || data.popular_dishes || []);
                }
            })
            .catch((err) => console.error('Data load error:', err))
            .finally(() => setApiLoading(false));

        const unsubscribe = apiService.subscribeStoreUpdates(() => {
            apiService.getHomePageData().then((data) => {
                if (data) {
                    setHomeData({ ...data });
                    setAllDishes(data.all_dishes || data.popular_dishes || []);
                }
            }).catch((err) => console.warn('Home realtime sync error:', err));
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Debounce search
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    // Filter dishes based on search query or quick filter chip
    const searchResults = searchQuery.trim().length > 0
        ? allDishes.filter(food => {
            const q = searchQuery.toLowerCase().trim();
            if (q === 'veg') return food.is_veg === true;
            if (q === 'non-veg' || q === 'non veg') return food.is_veg === false;
            if (q === 'popular') return Boolean(food.is_popular || food.isPopular);
            if (q === 'specials' || q === 'special') return Boolean(food.is_special || food.isSpecial);
            return (
                food.name?.toLowerCase().includes(q) ||
                food.description?.toLowerCase().includes(q) ||
                (food.ingredients && food.ingredients.some(ing => ing.toLowerCase().includes(q)))
            );
        })
        : [];

    const handleSelectFloatingCategory = (type, item) => {
        if (type === 'popular') {
            navigate('/CategoryDetails/popular');
        } else if (type === 'special') {
            navigate('/CategoryDetails/special');
        } else if (type === 'category' && item?.id) {
            navigate(`/CategoryDetails/${item.id}`);
        }
    };

    const banners = homeData?.banners || [];
    const popularDishes = homeData?.popular_dishes || [];
    const todaysSpecials = homeData?.todays_specials || [];
    const categories = homeData?.categories || [];
    const isShopClosed = settingsLoading
        ? Boolean(settings?.is_closed ?? homeData?.settings?.is_closed)
        : Boolean(settings?.is_closed);

    // Animated dynamic placeholder categories rotation
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const suggestionCategories = (categories && categories.length > 0)
        ? categories.map(c => c.name)
        : ['Pizza', 'Biryani', 'Burgers', 'Chinese', 'Desserts', 'Beverages', 'Starters', 'Combos'];

    useEffect(() => {
        if (suggestionCategories.length === 0) return;
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % suggestionCategories.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [suggestionCategories.length]);

    const animatedCategoryName = suggestionCategories[placeholderIndex % suggestionCategories.length] || 'Pizza';

    return (
        <div
            className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
            style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
        >
            {/* Customer Order Details Modal */}
            {showOrderModal && activeOrders && activeOrders.length > 0 && (
                <CustomerOrderDetailsModal
                    orders={activeOrders}
                    onClose={() => setShowOrderModal(false)}
                    onOrderMore={() => setShowOrderModal(false)}
                    disableSubscription={true}
                />
            )}

            {/* Continuous READY Status Alarm Notification Banner */}
            {alarmState.active && (
                <aside
                    aria-label="Order ready notification"
                    className="fixed top-3 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 sm:w-full sm:max-w-lg bg-gradient-to-r from-rose-600 via-rose-700 to-rose-600 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-white/90 flex items-center justify-between gap-3 animate-fade-in transition-all"
                >
                    <div
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        onClick={() => setShowOrderModal(true)}
                        title="Tap to view order details"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-black shrink-0 shadow-md">
                            <Utensils className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping shrink-0" />
                                <p className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1 text-white">
                                    <span>🍽️ YOUR FOOD IS READY!</span>
                                </p>
                            </div>
                            <p className="text-[11px] text-rose-100 font-medium truncate mt-0.5">
                                Order #{alarmState.data?.orderNumber} is hot & ready for pickup/serving!
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => stopReadyAlarm()}
                        className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 font-black text-xs rounded-xl shadow-lg transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Turn off sound and vibration"
                    >
                        🔕 Stop Alarm
                    </button>
                </aside>
            )}

            <div>
                {/* Premium Emerald Forest Green Header Banner */}
                <div className="bg-gradient-to-r from-[#072b21] via-[#0d3b2e] to-[#072b21] px-4 pt-4 pb-4 shadow-lg rounded-b-[28px] border-b border-[#144d3d]/40 relative overflow-hidden">
                    {/* Background Decorative Gradient Highlight */}
                    <div className="absolute top-0 right-0 w-36 h-36 opacity-10 pointer-events-none select-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-300 via-transparent to-transparent" />

                    {/* Top Row: Brand Logo, Name & Call Button */}
                    <div className="flex items-center justify-between gap-3 relative z-10">
                        {/* Left: White Circle Logo & Brand Name Column */}
                        <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            {/* White Circle Badge with Green Utensils / Logo */}
                            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md border border-white/20">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={appName} className="w-7 h-7 object-contain rounded-full" />
                                ) : (
                                    <Utensils className="w-6 h-6 text-[#114536] stroke-[2.2]" />
                                )}
                            </div>

                            {/* Brand Name Title & Table Badge */}
                            <div className="flex flex-col min-w-0 justify-center">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight leading-none flex items-center">
                                        <span>{appName ? appName.slice(0, 3) : 'Inn'}</span>
                                        <span className="text-[#f59e0b] ml-0.5">{appName ? appName.slice(3) : 'Bite'}</span>
                                    </h1>
                                    {isSelfService ? (
                                        <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                                            <span>🛎️</span> {t('self_service')}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                            <span>{t('table_prefix')}{tableNumber}</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/75 text-[11px] sm:text-xs font-medium tracking-tight leading-tight mt-0.5 truncate">
                                    {t('app_tagline')}
                                </p>
                            </div>
                        </div>

                        {/* Right: Language Switcher and Call Button */}
                        <div className="flex items-center gap-2 shrink-0">
                            <LanguageToggle />
                            <button
                                type="button"
                                onClick={handleCall}
                                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center justify-center text-white shadow-lg transition-all shrink-0 relative cursor-pointer backdrop-blur-xs"
                                title={t('call_support')}
                            >
                                <Phone className="w-5 h-5 text-white" />
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d3b2e] animate-pulse" />
                            </button>
                        </div>
                    </div>

                    {/* Integrated Search Bar Row */}
                    <div className="relative flex items-center w-full h-12 rounded-full bg-white shadow-xl border border-white/40 px-4 mt-3.5 transition-all focus-within:ring-2 focus-within:ring-emerald-400 group">
                        <Search className="w-5 h-5 text-slate-400 shrink-0 group-focus-within:text-[#114536] transition-colors" />

                        <div className="relative flex-1 h-full flex items-center min-w-0">
                            <input
                                id="home-search-input"
                                type="text"
                                className="h-full w-full bg-transparent pl-3 pr-2 text-sm font-medium text-slate-800 focus:outline-none z-10 relative"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />

                            {!searchQuery && (
                                <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none text-sm font-medium text-slate-400 select-none overflow-hidden pr-2">
                                    <span className="whitespace-nowrap">{t('search_prefix')}</span>
                                    <span
                                        key={placeholderIndex}
                                        className="inline-block animate-placeholder-slide transition-all px-0.5 truncate max-w-[120px] sm:max-w-[200px]"
                                    >
                                        {animatedCategoryName}
                                    </span>
                                    <span className="whitespace-nowrap">'</span>
                                </div>
                            )}
                        </div>

                        {searchQuery && (
                            <button
                                type="button"
                                className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100 mr-1 cursor-pointer z-20"
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        )}

                        {/* Divider Line */}
                        <div className="h-5 w-[1.5px] bg-slate-200 mx-2 shrink-0" />

                        {/* Microphone Icon Button */}
                        <button
                            type="button"
                            onClick={handleMicClick}
                            className={`p-1.5 rounded-full hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer ${isListening ? 'animate-bounce text-emerald-700' : 'text-[#114536]'}`}
                            title="Voice Search"
                        >
                            <Mic className="w-5 h-5 text-[#114536]" />
                        </button>
                    </div>
                </div>

                {/* Shop Closed Banner */}
                {isShopClosed && (
                    <div className="sticky top-0 z-10 shadow-sm">
                        <ShopClosedBanner variant="home" className="rounded-none border-x-0 border-t-0" />
                    </div>
                )}

                {/* Active Order Banner for Customer (Yellow/Gold Modal Theme) */}
                {activeOrders && activeOrders.length > 0 && (
                    <div className="px-4 pt-2">
                        <div
                            onClick={() => setShowOrderModal(true)}
                            className="bg-gradient-to-r from-[#c89346] via-[#bd873b] to-[#a87431] text-white rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all shadow-md border border-[#b87d35]"
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-xl bg-white text-[#8b5e2b] flex items-center justify-center font-bold shrink-0 shadow-2xs">
                                    <Utensils className="w-4.5 h-4.5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-black text-white">
                                            {activeOrders.length > 1
                                                ? `Table #${activeOrders[0]?.table_number || tableNumber} Active Orders (${activeOrders.length} Sub-Orders)`
                                                : `Active Table #${activeOrders[0]?.table_number || tableNumber} Order`}
                                        </span>
                                        <span className="text-[10px] uppercase font-extrabold bg-[#1a1815] text-[#f5d796] border border-[#3b3226] px-2 py-0.5 rounded-full">
                                            {activeOrders.some(o => o.status === 'READY') ? 'READY FOR PICKUP' : activeOrders.some(o => o.status === 'PREPARING' || o.status === 'ACCEPTED') ? 'PREPARING' : 'CONFIRMED'}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-amber-100 font-semibold block mt-0.5 truncate">
                                        Combined Total: ₹{activeOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0).toFixed(2)} · {activeOrders.reduce((sum, o) => sum + (o.order_items || o.items || []).length, 0)} items · Tap for live breakdown
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white shrink-0 ml-2" />
                        </div>
                    </div>
                )}



                {/* Main Content or Search Results */}
                {searchQuery.trim().length > 0 ? (
                    <SearchResults
                        results={searchResults}
                        isLoading={isSearching}
                        searchQuery={searchQuery}
                        onClear={() => setSearchQuery('')}
                    />
                ) : (location.hash === '#categories' || searchParams.get('menu') === 'true') ? (
                    /* Dedicated Menu View: Shows ONLY the Category Cards Grid */
                    <div id="categories-section" className="px-4 pt-3 pb-8 min-h-[65vh]">
                        {apiLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {Array(6).fill(0).map((_, idx) => (
                                    <div key={idx} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
                                        <Skeleton circle width={64} height={64} className="mb-2" />
                                        <Skeleton width={70} height={16} />
                                    </div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-16 text-[#82686a] text-xs font-bold">
                                No categories available at the moment.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {categories.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        id={category.id}
                                        image={category.image_url || category.image || '/placeholderfood.png'}
                                        name={category.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Banner Carousel */}
                        <BannerCarousel banners={banners} isLoading={apiLoading} />

                        {/* {t('our_categories')} Section (Grid System) */}
                        <div id="categories-section" className="px-4 pt-5 pb-3 scroll-mt-4">
                            <div className="flex items-center justify-between mb-3.5">
                                <h2 className="text-[#171212] text-[20px] sm:text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                    {t('our_categories')}
                                </h2>
                                {categories.length > 6 && (
                                    <button
                                        onClick={() => setShowAllCategories(!showAllCategories)}
                                        className="text-xs sm:text-sm font-semibold text-[#82686a] hover:text-[#171212] flex items-center gap-1 transition-colors group"
                                    >
                                        {showAllCategories ? t('show_less') : t('view_all')}
                                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showAllCategories ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                                    </button>
                                )}
                            </div>

                            {apiLoading ? (
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                    {Array(6).fill(0).map((_, idx) => (
                                        <div key={idx} className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
                                            <Skeleton circle width={56} height={56} className="mb-2" />
                                            <Skeleton width={50} height={14} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                    {(showAllCategories ? categories : categories.slice(0, 6)).map((category) => (
                                        <CategoryCard
                                            key={category.id}
                                            id={category.id}
                                            image={category.image_url || category.image || '/placeholderfood.png'}
                                            name={category.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* {t('popular_dishes')} Section */}
                        <h2 className="text-[#171212] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                            {t('popular_dishes')}
                        </h2>
                        <div className="flex overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="flex items-stretch px-4 py-2 gap-3.5">
                                {apiLoading ? (
                                    Array(3).fill(0).map((_, idx) => (
                                        <div key={idx} className="w-[300px] shrink-0">
                                            <Skeleton height={110} borderRadius={24} />
                                        </div>
                                    ))
                                ) : (
                                    popularDishes.map((dish) => (
                                        <FoodCard
                                            key={dish.id}
                                            id={dish.id}
                                            image={dish.images?.[0] || dish.image || '/placeholderfood.png'}
                                            images={dish.images}
                                            name={dish.name}
                                            price={dish.basePrice || dish.base_price}
                                            basePrice={dish.basePrice || dish.base_price}
                                            description={dish.description}
                                            preparation={dish.preparation || dish.preparation_details}
                                            isAvailable={dish.is_available !== false}
                                            isPopular={Boolean(dish.is_popular || dish.isPopular || true)}
                                            isSpecial={Boolean(dish.is_special || dish.isSpecial)}
                                            isVeg={dish.is_veg !== false && dish.isVeg !== false}
                                            portions={dish.portions}
                                            className="w-[320px] sm:w-[360px] shrink-0"
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Today's Specials Section */}
                        <h2 className="text-[#171212] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                            {t('todays_specials')}
                        </h2>
                        <div className="flex overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="flex items-stretch px-4 py-2 gap-3.5">
                                {apiLoading ? (
                                    Array(2).fill(0).map((_, idx) => (
                                        <div key={idx} className="w-[300px] shrink-0">
                                            <Skeleton height={110} borderRadius={24} />
                                        </div>
                                    ))
                                ) : todaysSpecials.length === 0 ? (
                                    <div className="text-[#82686a] px-4">No specials available today</div>
                                ) : (
                                    todaysSpecials.map((item) => (
                                        <FoodCard
                                            key={item.id}
                                            id={item.id}
                                            image={item.images?.[0] || item.image || '/placeholderfood.png'}
                                            images={item.images}
                                            name={item.name}
                                            price={item.basePrice || item.base_price}
                                            basePrice={item.basePrice || item.base_price}
                                            description={item.description}
                                            preparation={item.preparation || item.preparation_details}
                                            isAvailable={item.is_available !== false}
                                            isSpecial={true}
                                            isPopular={Boolean(item.is_popular || item.isPopular)}
                                            isVeg={item.is_veg !== false && item.isVeg !== false}
                                            portions={item.portions}
                                            className="w-[320px] sm:w-[360px] shrink-0"
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
                {/* Generous bottom spacing so all content scrolls cleanly above fixed BottomNavigation */}
                <div className="h-28 sm:h-32" />
            </div>
            <FloatingMenuButton
                categories={categories}
                allDishes={allDishes}
                onSelectCategory={handleSelectFloatingCategory}
            />
            <BottomNavigation
                categories={categories}
                allDishes={allDishes}
                onSelectCategory={handleSelectFloatingCategory}
            />
        </div>
    );
}
