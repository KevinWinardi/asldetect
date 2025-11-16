import { useLanguage } from "../contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="py-4 font-bold text-center bg-white shadow-xl">
            {t.copyright} @ {new Date().getFullYear()}
        </footer>
    );
}