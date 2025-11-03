import React, { useEffect, useRef, useState } from "react";
import { Model } from "../../utils/Model";
import * as tf from '@tensorflow/tfjs';
import type { SplitDataType } from "../../types/splitDataType";
import type { LayerType } from "../../types/layerType";
import type { CompileType } from "../../types/compileType";
import { Dialog } from "../../utils/Dialog";
import { ChartJS } from "../../utils/ChartJS";
import { Tooltip } from "../../components/Tooltip";
import type { FitModelType } from "../../types/fitModelType";

export function Step5Page({
    isStep5Valid,
    setIsStep5Valid,
    fitModel,
    setFitModel,
    tensorflowDataset,
    splitData,
    layerModel,
    compileModel,
    isTraining,
    setIsTraining,
}: {
    isStep5Valid: {
        epochs: boolean,
        batchSize: boolean,
    },
    setIsStep5Valid: React.Dispatch<React.SetStateAction<{
        epochs: boolean,
        batchSize: boolean,
    }>>,
    fitModel: FitModelType,
    setFitModel: React.Dispatch<React.SetStateAction<{
        epochs: number;
        batchSize: number;
    }>>,
    tensorflowDataset: tf.data.CSVDataset | null,
    splitData: SplitDataType,
    layerModel: LayerType[],
    compileModel: CompileType,
    isTraining: boolean,
    setIsTraining: React.Dispatch<React.SetStateAction<boolean>>,
}) {
    const [progressTraining, setProgressTraining] = useState('');
    const [isFirstTraining, setIsFirstTraining] = useState(true);
    const [evalTest, setEvalTest] = useState<{ acc: number, loss: number } | null>(null);

    const modelInstanceRef = useRef<Model | null>(null);
    const accTrainCanvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const lossTrainCanvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const chartJSInstanceRef = useRef<ChartJS | null>(null);

    useEffect(() => {
        modelInstanceRef.current = new Model(
            tensorflowDataset,
            splitData,
            layerModel,
            compileModel,
            fitModel,
            setProgressTraining,
        );
        chartJSInstanceRef.current = new ChartJS();
    }, []);

    async function startTrainingHandler() {
        try {
            if (!modelInstanceRef.current) {
                return Dialog.showError('Model instance not found');
            }

            setIsTraining(true);
            setIsFirstTraining(false);

            const { evaluationModel, evaluationTest } = await modelInstanceRef.current.startTrain();
            setIsTraining(false);
            setEvalTest({ loss: evaluationTest.loss, acc: evaluationTest.acc });

            if (!chartJSInstanceRef.current) {
                return;
            }
            chartJSInstanceRef.current.createEvalChart(accTrainCanvasElementRef.current, 'acc', evaluationModel);
            chartJSInstanceRef.current.createEvalChart(lossTrainCanvasElementRef.current, 'loss', evaluationModel);
        } catch (error: any) {
            Dialog.showError(error.message);
            return;
        } finally {
            setIsTraining(false);
        }
    }

    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">5. Start training</h2>

            <section className="mt-2">
                <p>Model ready to get training. Click button bellow to start.</p>

                <div className="flex mt-4">
                    <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">
                        Fit
                    </p>
                </div>
                <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                    <div>
                        <div className="flex flex-row">
                            <label
                                htmlFor="epochs"
                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                epochs
                            </label>
                            <input
                                value={fitModel.epochs}
                                onChange={(e) => {
                                    const target = e.target.value;
                                    let validity = true;

                                    if (!Number.isInteger(Number(target)) || parseInt(target) <= 0 || parseInt(target) > 100) {
                                        validity = false;
                                    }

                                    setIsStep5Valid(prev => ({ ...prev, epochs: validity }));
                                    setFitModel(prev => ({ ...prev, epochs: parseInt(target) }));
                                }}
                                id={`epochs`}
                                type="number"
                                min={1}
                                max={100}
                                className="w-full p-2 border rounded-se rounded-ee" />
                            <Tooltip text="An epoch is one complete pass of the entire training dataset through the model during training" />
                        </div>
                        {
                            !isStep5Valid.epochs && (
                                <p className="text-red-500 text-sm">Input must be positive integer number</p>
                            )
                        }
                    </div>

                    <div>
                        <div className="flex flex-row">
                            <label
                                htmlFor="batch-size"
                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                batchSize
                            </label>
                            <input
                                value={fitModel.batchSize}
                                onChange={(e) => {
                                    const target = e.target.value;
                                    let validity = true;

                                    if (!Number.isInteger(Number(target)) || parseInt(target) <= 0 || parseInt(target) > 100) {
                                        validity = false;
                                    }

                                    setIsStep5Valid(prev => ({ ...prev, batchSize: validity }));
                                    setFitModel(prev => ({ ...prev, batchSize: parseInt(target) }));
                                }}
                                id={`batch-size`}
                                type="number"
                                min={1}
                                max={100}
                                className="w-full p-2 border rounded-se rounded-ee" />
                            <Tooltip text="Batch size is the number of training samples the model processes before updating its weights once during training" />
                        </div>
                        {
                            !isStep5Valid.batchSize && (
                                <p className="text-red-500 text-sm">Input must be positive integer number</p>
                            )
                        }
                    </div>
                </div>
            </section >

            <section className="mt-2">
                <button
                    disabled={!Object.values(isStep5Valid).every(item => item === true)}
                    onClick={startTrainingHandler}
                    className={`${isTraining && 'hidden'}
                            block mx-auto
                            px-4 py-2 font-bold text-white bg-blue-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                    {isFirstTraining ? 'Start' : 'Retrain'} <i className={`fa-solid ${isFirstTraining ? 'fa-play' : 'fa-rotate'}`}></i>
                </button>

                <div className={`${isTraining ? 'block' : 'hidden'} mt-2 mx-auto w-max p-2 border rounded-md shadow-lg`}>
                    <div className="flex justify-center items-center'">
                        <div className="w-[30px] aspect-square rounded-full border-4 border-blue-500 border-r-gray-500 animate-spin"></div>
                        <span className="ml-2 line-clamp-1 text-ellipsis">{progressTraining}</span>
                    </div>
                </div>
            </section >

            <section className={`${isFirstTraining || isTraining ? 'hidden' : 'block'} w-full mt-4`}>
                <canvas ref={accTrainCanvasElementRef} className="mb-4"></canvas>
                <canvas ref={lossTrainCanvasElementRef}></canvas>

                <div className="mt-2 grid grid-cols-2 gap-2">
                    <p className="p-2 text-green-500 border rounded shadow">Acc Test: {evalTest?.acc.toFixed(4)}</p>
                    <p className="p-2 text-red-500 border rounded shadow">Loss Test: {evalTest?.loss.toFixed(4)}</p>
                </div>
            </section>
        </>
    );
}