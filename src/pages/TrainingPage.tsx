import { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import { Step1Page } from "./StepTrainings/Step1Page";
import { Step2Page } from "./StepTrainings/Step2Page";
import { Step3Page } from "./StepTrainings/Step3Page";
import type { LayerType } from "../types/layerType";
import type { SplitDataType } from "../types/splitDataType";
import { Model } from "../utils/Model";
import { Step4Page } from "./StepTrainings/Step4Page";
import { Step5Page } from "./StepTrainings/Step5Page";
import type { CompileType } from "../types/compileType";

export function TrainingPage() {
    const datasetInputElementRef = useRef<HTMLInputElement | null>(null);

    const tensorflowfDatasetRef = useRef<tf.data.CSVDataset | null>(null);

    const [currentIndexStep, setCurrentIndexStep] = useState(0);
    const [isTraining, setIsTraining] = useState(false);

    const [splitData, setSplitData] = useState<SplitDataType>({
        train: 0,
        val: 0,
        test: 0,
    });
    const [layerModel, setLayerModel] = useState<LayerType[]>([]);
    const [compileModel, setCompileModel] = useState<CompileType>({
        optimizer: 'adam',
        learningRate: 0.001,
        loss: 'categoricalCrossentropy',
        metrics: 'accuracy',
    });
    const [fitModel, setFitModel] = useState<{
        epochs: number,
        batchSize: number,
    }>({
        epochs: 10,
        batchSize: 32,
    })

    const [isStep1Valid, setIsStep1Valid] = useState(false);
    const [isStep2Valid, setIsStep2Valid] = useState(false);
    const [isStep3Valid, setIsStep3Valid] = useState<{
        [key: string]: boolean,
    }>({});
    const [isStep4Valid, setIsStep4Valid] = useState<{
        optimizer: boolean,
        learningRate: boolean,
    }>({
        optimizer: true,
        learningRate: true,
    });
    const [isStep5Valid, setIsStep5Valid] = useState<{
        epochs: boolean,
        batchSize: boolean,
    }>({
        epochs: true,
        batchSize: true,
    });

    useEffect(() => {
        setLayerModel(Model.initLayer());
        setCompileModel({
            optimizer: 'adam',
            learningRate: 0.001,
            loss: 'categoricalCrossentropy',
            metrics: 'accuracy'
        })
        return () => {

        }
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
            splitData={splitData}
            layerModel={layerModel}
            compileModel={compileModel}
            isTraining={isTraining}
            setIsTraining={setIsTraining}
        />
    ];

    return (
        <div className="px-4 sm:px-8 pt-24 pb-8">
            <h1 className="font-bold text-4xl text-center text-yellow-900">Training Model</h1>

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
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <button
                        disabled={isNextButtonDisabled()}
                        onClick={() => { setCurrentIndexStep((prev) => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className={`${currentIndexStep == steps.length - 1 && 'invisible'} 
                            px-4 py-2 font-bold text-white bg-blue-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        Next <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}