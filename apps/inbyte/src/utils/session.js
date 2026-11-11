// Session management for customer guest ordering
// Enforces: QR, Table, Customer Session, Cart, and Order are distinct entities!
import { secureStorage } from './secureStorage';

const SESSION_KEY = 'orderly_customer_session';

const getEnvServiceMode = () => {
    return import.meta.env.VITE_SERVICE_MODE || 'TABLE_SERVICE';
};

export const getOrCreateCustomerSession = () => {
    let session = null;
    try {
        session = secureStorage.getSessionItem(SESSION_KEY);
    } catch (e) {
        console.error('Failed to parse customer session:', e);
    }

    const defaultMode = getEnvServiceMode();

    if (!session || !session.session_id) {
        session = {
            session_id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            service_mode: defaultMode,
            table_id: defaultMode === 'SELF_SERVICE' ? null : null,
            table_number: defaultMode === 'SELF_SERVICE' ? null : null,
            active_order_id: null
        };
        saveCustomerSession(session);
    }

    return session;
};

export const saveCustomerSession = (session) => {
    try {
        secureStorage.setSessionItem(SESSION_KEY, session);
    } catch (e) {
        console.error('Failed to save customer session:', e);
    }
};

export const updateCustomerSessionTable = (tableId, tableNumber, serviceMode) => {
    const session = getOrCreateCustomerSession();
    const activeMode = serviceMode || getEnvServiceMode();
    session.service_mode = activeMode;
    session.table_id = activeMode === 'SELF_SERVICE' ? null : tableId;
    session.table_number = activeMode === 'SELF_SERVICE' ? null : tableNumber;
    session.has_scanned_qr = true;
    session.qr_scanned_at = new Date().toISOString();
    saveCustomerSession(session);
    try {
        secureStorage.setSessionItem('orderly_has_scanned_qr', 'true');
        if (tableNumber) {
            secureStorage.setItem('orderly_table_number', String(tableNumber));
        }
    } catch {
        // Storage access fallback
    }
    return session;
};

export const hasValidTableSession = () => {
    try {
        const session = secureStorage.getSessionItem(SESSION_KEY);
        const hasScannedSession = secureStorage.getSessionItem('orderly_has_scanned_qr');
        const storedTable = secureStorage.getItem('orderly_table_number');

        if (!session) return false;

        // If self service mode: must have scanned common QR
        if (session.service_mode === 'SELF_SERVICE') {
            return Boolean(session.has_scanned_qr || hasScannedSession === 'true');
        }

        // Table service mode: must have assigned table and verified QR scan
        const hasTable = Boolean(session.table_number || session.table_id || storedTable);
        const hasScanned = Boolean(session.has_scanned_qr || hasScannedSession === 'true');

        return Boolean(hasTable && hasScanned);
    } catch {
        return false;
    }
};

export const clearCustomerSession = () => {
    try {
        secureStorage.removeSessionItem(SESSION_KEY);
        secureStorage.removeSessionItem('orderly_has_scanned_qr');
        secureStorage.removeItem('orderly_table_number');
    } catch (e) {
        console.error('Failed to clear customer session:', e);
    }
};
