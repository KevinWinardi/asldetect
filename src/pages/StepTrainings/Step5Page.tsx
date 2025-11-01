import { useEffect, useRef, useState } from "react";
import { Model } from "../../utils/Model";
import * as tf from '@tensorflow/tfjs';
import type { SplitDataType } from "../../types/splitDataType";
import type { LayerType } from "../../types/layerType";
import type { CompileType } from "../../types/compileType";

export function Step5Page({
    tensorflowDataset,
    splitData,
    sequentialModel,
    compileModel,
}: {
    tensorflowDataset: tf.data.CSVDataset | null,
    splitData: SplitDataType,
    sequentialModel: LayerType[],
    compileModel: CompileType,
}) {
    const [isTraining, setIsTraining] = useState(false);
    const [progressTraining, setProgressTraining] = useState('');
    const [isFirstTraining, setIsFirstTraining] = useState(true);
    const modelInstanceRef = useRef<Model | null>(null);

    useEffect(() => {
        modelInstanceRef.current = new Model(tensorflowDataset, splitData, sequentialModel, compileModel, setProgressTraining);
        modelInstanceRef.current.startTrain();
    }, []);

    function startTrainingHandler() {

    }

    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">5. Start training</h2>

            <section className="mt-2">
                <p>Model ready to get training. Click button bellow to start.</p>
            </section>

            <section className="mt-2">
                <button
                    onClick={startTrainingHandler}
                    className={`${isTraining && 'hidden'} 
                            px-4 py-2 font-bold text-white bg-blue-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                    Start <i className="fa-solid fa-arrow-right"></i>
                </button>

                <div className={`${isTraining ? 'hidden' : 'flex justify-center items-center'} w-max p-2  border shadow-md`}>
                    <div className="w-[50px] aspect-square rounded-full border-8 border-blue-500 border-r-orange-500 animate-spin"></div>
                    <span>{progressTraining}</span>
                </div>
            </section>
        </>
    );
}