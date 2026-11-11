import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
    TRANSLATIONS,
    getLocalizedCategoryName,
    getLocalizedDishName,
    getLocalizedDishDescription,
    getLocalizedDishPreparation,
    getLocalizedPortion,
    getLocalizedIngredient,
    getLocalizedAllergen,
    getLocalizedTaste
} from '../utils/translations';
import {
    getCachedTranslation,
    fetchLiveTranslation,
    subscribeToTranslations,
    isMalayalamText
} from '../utils/autoTranslate';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        try {
            return localStorage.getItem('innbite_language') || 'en';
        } catch {
            return 'en';
        }
    });

    // Version counter incremented whenever a live translation arrives
    const [, setTranslationVersion] = useState(0);

    useEffect(() => {
        return subscribeToTranslations(() => {
            setTranslationVersion(v => v + 1);
        });
    }, []);

    const setLanguage = useCallback((lang) => {
        const target = lang === 'ml' ? 'ml' : 'en';
        setLanguageState(target);
        try {
            localStorage.setItem('innbite_language', target);
            document.documentElement.lang = target;
        } catch (e) {
            console.warn('Failed to save language preference:', e);
        }
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguageState(prev => {
            const next = prev === 'en' ? 'ml' : 'en';
            try {
                localStorage.setItem('innbite_language', next);
                document.documentElement.lang = next;
            } catch (e) {
                console.warn('Failed to save language preference:', e);
            }
            return next;
        });
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const t = useMemo(() => {
        return (key, fallback = '') => {
            const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
            if (dict[key]) return dict[key];
            if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
            return fallback || key;
        };
    }, [language]);

    // Dynamic Live Category Translator
    const getCategoryTitle = useCallback((catName) => {
        if (!catName) return '';
        if (language !== 'ml' || isMalayalamText(catName)) return catName;

        const cached = getCachedTranslation(catName);
        if (cached) return cached;

        const dictTranslated = getLocalizedCategoryName(catName, 'ml');
        if (dictTranslated && dictTranslated !== catName) {
            return dictTranslated;
        }

        // Fire on-the-fly live translation for newly created category
        fetchLiveTranslation(catName, 'en', 'ml');
        return dictTranslated || catName;
    }, [language]);

    // Dynamic Live Dish Translator
    const getDishTitle = useCallback((name) => {
        if (!name) return '';
        if (language !== 'ml' || isMalayalamText(name)) return name;

        const cached = getCachedTranslation(name);
        if (cached) return cached;

        const dictTranslated = getLocalizedDishName(name, 'ml');
        if (dictTranslated && dictTranslated !== name) {
            return dictTranslated;
        }

        // Fire on-the-fly live translation for newly created product
        fetchLiveTranslation(name, 'en', 'ml');
        return dictTranslated || name;
    }, [language]);

    // Dynamic Live Description Translator
    const getDishDescription = useCallback((desc, name) => {
        if (!desc) return '';
        if (language !== 'ml' || isMalayalamText(desc)) return desc;

        const cached = getCachedTranslation(desc);
        if (cached) return cached;

        const dictTranslated = getLocalizedDishDescription(desc, name, 'ml');

        // Fire on-the-fly live translation for newly created product description
        fetchLiveTranslation(desc, 'en', 'ml');
        return dictTranslated || desc;
    }, [language]);

    // Dynamic Live Preparation Translator
    const getDishPreparation = useCallback((prep, name) => {
        if (!prep) return '';
        if (language !== 'ml' || isMalayalamText(prep)) return prep;

        const cached = getCachedTranslation(prep);
        if (cached) return cached;

        const dictTranslated = getLocalizedDishPreparation(prep, name, 'ml');

        // Fire on-the-fly live translation for preparation notes
        fetchLiveTranslation(prep, 'en', 'ml');
        return dictTranslated || prep;
    }, [language]);

    const getPortionTitle = useCallback((portion) => getLocalizedPortion(portion, language), [language]);
    const getIngredientTitle = useCallback((ing) => {
        if (!ing) return '';
        if (language !== 'ml' || isMalayalamText(ing)) return ing;
        const cached = getCachedTranslation(ing);
        if (cached) return cached;
        const dictTranslated = getLocalizedIngredient(ing, language);
        if (dictTranslated && dictTranslated !== ing) return dictTranslated;
        fetchLiveTranslation(ing, 'en', 'ml');
        return dictTranslated || ing;
    }, [language]);

    const getAllergenTitle = useCallback((all) => getLocalizedAllergen(all, language), [language]);
    const getTasteTitle = useCallback((taste) => getLocalizedTaste(taste, language), [language]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        toggleLanguage,
        isMalayalam: language === 'ml',
        t,
        getCategoryTitle,
        getDishTitle,
        getDishDescription,
        getDishPreparation,
        getPortionTitle,
        getIngredientTitle,
        getAllergenTitle,
        getTasteTitle
    }), [
        language,
        t,
        getCategoryTitle,
        getDishTitle,
        getDishDescription,
        getDishPreparation,
        getPortionTitle,
        getIngredientTitle,
        getAllergenTitle,
        getTasteTitle,
        toggleLanguage,
        setLanguage
    ]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // Safe fallback if used outside Provider
        return {
            language: 'en',
            setLanguage: () => {},
            toggleLanguage: () => {},
            isMalayalam: false,
            t: (k, fb = '') => fb || k,
            getCategoryTitle: (n) => n,
            getDishTitle: (n) => n,
            getDishDescription: (d) => d,
            getDishPreparation: (p) => p,
            getPortionTitle: (p) => p,
            getIngredientTitle: (i) => i,
            getAllergenTitle: (a) => a,
            getTasteTitle: (t) => t
        };
    }
    return context;
};
