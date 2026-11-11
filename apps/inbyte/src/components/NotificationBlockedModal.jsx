import React, { useState } from 'react';
import {
    BellOff,
    X,
    RotateCw,
    Smartphone,
    Apple,
    Monitor,
    CheckCircle2,
    Sliders,
    Lock,
    Share2,
    Bell
} from 'lucide-react';

export default function NotificationBlockedModal({
    isOpen,
    onClose,
    onCheckAgain
}) {
    // Auto-detect initial tab based on user agent
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof navigator !== 'undefined') {
            const ua = navigator.userAgent || '';
            if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
            if (/Android/i.test(ua)) return 'android';
        }
        return 'android';
    });

    if (!isOpen) return null;

    const handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 max-w-lg w-full space-y-5 text-slate-900 animate-scale-up relative max-h-[92vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Banner */}
                <div className="flex items-start gap-3.5 pr-8">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                        <BellOff className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                            Browser Notifications Blocked
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Your browser has blocked notification alerts for this site. To receive loud order rings on your lock screen, follow the quick steps below to set permission to <b>Allow</b>.
                        </p>
                    </div>
                </div>

                {/* Device Selector Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'android'
                                ? 'bg-white text-slate-900 shadow-sm font-black'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Android</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('ios')}
                        className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'ios'
                                ? 'bg-white text-slate-900 shadow-sm font-black'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Apple className="w-4 h-4 text-slate-800" />
                        <span>iPhone / iPad</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('desktop')}
                        className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'desktop'
                                ? 'bg-white text-slate-900 shadow-sm font-black'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Monitor className="w-4 h-4 text-indigo-600" />
                        <span>PC / Laptop</span>
                    </button>
                </div>

                {/* Step-by-Step Instructions Container */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                    {activeTab === 'android' && (
                        <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                        <span>1. Tap Lock or Settings Icon</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        In Chrome address bar at the top, tap the <b>🔒 Lock</b> or <b>Tune (Sliders)</b> icon next to the URL.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Sliders className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>2. Tap &quot;Permissions&quot; or &quot;Site Settings&quot;</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Select <b>Permissions</b> from the popup menu that appears.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Bell className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>3. Change Notifications to &quot;Allow&quot;</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Find <b>Notifications</b> and switch toggle to <b>Allow / ON</b>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <RotateCw className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>4. Reload Page</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Return here and tap <b>&quot;Reload &amp; Activate&quot;</b> below to start receiving alerts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ios' && (
                        <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Share2 className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>1. Add to Home Screen (Mandatory on iOS)</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Tap the Safari <b>Share icon (square with arrow)</b> ➔ choose <b>&quot;Add to Home Screen&quot; (+)</b>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Smartphone className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>2. Launch App from Home Screen</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Open InnBite from the new icon on your iPhone home screen (Apple Web Push requires Home Screen PWA mode).
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Sliders className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>3. Turn ON Notifications in iOS Settings</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Go to iPhone <b>Settings ➔ InnBite (or Safari) ➔ Notifications ➔ Turn ON &quot;Allow Notifications&quot;</b> and Sound.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'desktop' && (
                        <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>1. Click Padlock / Tune Icon</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        In your browser address bar, click the <b>Padlock (🔒)</b> or sliders icon next to the web address.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <Bell className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>2. Switch Notifications to &quot;Allow&quot;</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Find <b>Notifications</b> dropdown/toggle and select <b>Allow</b>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    <RotateCw className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">
                                        <span>3. Reload Page</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Click <b>&quot;Reload &amp; Activate&quot;</b> below to apply changes and receive alerts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Helpful Note */}
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                    <span className="text-base shrink-0">💡</span>
                    <span>
                        Browsers do not permit websites to unblock notifications automatically. Following these 3-4 steps takes only 5 seconds.
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={handleReload}
                        className="w-full sm:flex-1 py-3 bg-[#114536] hover:bg-[#0c382b] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RotateCw className="w-4 h-4 text-emerald-300" />
                        <span>Reload &amp; Activate</span>
                    </button>

                    {onCheckAgain && (
                        <button
                            type="button"
                            onClick={onCheckAgain}
                            className="w-full sm:flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Check Again</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
