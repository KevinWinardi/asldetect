import { useLanguage } from "../../contexts/LanguageContext";

export function Tab2Page() {
    const { language, setLanguage } = useLanguage();

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => setLanguage('en')}
                    className={`flex flex-1 justify-start items-center gap-4 p-4 rounded shadow-lg cursor-pointer ${language === 'en' ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-black'}`}>
                    <img src="./images/usa.png" alt="USA" className="w-16 aspect-video" />
                    <p>English (USA)</p>
                </button>
                <button
                    onClick={() => setLanguage('id')}
                    className={`flex flex-1 justify-start items-center gap-4 p-4 rounded shadow-lg cursor-pointer ${language === 'id' ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-black'}`}>
                    <img src="./images/idn.png" alt="Indonesian" className="w-16 aspect-video" />
                    <p>Indonesian</p>
                </button>
            </div>
        </>
    );
}