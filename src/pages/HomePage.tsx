import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";

export function HomePage() {
    const { t } = useLanguage();
    const [openTab, setOpenTab] = useState<number | null>(null);

    return (
        <>
            <section className="px-8 lg:px-32 bg-white">
                <div className="min-h-dvh max-w-7xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 place-items-center gap-8 ">
                    <div className="absolute top-12 -left-8 w-32 h-32 border-[20px] border-blue-500/50 rounded-full"></div>
                    <div className="absolute bottom-0 -right-8 w-24 h-24 border-8 border-blue-500/50 rounded-full"></div>

                    <div className="flex justify-center items-center flex-col gap-8 pt-36 lg:pt-8">
                        <h1 className="text-6xl font-extrabold text-blue-500">{t.welcomeJumbotron}</h1>

                        <Link to={'/detection'} className="w-max mt-12 p-4 text-2xl text-blue-900 bg-white font-bold border rounded-full shadow-2xl animate-bounce cursor-pointer
                transition duration-500 hover:bg-orange-400 hover:text-white
            ">
                            {t.startDetection}
                        </Link>
                    </div>
                    <div className="w-96">
                        <img src="./images/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>

            <section className="py-8 px-8 lg:px-32 bg-gray-100">
                <div className="max-w-7xl mx-auto">
                    <h2 className="mb-8 text-center text-orange-500 text-4xl font-bold">{t.keyFeatures}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex justify-center items-center flex-col gap-4 p-8 bg-white shadow-2xl rounded transition duration-500 hover:-translate-y-2">
                            <i className="fa-solid fa-camera text-6xl text-blue-500"></i>
                            <h3 className="font-bold text-lg text-center">{t.detectRealtime}</h3>
                        </div>
                        <div className="flex justify-center items-center flex-col gap-4 p-8 bg-white shadow-2xl rounded transition duration-500 hover:-translate-y-2">
                            <i className="fa-solid fa-database text-6xl text-blue-500"></i>
                            <h3 className="font-bold text-lg text-center">{t.createDataset}</h3>
                        </div>
                        <div className="flex justify-center items-center flex-col gap-4 p-8 bg-white shadow-2xl rounded transition duration-500 hover:-translate-y-2">
                            <i className="fa-solid fa-brain text-6xl text-blue-500"></i>
                            <h3 className="font-bold text-lg text-center">{t.createModel}</h3>
                        </div>
                        <div className="flex justify-center items-center flex-col gap-4 p-8 bg-white shadow-2xl rounded transition duration-500 hover:-translate-y-2">
                            <i className="fa-solid fa-chart-pie text-6xl text-blue-500"></i>
                            <h3 className="font-bold text-lg text-center">{t.interactiveChart}</h3>
                        </div>
                        <div className="flex justify-center items-center flex-col gap-4 p-8 bg-white shadow-2xl rounded transition duration-500 hover:-translate-y-2">
                            <i className="fa-solid fa-mobile-screen-button text-6xl text-blue-500"></i>
                            <h3 className="font-bold text-lg text-center">{t.canInstall}</h3>
                        </div>
                        <div className="flex justify-center items-center flex-col gap-4 p-8 bg-white shadow-2xl rounded transition duration-500 hover:-translate-y-2">
                            <i className="fa-solid fa-language text-6xl text-blue-500"></i>
                            <h3 className="font-bold text-lg text-center">{t.languageSupport}</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-8 px-8 lg:px-32 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="mb-8 text-center text-orange-500 text-4xl font-bold">FAQ</h2>

                    <div
                        className={`p-4 mb-6 shadow-lg rounded
                        ${openTab === 0 ? 'text-white bg-blue-500' : 'bg-gray-100/50 text-blue-500'}`}
                    >
                        <div
                            onClick={() => openTab === 0 ? setOpenTab(null) : setOpenTab(0)}
                            className="flex justify-between gap-4 cursor-pointer transition-opacity duration-500 hover:opacity-75">
                            <h3 className="font-extrabold">{t.offlineModeTitleFaq}</h3>
                            <i className={`fa-solid fa-angle-down transition duration-500 ${openTab === 0 ? 'rotate-180' : 'rotate-0'}`}></i>
                        </div>

                        <p className={`transition duration-500 overflow-hidden origin-top ${openTab === 0 ? 'h-max scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'}`}>
                            {t.offlineModeDescFaq}
                        </p>
                    </div>
                    <div
                        className={`p-4 mb-6 shadow-lg rounded
                        ${openTab === 1 ? 'text-white bg-blue-500' : 'bg-gray-100/50 text-blue-500'}`}
                    >
                        <div
                            onClick={() => openTab === 1 ? setOpenTab(null) : setOpenTab(1)}
                            className="flex justify-between gap-4 cursor-pointer transition-opacity duration-500 hover:opacity-75">
                            <h3 className="font-extrabold">{t.installAppTitleFAq}</h3>
                            <i className={`fa-solid fa-angle-down transition duration-500 ${openTab === 1 ? 'rotate-180' : 'rotate-0'}`}></i>
                        </div>

                        <div className={`transition duration-500 overflow-hidden origin-top ${openTab === 1 ? 'h-max scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'}`}>
                            <p>{t.installAppPCDescFaq}</p>
                            <img src="./images/install-pc.png" alt="Photo install on PC" className="rounded" />
                            <p>{t.installAppHpDescFaq}</p>
                            <img src="./images/install-hp.png" alt="Photo install on Handphone" className="rounded" />
                        </div>
                    </div>
                    <div
                        className={`p-4 mb-6 shadow-lg rounded
                        ${openTab === 2 ? 'text-white bg-blue-500' : 'bg-gray-100/50 text-blue-500'}`}
                    >
                        <div
                            onClick={() => openTab === 2 ? setOpenTab(null) : setOpenTab(2)}
                            className="flex justify-between gap-4 cursor-pointer transition-opacity duration-500 hover:opacity-75">
                            <h3 className="font-extrabold">{t.storageTitleFaq}</h3>
                            <i className={`fa-solid fa-angle-down transition duration-500 ${openTab === 2 ? 'rotate-180' : 'rotate-0'}`}></i>
                        </div>

                        <p className={`transition duration-500 overflow-hidden origin-top ${openTab === 2 ? 'h-max scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'}`}>
                            {t.storageDescFaq}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}