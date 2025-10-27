import { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import { Step1Page } from "./StepTrainings/Step1Page";
import { Step2Page } from "./StepTrainings/Step2Page";
import { Step3Page } from "./StepTrainings/Step3Page";
import type { LayerType } from "../types/layerType";
import type { SplitDataType } from "../types/splitDataType";
import { Model } from "../utils/Model";
import { Step4Page } from "./StepTrainings/Step4Page";

export function TrainingPage() {
    const datasetInputElementRef = useRef<HTMLInputElement | null>(null);

    const nextButtonElementRef = useRef<HTMLButtonElement | null>(null);
    const backButtonElementRef = useRef<HTMLButtonElement | null>(null);

    const tensorflowfDatasetRef = useRef<tf.data.CSVDataset | null>(null);

    const [currentIndexStep, setCurrentIndexStep] = useState(0);

    const [splitData, setSplitData] = useState<SplitDataType>({});
    const [sequentialModel, setSequentialModel] = useState<LayerType[]>([]);

    const [isStep1Valid, setIsStep1Valid] = useState(false);
    const [isStep2Valid, setIsStep2Valid] = useState(false);
    const [isStep3Valid, setIsStep3Valid] = useState(false);

    useEffect(() => {
        setSequentialModel(Model.initLayer());
        return () => {

        }
    }, [])

    function isNextButtonDisabled() {
        if (currentIndexStep === 0) return !isStep1Valid;
        if (currentIndexStep === 1) return !isStep2Valid;
        if (currentIndexStep === 2) return !isStep3Valid;
        return;
    }

    const steps = [
        <Step1Page
            isStep1Valid={isStep1Valid}
            setIsStep1Valid={setIsStep1Valid}
            tensorflowfDatasetRef={tensorflowfDatasetRef}
            datasetInputElementRef={datasetInputElementRef}
        />,
        <Step2Page
            setIsStep2Valid={setIsStep2Valid}
            splitData={splitData}
            setSplitData={setSplitData}
        />,
        <Step3Page
            isStep3Valid={isStep3Valid}
            setIsStep3Valid={setIsStep3Valid}
            sequentialModel={sequentialModel}
            setSequentialModel={setSequentialModel}
        />,
        <Step4Page
        />
    ];

    return (
        <>
            <h1 className="font-bold text-4xl text-center text-yellow-900">Training Model</h1>

            <div className="max-w-lg block mx-auto mt-8 p-4 bg-white border rounded shadow-2xl">
                {steps[currentIndexStep]}

                <div className="flex justify-between mt-8">
                    <button
                        ref={backButtonElementRef}
                        onClick={() => setCurrentIndexStep((prev) => prev - 1)}
                        className={`${currentIndexStep == 0 && 'invisible'} 
                            px-4 py-2 font-bold text-white bg-gray-500 border-b-4 border-black rounded
                            cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <button
                        disabled={isNextButtonDisabled()}
                        ref={nextButtonElementRef}
                        onClick={() => setCurrentIndexStep((prev) => prev + 1)}
                        className={`${currentIndexStep == steps.length - 1 && 'invisible'} 
                            px-4 py-2 font-bold text-white bg-blue-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        Next <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </>
    );
}