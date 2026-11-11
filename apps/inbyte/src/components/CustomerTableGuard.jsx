import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hasValidTableSession, updateCustomerSessionTable } from '../utils/session';
import { apiService } from '../utils/apiService';
import { useSettings } from '../context/SettingsContext';
import { QrCode, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RealQrScanner from './RealQrScanner';

export default function CustomerTableGuard({ children }) {
    const [searchParams] = useSearchParams();
    const { appName, logoUrl } = useSettings();

    const targetUrlCode = searchParams.get('table') || searchParams.get('qr');

    const [isValidatingUrl, setIsValidatingUrl] = useState(Boolean(targetUrlCode));
    const [hasAccess, setHasAccess] = useState(() => hasValidTableSession());
    const [errorMessage, setErrorMessage] = useState('');

    // Debounce/Lock ref to avoid multi-frame duplicate scans
    const isProcessingScanRef = useRef(false);

    // 1. If QR or Table code is passed directly in URL query (e.g. ?table=3 or ?qr=tbl-3)
    useEffect(() => {
        if (!targetUrlCode) {
            setHasAccess(hasValidTableSession());
            return;
        }

        let isMounted = true;
        setIsValidatingUrl(true);

        apiService.validateQRCode(targetUrlCode)
            .then(res => {
                if (!isMounted) return;
                if (res.valid) {
                    updateCustomerSessionTable(res.table_id, res.table_number, res.type || 'TABLE_SERVICE');
                    setHasAccess(true);
                    setErrorMessage('');
                    toast.success(
                        res.table_number ? `🍽️ Connected to Table #${res.table_number}` : '🎉 Connected to Menu!',
                        { id: 'table-connected-toast' }
                    );
                } else {
                    setHasAccess(false);
                    setErrorMessage(res.reason || 'This table QR code is invalid or unavailable.');
                }
            })
            .catch(err => {
                if (!isMounted) return;
                console.error('URL QR validation error:', err);
                setHasAccess(false);
                setErrorMessage('Unable to validate table. Please scan the QR code again.');
            })
            .finally(() => {
                if (isMounted) setIsValidatingUrl(false);
            });

        return () => {
            isMounted = false;
        };
    }, [targetUrlCode]);

    // Parse scanned URL or table code from the original Html5QrcodeScanner
    const handleScannedContent = (scannedString) => {
        if (!scannedString || isProcessingScanRef.current) return;
        isProcessingScanRef.current = true;

        let code = String(scannedString).trim();
        // If it's a full URL e.g. https://domain.com/qr/tbl-3 or ?table=3
        try {
            if (code.startsWith('http://') || code.startsWith('https://')) {
                const urlObj = new URL(code);
                const tableParam = urlObj.searchParams.get('table') || urlObj.searchParams.get('qr');
                if (tableParam) {
                    code = tableParam;
                } else if (urlObj.pathname.includes('/qr/')) {
                    code = urlObj.pathname.split('/qr/')[1];
                } else if (urlObj.pathname.includes('/table/')) {
                    code = urlObj.pathname.split('/table/')[1];
                }
            }
        } catch {
            // URL parse error fallback
        }

        if (code.includes('/')) {
            code = code.replace(/\/+$/, '');
        }

        validateAndUnlock(code).finally(() => {
            setTimeout(() => {
                isProcessingScanRef.current = false;
            }, 1500);
        });
    };

    const validateAndUnlock = async (tableOrCode) => {
        const toastId = toast.loading('Verifying table QR code...');
        try {
            const res = await apiService.validateQRCode(tableOrCode);
            if (res.valid) {
                updateCustomerSessionTable(res.table_id, res.table_number, res.type || 'TABLE_SERVICE');
                setHasAccess(true);
                setErrorMessage('');
                toast.success(
                    res.table_number ? `🎉 Connected to Table #${res.table_number}!` : '🎉 Connected to Menu!',
                    { id: toastId }
                );
            } else {
                toast.error(res.reason || 'Invalid table. Please check the code.', { id: toastId });
                setErrorMessage(res.reason || 'Invalid QR code. Please scan a valid table QR.');
            }
        } catch (err) {
            console.error('Validation error:', err);
            toast.error('Failed to verify table. Please try again.', { id: toastId });
            setErrorMessage('Unable to verify table QR code.');
        }
    };

    // If verifying a URL query param on initial mount
    if (isValidatingUrl) {
        return (
            <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/10 animate-bounce">
                    <QrCode className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Connecting to Table...</h2>
                <p className="text-xs text-slate-500 mt-1">Verifying your table session</p>
            </div>
        );
    }

    // If customer has already scanned a valid table QR code, grant full access!
    if (hasAccess) {
        return children;
    }

    // Otherwise, Full Screen Gate: Prompt customer to scan table QR code with original QR Scanner
    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
            {/* Top Branding Bar */}
            <header className="w-full max-w-lg mx-auto flex items-center justify-between py-2 z-10">
                <div className="flex items-center gap-3">
                    <img
                        src={logoUrl || '/logo.svg'}
                        alt={appName || 'InnBite'}
                        className="w-10 h-10 object-contain drop-shadow-sm"
                    />
                    <div>
                        <h2 className="text-base font-black tracking-tight text-slate-900 leading-tight">
                            {appName || 'InnBite'}
                        </h2>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                            Digital Dining Menu
                        </span>
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 shadow-xs">
                    <span>Dine-In</span>
                </div>
            </header>

            {/* Main Interactive QR Gate Card */}
            <main className="w-full max-w-md mx-auto my-auto py-4 sm:py-6 z-10 flex flex-col items-center text-center space-y-4 sm:space-y-5">
                {/* Headline & Description */}
                <div className="space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        Scan Table QR to Order
                    </h1>
                </div>

                {/* Error Banner if Invalid QR code */}
                {errorMessage && (
                    <div className="w-full p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 text-left font-medium">
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* ORIGINAL QR CODE SCANNER (Managed Package: html5-qrcode) */}
                <div className="w-full">
                    <RealQrScanner
                        onScanSuccess={handleScannedContent}
                        onScanError={() => {
                            // Suppress routine frame misses
                        }}
                    />
                </div>

                {/* Quick Steps */}
                <div className="w-full pt-1">
                    {/* 3 Step Instruction Pills */}
                    <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-black flex items-center justify-center shrink-0">
                                1
                            </span>
                            <p className="text-xs text-slate-600">
                                <b className="text-slate-900 font-bold">Locate QR code:</b> Look on your table stand or coaster.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-black flex items-center justify-center shrink-0">
                                2
                            </span>
                            <p className="text-xs text-slate-600">
                                <b className="text-slate-900 font-bold">Scan with camera:</b> Point your phone camera directly at the QR code.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-black flex items-center justify-center shrink-0">
                                3
                            </span>
                            <p className="text-xs text-slate-600">
                                <b className="text-slate-900 font-bold">Instant access:</b> The menu automatically unlocks for your table.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Assistance Info */}
            <footer className="w-full max-w-md mx-auto text-center py-3 z-10 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 font-medium">
                    Need assistance? Please notify our restaurant service staff.
                </p>
            </footer>
        </div>
    );
}
