import React, { useEffect, useRef } from "react";
import type { SplitDataType } from "../../types/splitDataType";
import { ChartJS } from "../../utils/ChartJS";
import { useLanguage } from "../../contexts/LanguageContext";

function InformationHelper() {
    const { t } = useLanguage();

    return (
        <section className="flex flex-col gap-4 mt-4">
            <p>{t.splitInfo}</p>
            <div className="p-2 border rounded sahdow">
                <p className="font-semibold">{t.train} Data</p>
                <p className="mt-2">{t.trainInfo}</p>
            </div>
            <div className="p-2 border rounded sahdow">
                <p className="font-semibold">{t.val} Data</p>
                <p className="mt-2">{t.valInfo}</p>
            </div>
            <div className="p-2 border rounded sahdow">
                <p className="font-semibold">{t.test} Data</p>
                <p className="mt-2">{t.testInfo}</p>
            </div>
        </section>
    );
}

export function Step2Page({
    isStep2Valid,
    setIsStep2Valid,
    splitData,
    setSplitData,
}: {
    isStep2Valid: boolean | null,
    setIsStep2Valid: React.Dispatch<React.SetStateAction<boolean | null>>,
    splitData: SplitDataType,
    setSplitData: React.Dispatch<React.SetStateAction<SplitDataType>>,
}) {
    const { t } = useLanguage();
    const splitDataCanvasElementRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const values = [splitData.train, splitData.val, splitData.test];
        ChartJS.createSplitDataChart({
            element: splitDataCanvasElementRef.current,
            splitData: splitData,
            title: t.splitDataRatio,
        });

        if (values.some(v => v === null)) {
            setIsStep2Valid(null);
            return;
        }

        const nums = values.map(Number);
        const sum = nums.reduce((a, b) => a + b, 0);

        if (nums.some(v => isNaN(v) || !Number.isInteger(v) || v <= 0) || sum !== 100) {
            setIsStep2Valid(false);
        } else {
            setIsStep2Valid(true);
        }
    }, [splitData]);

    const inputs = [
        { id: 'train', label: t.train },
        { id: 'val', label: t.val },
        { id: 'test', label: t.test },
    ]

    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">2. {t.splitDataTrainValTest}</h2>

            <InformationHelper />

            <section className="flex flex-col sm:flex-row gap-8 mt-8 rounded">
                {
                    inputs.map(({ id, label }) => (
                        <div key={id} className="flex flex-col">
                            <label htmlFor={`${id}-percentage`} className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">{label}</label>
                            <div className="relative">
                                <input
                                    value={splitData[id as keyof SplitDataType] ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSplitData(prev => ({
                                            ...prev,
                                            [id]: value === '' ? null : Number(e.target.value),
                                        }))
                                    }}
                                    id={`${id}-percentage`}
                                    type="number"
                                    step={1}
                                    className="w-9/12 p-2 border rounded-es" />
                                <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-3/12 font-semibold text-black bg-gray-300 border border-black rounded-r">
                                    %
                                </span>
                            </div>
                        </div>
                    ))
                }
            </section>

            {
                isStep2Valid === false && (
                    <p className="mt-2 text-sm text-red-500">{t.invalidSplit}</p>
                )
            }

            <section className="mt-4 italic">
                <p>{t.splitRecomend}</p>
                <ul className="list-inside list-disc">
                    <li className="ml-4">70 : 15 : 15</li>
                    <li className="ml-4">80 : 10 : 10</li>
                    <li className="ml-4">90 : 5 : 5</li>
                </ul>
            </section>

            <section className="mt-8">
                <canvas ref={splitDataCanvasElementRef}></canvas>
            </section>

            <div className="flex justify-center mt-12">
                <button
                    onClick={() => {
                        setSplitData({
                            train: 70,
                            val: 15,
                            test: 15,
                        })
                    }}
                    className={`
                            px-4 py-2 font-bold text-white bg-green-500 border-b-4 border-black rounded
                            cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                    <i className="fa-solid fa-star"></i> {t.useRecomend}
                </button>
            </div>
        </>
    );
}
