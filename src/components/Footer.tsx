import { useLanguage } from "../contexts/LanguageContext";
export function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="py-4 font-bold text-center bg-white shadow-xl">
            <a href="https://github.com/kevinwinardi">
                {t.copyright} &copy; 2025 - {new Date().getFullYear()} Kevin Winardi
            </a>
        </footer>
    );
}
