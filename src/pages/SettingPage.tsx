import { useState } from "react";
import { Tab1Page } from "./SettingTabs/Tab1Page";
import { Tab2Page } from "./SettingTabs/Tab2Page";
import { useLanguage } from "../contexts/LanguageContext";

export function SettingPage() {
    const { t } = useLanguage();
    const [currentIndexTab, setCurrentIndexTab] = useState(0);

    const tabs = [
        <Tab1Page></Tab1Page>,
        <Tab2Page></Tab2Page>,
    ];

    return (
        <div className="px-4 sm:px-8 pt-24 pb-8">
            <h1 className="mb-8 font-bold text-4xl text-center text-yellow-900">{t.setting}</h1>

            <div className="max-w-lg block mx-auto mt-8">
                <section className="flex">
                    <button
                        onClick={() => setCurrentIndexTab(0)}
                        className={`${currentIndexTab === 0 ? 'bg-blue-700 text-white scale-110 origin-left' : 'bg-white text-blue-500'} p-4 text-left border rounded-t font-semibold cursor-pointer transition duration-500 hover:hover:bg-blue-700 hover:text-white`}>
                        <span>Model</span> <i className="fa-solid fa-brain"></i>
                    </button>
                    <button
                        onClick={() => setCurrentIndexTab(1)}
                        className={`${currentIndexTab === 1 ? 'bg-blue-700 text-white scale-110 origin-left' : 'bg-white text-blue-500'} p-4 text-left border rounded-t font-semibold cursor-pointer transition duration-500 hover:hover:bg-blue-700 hover:text-white`}>
                        <span>{t.language}</span> <i className="fa-solid fa-language"></i>
                    </button>
                    <button
                        onClick={() => setCurrentIndexTab(2)}
                        className={`${currentIndexTab === 2 ? 'bg-blue-700 text-white scale-110 origin-left' : 'bg-white text-blue-500'} p-4 text-left border rounded-t font-semibold cursor-pointer transition duration-500 hover:hover:bg-blue-700 hover:text-white`}>
                        <span>Install</span> <i className="fa-solid fa-mobile-screen-button"></i>
                    </button>
                </section>

                <section className="flex-1 p-4 border rounded-se rounded-b shadow-2xl">
                    {tabs[currentIndexTab]}
                </section>
            </div>
        </div>
    );
}