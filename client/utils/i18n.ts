import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import FetchBackend from "i18next-fetch-backend";

i18next
    .use(FetchBackend)
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        fallbackLng: "ru",
        supportedLngs: ["ru", "en"],
        ns: ["global"],
        defaultNS: "global",
        backend: { 
            loadPath: `/locales/{{lng}}/{{ns}}.json`
        },
        interpolation: {
            escapeValue: false
        },
        react: {
          useSuspense: false
        }
    });

export const LANGUAGES = [{
    key: "en",
    abbr: "En",
    name: "English",
    displayName: "English"
}, {
    key: "ru",
    abbr: "Ru",
    title: "Russian",
    displayName: "Русский"
}];