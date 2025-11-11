import React, { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import type { SplitDataType } from "../../types/splitDataType";
import type { LayerModelType } from "../../types/layerModelType";
import type { CompileModelType } from "../../types/compileModelType";
import { Dialog } from "../../utils/Dialog";
import { ChartJS } from "../../utils/ChartJS";
import { Tooltip } from "../../components/Tooltip";
import type { FitModelType } from "../../types/fitModelType";
import { Trainer } from "../../utils/Trainer";

export function Step5Page({
    isStep5Valid,
    setIsStep5Valid,
    fitModel,
    setFitModel,
    tensorflowDataset,
    totalData,
    splitData,
    layerModel,
    compileModel,
    isTraining,
    setIsTraining,
}: {
    isStep5Valid: {
        epochs: boolean | null,
        batchSize: boolean | null,
    },
    setIsStep5Valid: React.Dispatch<React.SetStateAction<{
        epochs: boolean | null,
        batchSize: boolean | null,
    }>>,
    fitModel: FitModelType,
    setFitModel: React.Dispatch<React.SetStateAction<{
        epochs: number | null;
        batchSize: number | null;
    }>>,
    tensorflowDataset: tf.data.CSVDataset | null,
    totalData: number,
    splitData: SplitDataType,
    layerModel: LayerModelType[],
    compileModel: CompileModelType,
    isTraining: boolean,
    setIsTraining: React.Dispatch<React.SetStateAction<boolean>>,
}) {
    const [progress, setProgress] = useState('');
    const [isFirstTraining, setIsFirstTraining] = useState(true);
    const [evalTest, setEvalTest] = useState<{ acc: number, loss: number } | null>(null);
    const [isModelSaved, setIsModelSaved] = useState(false);

    const meanStdLabelRef = useRef<{
        mean: number[],
        std: number[],
        label: string[]
    }>({
        mean: [],
        std: [],
        label: [],
    });
    const trainerInstanceRef = useRef<Trainer | null>(null);
    const accTrainValCanvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const lossTrainValCanvasElementRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        trainerInstanceRef.current = new Trainer(setProgress);

        return (() => {
            if (trainerInstanceRef.current && isTraining) {
                trainerInstanceRef.current.stopTraining();
            }
        })
    }, []);

    async function startTrainingHandler() {
        try {
            if (!trainerInstanceRef.current) {
                return Dialog.showError('Model instance not found');
            }

            Dialog.closeDialog();
            setIsModelSaved(false);
            setIsTraining(true);
            const { evaluationTrainVal, evaluationTest, mean, std, label } = await trainerInstanceRef.current.startTraining(
                tensorflowDataset,
                splitData,
                layerModel,
                compileModel,
                fitModel,
            );
            meanStdLabelRef.current = {
                mean,
                std,
                label,
            };
            setIsTraining(false);

            setEvalTest({ loss: evaluationTest.loss, acc: evaluationTest.acc });

            ChartJS.createEvalChart({
                element: accTrainValCanvasElementRef.current,
                type: 'acc',
                data: evaluationTrainVal
            });
            ChartJS.createEvalChart({
                element: lossTrainValCanvasElementRef.current,
                type: 'loss',
                data: evaluationTrainVal
            });
            setIsFirstTraining(false);
        } catch (error: any) {
            return Dialog.showError(error.message);
        } finally {
            setIsTraining(false);
        }
    }

    async function stopTrainingHandler() {
        const confirmation = await Dialog.showConfirmation('Are you sure want to stop the training process?');
        if (confirmation.isConfirmed) {
            trainerInstanceRef.current?.stopTraining();
        }
    }

    async function saveModelHandler(): Promise<void> {
        try {
            if (!trainerInstanceRef.current || !evalTest) {
                throw new Error('Some ref not found');
            }
            const name = await Dialog.showInput({
                title: 'Model name',
                inputLabel: 'Input your model name',
                inputPlaceholder: 'Your model name',
                input: 'text',
                inputValidator: (value) => {
                    const localStorageKeys = Object.keys(localStorage);

                    if (localStorageKeys.includes('model_' + value.split(' ').join('_')) || value === 'default') {
                        return 'This name already used, please use another name';
                    } else {
                        setIsModelSaved(true);
                        return;
                    }
                }
            })

            if (!name) {
                return;
            }

            Dialog.showSuccess('Model saved to local storage');

            trainerInstanceRef.current.saveModel({
                name: name,
                splitData: splitData,
                mean: meanStdLabelRef.current.mean,
                std: meanStdLabelRef.current.std,
                label: meanStdLabelRef.current.label,
                totalData: totalData,
                layerModel: layerModel,
                compileModel: compileModel,
                fitModel: fitModel,
            })
        } catch (error: any) {
            Dialog.showError(error.message);
            return;
        }
    }

    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">5. Start training</h2>

            <section className="mt-4">
                <p>Last step is set up configuration for fit model.</p>
            </section>

            <section className="mt-4">
                <div className="flex">
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
                                value={fitModel.epochs ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    if (value === '') {
                                        setIsStep5Valid(prev => ({ ...prev, epochs: false }));
                                        setFitModel(prev => ({ ...prev, epochs: null }));
                                        return;
                                    }

                                    const parsedValue = Number(value);
                                    let validity = true;
                                    if (isNaN(parsedValue) || !Number.isInteger(parsedValue) || parsedValue <= 0) {
                                        validity = false;
                                    }
                                    setIsStep5Valid(prev => ({ ...prev, epochs: validity }));
                                    setFitModel(prev => ({ ...prev, epochs: parsedValue }));
                                }}
                                id={`epochs`}
                                type="number"
                                min={1}
                                className="w-full p-2 border rounded-se rounded-ee" />
                            <Tooltip text="An epoch is one complete pass of the entire training dataset through the model during training (e.g. 10)" />
                        </div>
                        {
                            isStep5Valid.epochs === false && (
                                <p className="text-red-500 text-sm">Input must be positive integer number (e.g. 10)</p>
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
                                value={fitModel.batchSize ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    if (value === '') {
                                        setIsStep5Valid(prev => ({ ...prev, batchSize: false }));
                                        setFitModel(prev => ({ ...prev, batchSize: null }));
                                        return;
                                    }

                                    const parsedValue = Number(value);
                                    let validity = true;
                                    if (isNaN(parsedValue) || !Number.isInteger(parsedValue) || parsedValue <= 0) {
                                        validity = false;
                                    }
                                    setIsStep5Valid(prev => ({ ...prev, batchSize: validity }));
                                    setFitModel(prev => ({ ...prev, batchSize: parsedValue }));
                                }}
                                id={`batch-size`}
                                type="number"
                                min={1}
                                className="w-full p-2 border rounded-se rounded-ee" />
                            <Tooltip text="Batch size is the number of training samples the model processes before updating its weights once during training (e.g. 32)" />
                        </div>
                        {
                            isStep5Valid.batchSize === false && (
                                <p className="text-red-500 text-sm">Input must be positive integer number (e.g. 32)</p>
                            )
                        }
                    </div>
                </div>

                <button
                    onClick={() => {
                        setIsStep5Valid({
                            epochs: true,
                            batchSize: true,
                        });
                        setFitModel({
                            epochs: 10,
                            batchSize: 32,
                        });
                    }}
                    className={`
                        ${isTraining ? 'hidden' : 'block'} mx-auto mt-8 px-4 py-2 font-bold text-white bg-green-500 border-b-4 border-black rounded
                        cursor-pointer transition hover:translate-y-0.5 hover:border-transparent hover:opacity-75
                    `}>
                    <i className="fa-solid fa-star"></i> Use recommended
                </button>
            </section>

            <section className="mt-4">
                <div className="flex gap-4 justify-center items-center">
                    <button
                        disabled={!Object.values(isStep5Valid).every(item => item === true)}
                        onClick={startTrainingHandler}
                        className={`${isTraining && 'hidden'}
                            px-4 py-2 font-bold text-white bg-blue-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        {isFirstTraining ? 'Start' : 'Retrain'} <i className={`fa-solid ${isFirstTraining ? 'fa-play' : 'fa-rotate'}`}></i>
                    </button>

                    <button
                        disabled={isModelSaved}
                        onClick={saveModelHandler}
                        className={`${(isFirstTraining || isTraining || isModelSaved) ? 'hidden' : 'block'}
                            px-4 py-2 font-bold text-white ${isModelSaved ? 'bg-green-500' : 'bg-orange-500'} border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        Save Model <i className="fa-solid fa-save"></i>
                    </button>
                </div>

                <div className={`${isTraining ? 'block' : 'hidden'} mt-2 mx-auto w-max p-2 border rounded-md shadow-lg`}>
                    <div className="flex justify-center items-center'">
                        <div className="w-[30px] aspect-square rounded-full border-4 border-blue-500 border-r-gray-500 animate-spin"></div>
                        <span className="ml-2 line-clamp-1 text-ellipsis">{progress}</span>
                    </div>
                </div>

                <button
                    onClick={stopTrainingHandler}
                    className={`
                    ${isTraining ? 'block' : 'hidden'} mx-auto mt-4 px-4 py-2 font-bold text-white bg-red-500 border-b-4 border-black rounded
                    cursor-pointer transition hover:translate-y-0.5 hover:border-transparent hover:opacity-75
                `}>
                    <i className="fa-solid fa-stop"></i> Stop
                </button>
            </section >

            <section className={`${isFirstTraining || isTraining ? 'hidden' : 'block'} w-full mt-8`}>
                <canvas ref={accTrainValCanvasElementRef} className="mb-4"></canvas>
                <canvas ref={lossTrainValCanvasElementRef}></canvas>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <p className="p-2 text-green-500 border rounded shadow">Acc Test: {evalTest?.acc.toFixed(4)}</p>
                    <p className="p-2 text-red-500 border rounded shadow">Loss Test: {evalTest?.loss.toFixed(4)}</p>
                </div>
            </section>
        </>
    );
}