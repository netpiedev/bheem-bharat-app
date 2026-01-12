import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import i18n from "../i18n";

type Lang = "en" | "hi" | "mr" | "bn";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {}, []);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("LANG");
      if (stored) {
        i18n.locale = stored;
        setLangState(stored as Lang);
      }
    })();
  }, []);

  const setLang = useCallback(async (newLang: Lang) => {
    console.log("🔵 [LanguageContext] setLang called - changing to:", newLang);

    // Update locale FIRST, synchronously - this is immediate
    i18n.locale = newLang;

    // Then update state to trigger re-render
    setLangState((prevLang) => {
      console.log(
        "🔵 [LanguageContext] setLangState callback - prev:",
        prevLang,
        "new:",
        newLang
      );
      return newLang;
    });

    // Save to storage asynchronously (don't await - fire and forget)
    AsyncStorage.setItem("LANG", newLang).catch(() => {
      // Silently handle storage errors
    });
  }, []);

  const t = useCallback(
    (key: string) => {
      // Always read from current i18n.locale (not cached)
      const translation = i18n.t(key);
      // Only log first few calls to avoid spam
      if (Math.random() < 0.1) {
        console.log(
          `🟢 [LanguageContext] t("${key}") - lang: ${lang}, i18n.locale: ${i18n.locale}, result: "${translation}"`
        );
      }
      return translation;
    },
    [lang]
  );

  // Memoize context value to ensure re-renders when lang changes
  const contextValue = useMemo(() => {
    return { lang, setLang, t };
  }, [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
