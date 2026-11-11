import React from 'react';
import { Bell, ShieldCheck, Zap, Smartphone, CheckCircle2 } from 'lucide-react';

export default function NotificationSetupModal({
    isOpen,
    onEnable,
    isEnabling = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-w-md w-full space-y-6 text-slate-900 animate-scale-up relative">
                {/* Glowing Icon Header */}
                <div className="flex flex-col items-center text-center space-y-3 pt-2">
                    <div className="w-16 h-16 rounded-3xl bg-[#114536] text-white flex items-center justify-center shadow-xl shadow-emerald-950/20 relative">
                        <Bell className="w-8 h-8 animate-bounce text-emerald-300" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-900">
                            1
                        </span>
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Activate Order Alerts
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
                            InnBite plays loud ringing chimes when customer orders arrive, even when your phone is locked or minimized.
                        </p>
                    </div>
                </div>

                {/* Benefits List */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Instant Loud Ringing</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                                Rings continuously so you never miss a new kitchen order.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Wakes Up Lock Screen</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                                Shows incoming table &amp; item details even with screen turned off.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">One-Time Setup Only</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                                Tap <b>Allow</b> once on this device. Saved permanently for future shifts!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={onEnable}
                        disabled={isEnabling}
                        className="w-full py-4 bg-[#114536] hover:bg-[#0c382b] text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                        <Bell className="w-4 h-4 text-emerald-300" />
                        <span>{isEnabling ? 'Activating Alerts...' : 'Turn ON Order Alerts & Continue'}</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        Next, your browser will ask for confirmation. Tap <b>&quot;Allow&quot;</b>.
                    </p>
                </div>
            </div>
        </div>
    );
}
