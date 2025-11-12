import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export function HomePage() {
    const { t } = useLanguage();

    return (
        <>
            <section className="relative grid grid-cols-1 lg:grid-cols-2 place-items-center gap-8 min-h-dvh px-4 lg:px-32 bg-white">
                <div className="absolute bottom-0 -right-8 w-24 h-24 border-8 border-blue-500/50 rounded-full"></div>
                <div className="absolute top-12 -left-12 w-32 h-32 border-[20px] border-blue-500/50 rounded-full"></div>

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
            </section>

            <section className="py-8 px-4 lg:px-32 bg-gray-100">
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
            </section>
        </>
    );
}