import React, { useEffect, useRef } from "react";
import type { SplitDataType } from "../../types/splitDataType";

function InformationHelper() {
    return (
        <section className="flex flex-col gap-4 mt-4">
            <p>Data in machine learning needs to be divided into 3 parts, namely training, validation, and testing data.</p>
            <div className="p-2 border rounded sahdow">
                <p className="font-semibold">Training Data</p>
                <p className="mt-2">This is the largest portion of the dataset and is used to train the machine learning model. The model learns patterns, relationships, and features from this data to make predictions or classifications.</p>
            </div>
            <div className="p-2 border rounded sahdow">
                <p className="font-semibold">Validation Data</p>
                <p className="mt-2"> This set is used during the training phase to evaluate the model's performance on unseen data and to tune hyperparameters.</p>
            </div>
            <div className="p-2 border rounded sahdow">
                <p className="font-semibold">Testing Data</p>
                <p className="mt-2"> This is a completely independent set of data, held out throughout the entire model development process, and is used to provide an unbiased evaluation of the final, chosen model.</p>
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
    isStep2Valid: boolean,
    setIsStep2Valid: React.Dispatch<React.SetStateAction<boolean>>,
    splitData: SplitDataType,
    setSplitData: React.Dispatch<React.SetStateAction<SplitDataType>>,
}) {
    const trainInputElementRef = useRef<HTMLInputElement | null>(null);
    const valInputElementRef = useRef<HTMLInputElement | null>(null);
    const testInputElementRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const values = [splitData.train, splitData.val, splitData.test].map(Number);
        const sum = values.reduce((a, b) => a + b, 0);

        // Validation
        if (values.some(v => isNaN(v) || !Number.isInteger(v) || v <= 0) || sum !== 100) {
            setIsStep2Valid(false);
            return;
        }

        setIsStep2Valid(true);
    }, [splitData]);

    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">2. Split data train/val/test</h2>

            <InformationHelper />

            <section className="flex flex-col sm:flex-row gap-8 mt-8 rounded">
                <div className="flex flex-col">
                    <label htmlFor="train-percentage" className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">Train</label>
                    <div className="relative">
                        <input
                            ref={trainInputElementRef}
                            value={splitData.train}
                            onChange={(e) => setSplitData(prev => ({
                                ...prev,
                                train: Number(e.target.value)
                            }))}
                            id="train-percentage"
                            type="number"
                            step={1}
                            className="w-9/12 p-2 border rounded-es" />
                        <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-3/12 font-semibold text-black bg-gray-300 border border-black rounded-r">
                            %
                        </span>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="val-percentage" className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">Validation</label>
                    <div className="relative">
                        <input
                            ref={valInputElementRef}
                            value={splitData.val}
                            onChange={(e) => setSplitData(prev => ({
                                ...prev,
                                val: Number(e.target.value)
                            }))}
                            id="val-percentage"
                            type="number"
                            step={1}
                            className="w-9/12 p-2 border rounded-es" />
                        <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-3/12 font-semibold text-black bg-gray-300 border border-black rounded-r">
                            %
                        </span>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="test-percentage" className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">Testing</label>
                    <div className="relative">
                        <input
                            ref={testInputElementRef}
                            value={splitData.test}
                            onChange={(e) => setSplitData(prev => ({
                                ...prev,
                                test: Number(e.target.value)
                            }))}
                            id="test-percentage"
                            type="number"
                            step={1}
                            className="w-9/12 p-2 border rounded-es" />
                        <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-3/12 font-semibold text-black bg-gray-300 border border-black rounded-r">
                            %
                        </span>
                    </div>
                </div>
            </section>

            {
                !isStep2Valid && (
                    <p className="mt-2 text-sm text-red-500">Each input must be positive integer number</p>
                )
            }

            <div className="mt-4 italic">
                <p>There are several commonly ratio for split data into train/val/test</p>
                <ul className="list-inside list-disc">
                    <li className="ml-4">70 : 15 : 15</li>
                    <li className="ml-4">80 : 10 : 10</li>
                    <li className="ml-4">90 : 5 : 5</li>
                </ul>
            </div>

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
                    <i className="fa-solid fa-star"></i> Use recommended
                </button>
            </div>
        </>
    );
}
