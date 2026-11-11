import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages, ChevronDown, Check } from 'lucide-react';

export default function LanguageToggle({ className = '', variant = 'header' }) {
    const { setLanguage, isMalayalam } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (lang) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    if (variant === 'pill') {
        return (
            <div className={`inline-flex items-center bg-black/20 backdrop-blur-md rounded-full p-0.5 border border-white/20 select-none shadow-xs ${className}`}>
                <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                        !isMalayalam
                            ? 'bg-white text-emerald-950 shadow-xs scale-100 font-extrabold'
                            : 'text-white/80 hover:text-white'
                    }`}
                >
                    EN
                </button>
                <button
                    type="button"
                    onClick={() => setLanguage('ml')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                        isMalayalam
                            ? 'bg-amber-400 text-amber-950 shadow-xs scale-100 font-extrabold'
                            : 'text-white/80 hover:text-white'
                    }`}
                >
                    മലയാളം
                </button>
            </div>
        );
    }

    // Reference design: White rounded pill with Languages icon (文A), language code, and Chevron down
    return (
        <div ref={containerRef} className={`relative inline-block select-none ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-white hover:bg-slate-50 active:scale-95 border border-white/80 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title={isMalayalam ? 'Change language (ഭാഷ മാറ്റുക)' : 'Change language'}
                aria-label="Select language"
                aria-expanded={isOpen}
            >
                {/* Languages icon (文A) */}
                <Languages className="w-4 h-4 text-[#072b21] stroke-[2.2] shrink-0" />

                {/* Current Language Label */}
                <span className="text-xs sm:text-[13px] font-extrabold text-[#072b21] tracking-tight leading-none px-0.5">
                    {isMalayalam ? 'മല' : 'EN'}
                </span>

                {/* Dropdown Chevron Arrow */}
                <ChevronDown
                    className={`w-3.5 h-3.5 text-[#072b21] stroke-[2.5] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {/* Dropdown Menu Popup */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in text-slate-800">
                    <button
                        type="button"
                        onClick={() => handleSelect('en')}
                        className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-emerald-50/60 transition-colors cursor-pointer ${
                            !isMalayalam ? 'text-[#072b21] bg-emerald-50/80 font-black' : 'text-slate-700'
                        }`}
                    >
                        <span>English (EN)</span>
                        {!isMalayalam && <Check className="w-3.5 h-3.5 text-[#072b21] stroke-[3]" />}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelect('ml')}
                        className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-emerald-50/60 transition-colors cursor-pointer ${
                            isMalayalam ? 'text-[#072b21] bg-emerald-50/80 font-black' : 'text-slate-700'
                        }`}
                    >
                        <span>മലയാളം (ML)</span>
                        {isMalayalam && <Check className="w-3.5 h-3.5 text-[#072b21] stroke-[3]" />}
                    </button>
                </div>
            )}
        </div>
    );
}
