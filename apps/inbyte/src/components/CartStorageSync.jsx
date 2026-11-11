import { useEffect, useRef } from 'react';
import { useCart } from 'react-use-cart';

function stripDerivedTotals(list) {
    return (Array.isArray(list) ? list : []).map((item) => {
        const clone = { ...item };
        delete clone.itemTotal;
        return clone;
    });
}

export default function CartStorageSync() {
    const { items, setItems, emptyCart } = useCart();
    const itemsJsonRef = useRef('[]');
    itemsJsonRef.current = JSON.stringify(items || []);

    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key !== 'react-use-cart' && event.key !== null) return;
            if (!event.newValue) {
                try {
                    const currComparable = JSON.parse(itemsJsonRef.current);
                    if (Array.isArray(currComparable) && currComparable.length > 0) {
                        emptyCart();
                    }
                } catch {
                    emptyCart();
                }
                return;
            }
            try {
                const parsed = JSON.parse(event.newValue);
                if (!Array.isArray(parsed?.items)) return;

                const nextComparable = stripDerivedTotals(parsed.items);
                const currComparable = stripDerivedTotals(JSON.parse(itemsJsonRef.current));

                if (JSON.stringify(nextComparable) === JSON.stringify(currComparable)) {
                    return;
                }

                if (parsed.items.length === 0) {
                    emptyCart();
                } else {
                    setItems(parsed.items);
                }
            } catch {
                // Ignore malformed storage payload
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [setItems, emptyCart]);

    return null;
}
