import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../utils/apiService';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { printThermalReceipt } from '../../utils/printReceipt';
import VegNonVegSymbol from '../../components/VegNonVegSymbol';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    Printer,
    CheckCircle2,
    Utensils,
    CreditCard,
    DollarSign,
    QrCode,
    Receipt,
    User,
    Phone,
    RefreshCw,
    X,
    ArrowLeft,
    Check,
    UtensilsCrossed,
    Flame,
    ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPOS({ isWaiter = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { settings } = useSettings();

    // Determine if operating in Waiter mode or Admin mode
    const isWaiterMode = isWaiter || user?.role === 'WAITER' || location.pathname.includes('/bite-waiter');

    const [dishes, setDishes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // POS Order State
    const [orderType, setOrderType] = useState('COUNTER'); // 'COUNTER' or 'TABLE'
    const [selectedTable, setSelectedTable] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [cart, setCart] = useState([]);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Default tax from settings (CGST + SGST) or fallback to 5%
    const hasConfiguredTaxRates = settings?.cgst_rate !== undefined || settings?.sgst_rate !== undefined;
    const configuredCgst = settings?.cgst_rate !== undefined ? Number(settings.cgst_rate) : 2.5;
    const configuredSgst = settings?.sgst_rate !== undefined ? Number(settings.sgst_rate) : 2.5;
    const defaultTax = hasConfiguredTaxRates ? Math.max(0, configuredCgst + configuredSgst) : 5;
    const [taxPercent, setTaxPercent] = useState(defaultTax);
    const [hasEditedTax, setHasEditedTax] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'upi', 'card'
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Portion selection modal state (McDonald's / KFC style portion modal)
    const [portionModalDish, setPortionModalDish] = useState(null);
    const [selectedPortionValue, setSelectedPortionValue] = useState('');
    const [portionNote, setPortionNote] = useState('');

    useEffect(() => {
        if (!hasEditedTax && settings && (settings.cgst_rate !== undefined || settings.sgst_rate !== undefined)) {
            const nextCgst = settings.cgst_rate !== undefined ? Number(settings.cgst_rate) : 2.5;
            const nextSgst = settings.sgst_rate !== undefined ? Number(settings.sgst_rate) : 2.5;
            const syncedTax = Math.max(0, (Number.isFinite(nextCgst) ? nextCgst : 2.5) + (Number.isFinite(nextSgst) ? nextSgst : 2.5));
            setTaxPercent(syncedTax);
        }
    }, [settings, hasEditedTax]);

    useEffect(() => {
        loadData(true);
        const unsubscribe = apiService.subscribeStoreUpdates(() => {
            loadData(false);
        });
        return () => unsubscribe();
    }, []);

    const loadData = async (showSpinner = true, forceRefresh = false) => {
        if (showSpinner) setLoading(true);
        try {
            if (forceRefresh) {
                await apiService.getStoreData({ forceRefresh: true });
            }
            const [dishesRes, categoriesRes, tablesRes] = await Promise.all([
                apiService.getDishes(),
                apiService.getCategories(),
                apiService.getTables()
            ]);
            setDishes(dishesRes || []);
            setCategories(categoriesRes || []);
            setTables(tablesRes || []);
        } catch (err) {
            console.error('Error loading POS data:', err);
            if (showSpinner) toast.error('Failed to load menu data');
        } finally {
            if (showSpinner) setLoading(false);
        }
    };

    // When clicking a dish card
    const handleDishClick = (dish) => {
        if (dish.is_available === false) {
            toast.error(`${dish.name} is currently out of stock`);
            return;
        }

        const dishPortions = (dish.portions && dish.portions.length > 0)
            ? dish.portions
            : [{ label: 'Regular', value: 'regular', price: Number(dish.base_price || dish.price || 0) }];

        // If multiple portion sizes (e.g. Regular, Half, Full), open fast selector dialog
        if (dishPortions.length > 1) {
            setPortionModalDish(dish);
            setSelectedPortionValue(dishPortions[0].value || dishPortions[0].label);
            setPortionNote('');
        } else {
            // Direct single-portion addition
            addToCartWithPortion(dish, dishPortions[0], '');
        }
    };

    const addToCartWithPortion = (dish, portionObj, note = '') => {
        const portionLabel = portionObj?.label || 'Regular';
        const portionValue = portionObj?.value || portionLabel.toLowerCase();
        const portionPrice = Number(portionObj?.price !== undefined && portionObj?.price !== 0
            ? portionObj.price
            : (dish.base_price || dish.price || 0));

        const uniqueCartId = `${dish.id}-${portionValue}`;

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.id === uniqueCartId);
            if (existingIndex > -1) {
                return prevCart.map((item, idx) =>
                    idx === existingIndex
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                            note: note || item.note || ''
                        }
                        : item
                );
            } else {
                return [
                    ...prevCart,
                    {
                        id: uniqueCartId,
                        dish_id: dish.id,
                        name: dish.name,
                        dish_name: dish.name,
                        portion: portionLabel,
                        price: portionPrice,
                        unit_price: portionPrice,
                        quantity: 1,
                        image: dish.images?.[0] || dish.image_url || '',
                        is_veg: dish.is_veg,
                        note: note || ''
                    }
                ];
            }
        });

        toast.success(`Added ${dish.name}${portionLabel !== 'Regular' ? ` (${portionLabel})` : ''}`, {
            duration: 1500,
            id: 'pos-add-item'
        });
    };

    const handleConfirmPortionModal = () => {
        if (!portionModalDish) return;
        const portions = (portionModalDish.portions && portionModalDish.portions.length > 0)
            ? portionModalDish.portions
            : [{ label: 'Regular', value: 'regular', price: Number(portionModalDish.base_price || portionModalDish.price || 0) }];

        const matched = portions.find(p => (p.value || p.label) === selectedPortionValue) || portions[0];
        addToCartWithPortion(portionModalDish, matched, portionNote);
        setPortionModalDish(null);
    };

    const updateQuantity = (cartId, delta) => {
        setCart(prev =>
            prev
                .map(item => {
                    if (item.id === cartId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const updateItemNote = (cartId, note) => {
        setCart(prev =>
            prev.map(item => (item.id === cartId ? { ...item, note } : item))
        );
    };

    const removeItem = (cartId) => {
        setCart(prev => prev.filter(item => item.id !== cartId));
    };

    const clearCart = () => {
        setCart([]);
        setDiscountAmount(0);
        setCustomerName('');
        setCustomerPhone('');
        setSelectedTable('');
    };

    // Calculation math
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = Math.min(Number(discountAmount) || 0, subtotal);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxAmount = (taxableAmount * (Number(taxPercent) || 0)) / 100;
    const grandTotal = Math.max(0, taxableAmount + taxAmount);

    const handleCreateOrder = async (shouldPrint = false) => {
        if (cart.length === 0) {
            toast.error('Please add at least one item to the order');
            return;
        }
        if (orderType === 'TABLE' && !selectedTable) {
            toast.error('Please select a table number');
            return;
        }

        setIsSubmitting(true);
        try {
            const tableObj = tables.find(t => String(t.table_number) === String(selectedTable));
            const finalCustomerName = customerName.trim() || (orderType === 'TABLE' ? `Table #${selectedTable} Guest` : 'Counter Customer');

            const orderPayload = {
                table_id: orderType === 'TABLE' ? tableObj?.id || null : null,
                table_number: orderType === 'TABLE' ? selectedTable : null,
                service_mode: orderType === 'TABLE' ? 'TABLE_SERVICE' : 'SELF_SERVICE',
                customer_name: finalCustomerName,
                customer_phone: customerPhone.trim() || '',
                status: 'CONFIRMED',
                payment_status: 'SUCCESS',
                payment_method: paymentMethod,
                subtotal: subtotal,
                discount: discount,
                tax_amount: taxAmount,
                total_amount: grandTotal,
                is_pos: true,
                waiter_name: isWaiterMode ? (user?.name || 'Waiter Staff') : null,
                items: cart.map(item => ({
                    dish_id: item.dish_id || item.id,
                    id: item.dish_id || item.id,
                    name: item.portion && item.portion !== 'Regular' ? `${item.name} (${item.portion})` : item.name,
                    dish_name: item.portion && item.portion !== 'Regular' ? `${item.name} (${item.portion})` : item.name,
                    price: item.price,
                    quantity: item.quantity,
                    portion: item.portion || 'Regular',
                    unit_price_snapshot: item.price,
                    special_instruction: item.note || ''
                }))
            };

            const createdOrder = await apiService.saveOrder(orderPayload);
            const orderNum = createdOrder.order_number || createdOrder.id || '';
            toast.success(`🎉 POS Order #${orderNum} placed successfully!`, { duration: 4000 });

            if (shouldPrint) {
                printThermalReceipt({ ...orderPayload, ...createdOrder, id: createdOrder?.id || Date.now(), order_items: createdOrder?.order_items || orderPayload.items }, settings);
            }

            clearCart();
        } catch (err) {
            console.error('POS order error:', err);
            toast.error(err.message || 'Failed to create POS order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCatObj = categories.find(c => String(c.id) === String(selectedCategory));
    const filteredDishes = dishes.filter(d => {
        const dishCatId = String(d.category_id || d.categoryId || d.category || '');
        const dishCatName = String(d.category_name || '').toLowerCase();
        const matchesCat = selectedCategory === 'ALL'
            || dishCatId === String(selectedCategory)
            || (selectedCatObj && (
                dishCatId.toLowerCase() === String(selectedCatObj.name || '').toLowerCase()
                || (dishCatName && dishCatName === String(selectedCatObj.name || '').toLowerCase())
            ));
        const matchesSearch = (d.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const handleBackNavigation = () => {
        if (isWaiterMode) {
            navigate('/bite-waiter');
        } else {
            navigate('/bite-admin/orders');
        }
    };

    return (
        <div className="space-y-4 text-slate-900 font-sans p-3 sm:p-5 max-w-7xl mx-auto">
            {/* Top Navigation & Header Bar (Fast-Food Kiosk Style) */}
            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBackNavigation}
                        className="p-2 sm:px-3 sm:py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        title={isWaiterMode ? 'Return to Waiter Dashboard' : 'Return to Orders'}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{isWaiterMode ? 'Live Orders' : 'Orders'}</span>
                    </button>

                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {isWaiterMode ? 'Waiter Express Kiosk' : 'POS Express Billing'}
                            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                        </h1>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {isWaiterMode
                                ? 'Fast counter & table order taking for waiters'
                                : 'Quick counter billing, instant order creation & 80mm thermal receipt printing'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{user?.name || (isWaiterMode ? 'Waiter Staff' : 'Admin Cashier')}</span>
                    </span>

                    <button
                        type="button"
                        onClick={() => loadData(true, true)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                        title="Reload latest dishes and categories"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Main Split Grid (McDonald's / KFC Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* Left Side: Category Tabs & Food Cards Grid (7 Cols on desktop) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Search & Category Pills Bar */}
                    <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search dishes, burgers, drinks, meals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-900 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Fast Horizontal Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('ALL')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                                    selectedCategory === 'ALL'
                                        ? 'bg-[#114536] text-white shadow-sm scale-100'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All Items ({dishes.length})
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                                        String(selectedCategory) === String(cat.id)
                                            ? 'bg-[#114536] text-white shadow-sm scale-100'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Food Items Grid (Visual Kiosk Cards) */}
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredDishes.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-bold">
                            No dishes found matching search "{searchQuery}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[660px] overflow-y-auto pr-1">
                            {filteredDishes.map(dish => {
                                const price = Number(dish.base_price || dish.price || 0);
                                const isAvailable = dish.is_available !== false;
                                const imgUrl = dish.images?.[0] || dish.image_url || '/placeholderfood.png';
                                const hasMultiplePortions = dish.portions && dish.portions.length > 1;

                                return (
                                    <div
                                        key={dish.id}
                                        onClick={() => isAvailable && handleDishClick(dish)}
                                        className={`group relative bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-200 select-none ${
                                            isAvailable
                                                ? 'hover:border-emerald-600 hover:shadow-md cursor-pointer active:scale-[0.98]'
                                                : 'opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            {/* Dish Picture with Veg Symbol Overlay */}
                                            <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 relative">
                                                <img
                                                    src={imgUrl}
                                                    alt={dish.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/placeholderfood.png';
                                                    }}
                                                />

                                                {/* Top Indicator Overlay */}
                                                <div className="absolute top-2 left-2 flex items-center gap-1">
                                                    <VegNonVegSymbol isVeg={dish.is_veg !== false} size="sm" />
                                                </div>

                                                {/* Multiple Sizes Badge */}
                                                {hasMultiplePortions && isAvailable && (
                                                    <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                                        {dish.portions.length} Sizes
                                                    </span>
                                                )}

                                                {!isAvailable && (
                                                    <span className="absolute inset-0 bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            {/* Name & Pricing */}
                                            <div>
                                                <h3 className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-snug group-hover:text-[#114536] transition-colors">
                                                    {dish.name}
                                                </h3>
                                                <span className="text-xs font-black text-emerald-700 block mt-0.5">
                                                    {hasMultiplePortions ? `From ₹${price.toFixed(2)}` : `₹${price.toFixed(2)}`}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={!isAvailable}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isAvailable) handleDishClick(dish);
                                            }}
                                            className="mt-2.5 w-full py-1.5 bg-slate-100 group-hover:bg-[#114536] group-hover:text-white text-slate-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>{hasMultiplePortions ? 'Select Size' : 'Add'}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Side: Order Tray & Fast Counter Checkout (5 Cols on desktop) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-4 space-y-4 shadow-sm sticky top-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h2 className="font-black text-slate-900 text-base flex items-center gap-2">
                            <span>Order Tray</span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                {cart.reduce((a, b) => a + b.quantity, 0)} Items
                            </span>
                        </h2>
                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Clear Tray</span>
                            </button>
                        )}
                    </div>

                    {/* Order Type (Counter vs Table) & Customer Details */}
                    <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {/* Order Type Toggle */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setOrderType('COUNTER')}
                                className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                                    orderType === 'COUNTER'
                                        ? 'bg-[#114536] text-white border-[#114536] shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                🥡 Counter / Takeaway
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderType('TABLE')}
                                className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                                    orderType === 'TABLE'
                                        ? 'bg-[#114536] text-white border-[#114536] shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                🍽️ Table Dine-In
                            </button>
                        </div>

                        {orderType === 'TABLE' && (
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Assign Table Number *
                                </label>
                                <select
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 cursor-pointer"
                                >
                                    <option value="">Choose Table Number...</option>
                                    {tables.map(t => (
                                        <option key={t.id} value={t.table_number}>
                                            Table #{t.table_number} {t.status === 'active' ? '' : `(${t.status})`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    placeholder={orderType === 'TABLE' ? (selectedTable ? `Table #${selectedTable} Guest` : 'Guest Name') : 'Counter Customer'}
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-slate-900"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                    Phone (Optional)
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                        {cart.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5">
                                <ShoppingBag className="w-6 h-6 text-slate-300" />
                                <span>Tray is empty — tap any dish to add</span>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                            <VegNonVegSymbol isVeg={item.is_veg !== false} size="sm" />
                                            <span className="font-bold text-slate-900 truncate">
                                                {item.name}
                                            </span>
                                            {item.portion && (
                                                <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0">
                                                    {item.portion}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-mono font-black text-slate-900 shrink-0">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Item Note & Quantity Controls */}
                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                        <input
                                            type="text"
                                            placeholder="Cooking note (e.g. No mayo, Spicy)..."
                                            value={item.note || ''}
                                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                                            className="min-w-0 flex-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] text-slate-700 outline-none focus:border-slate-700"
                                        />

                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-md font-bold cursor-pointer"
                                            >
                                                <Minus className="w-3 h-3 text-slate-700" />
                                            </button>
                                            <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-md font-bold cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3 text-slate-700" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="w-5 h-5 flex items-center justify-center text-rose-500 hover:text-rose-700 ml-0.5 cursor-pointer"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Breakdown & Payment Options */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex justify-between font-medium text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-mono font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-600 font-medium">Discount (₹)</span>
                            <input
                                type="number"
                                min="0"
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold outline-none text-xs"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-600 font-medium">GST / Tax ({taxPercent}%)</span>
                            <input
                                type="number"
                                min="0"
                                value={taxPercent}
                                onChange={(e) => {
                                    setHasEditedTax(true);
                                    setTaxPercent(Math.max(0, Number(e.target.value)));
                                }}
                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold outline-none text-xs"
                            />
                        </div>

                        <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 text-slate-900">
                            <span>Grand Total</span>
                            <span className="font-mono text-emerald-700 text-base font-black">
                                ₹{grandTotal.toFixed(2)}
                            </span>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="pt-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`py-1.5 rounded-xl font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        paymentMethod === 'cash'
                                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>Cash</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('upi')}
                                    className={`py-1.5 rounded-xl font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        paymentMethod === 'upi'
                                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>UPI / QR</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('card')}
                                    className={`py-1.5 rounded-xl font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        paymentMethod === 'card'
                                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Card</span>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-3">
                            <button
                                type="button"
                                disabled={isSubmitting || cart.length === 0}
                                onClick={() => handleCreateOrder(false)}
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Send to Kitchen</span>
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting || cart.length === 0}
                                onClick={() => handleCreateOrder(true)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Pay & Print 🖨️</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Fast-Food Portion Selection Modal (McDonald's / KFC Style) */}
            {portionModalDish && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setPortionModalDish(null)}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-4 border border-slate-100 text-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <img
                                    src={portionModalDish.images?.[0] || portionModalDish.image_url || '/placeholderfood.png'}
                                    alt={portionModalDish.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <VegNonVegSymbol isVeg={portionModalDish.is_veg !== false} size="sm" />
                                        <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                                            {portionModalDish.name}
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Choose portion size & special instructions
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPortionModalDish(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Portion Sizes Grid */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                                Select Portion Size
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {portionModalDish.portions.map(p => {
                                    const pValue = p.value || p.label;
                                    const isSelected = selectedPortionValue === pValue;
                                    const pPrice = Number(p.price !== undefined && p.price !== 0
                                        ? p.price
                                        : (portionModalDish.base_price || portionModalDish.price || 0));

                                    return (
                                        <button
                                            key={pValue}
                                            type="button"
                                            onClick={() => setSelectedPortionValue(pValue)}
                                            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-extrabold ${isSelected ? 'text-emerald-900 font-black' : 'text-slate-800'}`}>
                                                    {p.label || p.value}
                                                </span>
                                                {isSelected && <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />}
                                            </div>
                                            <span className="text-xs font-black text-slate-900 mt-1">
                                                ₹{pPrice.toFixed(2)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Special Instructions Note */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 block">
                                Special Instructions (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Extra spicy, No onion, Less ice, Crispy..."
                                value={portionNote}
                                onChange={(e) => setPortionNote(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-slate-900"
                            />
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setPortionModalDish(null)}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPortionModal}
                                className="flex-1 py-2.5 bg-[#114536] hover:bg-[#0c3429] text-white rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer active:scale-95"
                            >
                                Add to Tray
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
