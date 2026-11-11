import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 text-center relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* 404 Icon Badge */}
                <div className="w-20 h-20 bg-emerald-50 text-[#114536] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
                    <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} />
                </div>

                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black tracking-widest uppercase rounded-full mb-3">
                    Error 404
                </div>

                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                    Page Not Found
                </h1>

                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    The link you followed doesn't exist, may have been moved, or is temporarily unavailable.
                </p>

                {/* Back to Home CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-3.5 bg-[#114536] hover:bg-[#0c3328] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span>Return to Home</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Go Back</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
