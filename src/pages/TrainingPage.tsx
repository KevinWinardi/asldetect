import { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import { Step1Page } from "./TrainingSteps/Step1Page";
import { Step2Page } from "./TrainingSteps/Step2Page";
import { Step3Page } from "./TrainingSteps/Step3Page";
import { Step4Page } from "./TrainingSteps/Step4Page";
import { Step5Page } from "./TrainingSteps/Step5Page";
import type { LayerModelType } from "../types/layerModelType";
import type { SplitDataType } from "../types/splitDataType";
import type { CompileModelType } from "../types/compileModelType";
import type { FitModelType } from "../types/fitModelType";
import { Trainer } from "../utils/Trainer";
import { useLanguage } from "../contexts/LanguageContext";

export function TrainingPage() {
    const { t } = useLanguage();
    const tensorflowfDatasetRef = useRef<tf.data.CSVDataset | null>(null);

    const [currentIndexStep, setCurrentIndexStep] = useState(0);
    const [isTraining, setIsTraining] = useState(false);

    const [previewData, setPreviewData] = useState<string[][]>([]);
    const [totalData, setTotalData] = useState(0);
    const [splitData, setSplitData] = useState<SplitDataType>({
        train: null,
        val: null,
        test: null,
    });
    const [layerModel, setLayerModel] = useState<LayerModelType[]>([]);
    const [compileModel, setCompileModel] = useState<CompileModelType>({
        optimizer: null,
        learningRate: null,
        loss: 'categoricalCrossentropy',
        metrics: 'accuracy',
    });
    const [fitModel, setFitModel] = useState<FitModelType>({
        epochs: null,
        batchSize: null,
    })

    const [isStep1Valid, setIsStep1Valid] = useState(false);
    const [isStep2Valid, setIsStep2Valid] = useState<boolean | null>(null);
    const [isStep3Valid, setIsStep3Valid] = useState<{
        [key: string]: boolean | null,
    }>({});
    const [isStep4Valid, setIsStep4Valid] = useState<{
        optimizer: boolean | null,
        learningRate: boolean | null,
    }>({
        optimizer: null,
        learningRate: null,
    });
    const [isStep5Valid, setIsStep5Valid] = useState<{
        epochs: boolean | null,
        batchSize: boolean | null,
    }>({
        epochs: null,
        batchSize: null,
    });

    useEffect(() => {
        setLayerModel(Trainer.initLayer());
    }, [])

    function isNextButtonDisabled() {
        if (currentIndexStep === 0) return !isStep1Valid;
        if (currentIndexStep === 1) return !isStep2Valid;
        if (currentIndexStep === 2) return !Object.values(isStep3Valid).every(item => item === true);
        if (currentIndexStep === 3) return !Object.values(isStep4Valid).every(item => item === true);
        return;
    }

    const steps = [
        <Step1Page
            isStep1Valid={isStep1Valid}
            setIsStep1Valid={setIsStep1Valid}
            tensorflowfDatasetRef={tensorflowfDatasetRef}
            totalData={totalData}
            setTotalData={setTotalData}
            previewData={previewData}
            setPreviewData={setPreviewData}
        />,
        <Step2Page
            isStep2Valid={isStep2Valid}
            setIsStep2Valid={setIsStep2Valid}
            splitData={splitData}
            setSplitData={setSplitData}
        />,
        <Step3Page
            isStep3Valid={isStep3Valid}
            setIsStep3Valid={setIsStep3Valid}
            layerModel={layerModel}
            setLayerModel={setLayerModel}
        />,
        <Step4Page
            isStep4Valid={isStep4Valid}
            setIsStep4Valid={setIsStep4Valid}
            compileModel={compileModel}
            setCompileModel={setCompileModel}
        />,
        <Step5Page
            isStep5Valid={isStep5Valid}
            setIsStep5Valid={setIsStep5Valid}
            fitModel={fitModel}
            setFitModel={setFitModel}
            tensorflowDataset={tensorflowfDatasetRef.current}
            totalData={totalData}
            splitData={splitData}
            layerModel={layerModel}
            compileModel={compileModel}
            isTraining={isTraining}
            setIsTraining={setIsTraining}
        />
    ];

    return (
        <div className="px-4 sm:px-8 pt-24 pb-8">
            <h1 className="font-bold text-4xl text-center text-orange-500">{t.training} Model</h1>

            <div className="max-w-lg block mx-auto mt-8 p-4 bg-white border rounded shadow-2xl">
                {steps[currentIndexStep]}

                <div className="flex justify-between mt-8">
                    <button
                        disabled={isTraining}
                        onClick={() => { setCurrentIndexStep((prev) => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className={`${currentIndexStep == 0 && 'invisible'} 
                            px-4 py-2 font-bold text-white bg-gray-500 border-b-4 border-black rounded
                            cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        <i className="fa-solid fa-arrow-left"></i> {t.back}
                    </button>
                    <button
                        disabled={isNextButtonDisabled()}
                        onClick={() => { setCurrentIndexStep((prev) => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className={`${currentIndexStep == steps.length - 1 && 'invisible'} 
                            px-4 py-2 font-bold text-white bg-blue-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        {t.next} <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}