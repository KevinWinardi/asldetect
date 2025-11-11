import { useEffect, useRef, useState } from "react";
import { BaseModel } from "../../utils/BaseModel";
import type { SplitDataType } from "../../types/splitDataType";
import { ChartJS } from "../../utils/ChartJS";
import type { evaluationTestType } from "../../types/evaluationTestType";
import { Dialog } from "../../utils/Dialog";
import type { FitModelType } from "../../types/fitModelType";
import type { CompileModelType } from "../../types/compileModelType";
import type { LayerModelType } from "../../types/layerModelType";
import { Tooltip } from "../../components/Tooltip";

export function Tab1Page() {
    const [optionModel, setOptionModel] = useState<{ key: string, name: string }[]>();
    const [favoriteModel, setFavoriteModel] = useState(localStorage.getItem('favorite_model'));
    const [currentInformationModel, setCurrentInformationModel] = useState<{
        key: string,
        name: string,
        totalData: number,
        splitData: SplitDataType,
        layerModel: LayerModelType[],
        compileModel: CompileModelType,
        fitModel: FitModelType,
        evaluationTest: evaluationTestType,
        createdAt: string,
    } | null>(null);

    const splitDataCanvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const accTrainValCanvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const lossTrainValCanvasElementRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const optionModelList = BaseModel.getAllModel('model_');
        if (optionModelList === false) {
            return;
        }
        setOptionModel(optionModelList);

        async function loadInformationModel() {
            const {
                key,
                name,
                totalData,
                splitData,
                layerModel,
                compileModel,
                fitModel,
                evaluationTrainVal,
                evaluationTest,
                createdAt,
            } = await BaseModel.loadInformationModel(favoriteModel ?? 'model_default');

            // Once data is loaded, update state and create charts
            setCurrentInformationModel({
                key,
                name,
                totalData,
                splitData,
                layerModel,
                compileModel,
                fitModel,
                evaluationTest,
                createdAt,
            });

            ChartJS.createSplitDataChart({
                element: splitDataCanvasElementRef.current,
                splitData: splitData,
            });

            ChartJS.createEvalChart({
                element: accTrainValCanvasElementRef.current,
                type: 'acc',
                data: evaluationTrainVal,
            });

            ChartJS.createEvalChart({
                element: lossTrainValCanvasElementRef.current,
                type: 'loss',
                data: evaluationTrainVal,
            });
        }

        loadInformationModel();
    }, []);

    async function changeModelHandler(currentKeyModel: string) {
        try {
            const {
                key,
                name,
                totalData,
                splitData,
                layerModel,
                compileModel,
                fitModel,
                evaluationTrainVal,
                evaluationTest,
                createdAt,
            } = await BaseModel.loadInformationModel(currentKeyModel);

            setCurrentInformationModel({
                key,
                name,
                totalData,
                splitData,
                layerModel,
                compileModel,
                fitModel,
                evaluationTest,
                createdAt,
            });

            ChartJS.createSplitDataChart({
                element: splitDataCanvasElementRef.current,
                splitData: splitData,
            });

            ChartJS.createEvalChart({
                element: accTrainValCanvasElementRef.current,
                type: 'acc',
                data: evaluationTrainVal,
            });

            ChartJS.createEvalChart({
                element: lossTrainValCanvasElementRef.current,
                type: 'loss',
                data: evaluationTrainVal,
            });
        } catch (error: any) {
            Dialog.showError(error.message);
        }
    }


    return (
        <>
            <div className="flex items-baseline gap-4">
                <select
                    value={currentInformationModel?.key}
                    onChange={(e) => changeModelHandler(e.target.value)}
                    className="w-full mt-4 p-2 border rounded"
                >
                    <option value="model_default">Default</option>
                    {
                        optionModel && (
                            optionModel.map(model => (
                                <option key={model.key} value={model.key}>{model.name}</option>
                            ))
                        )
                    }
                </select>

                <button
                    onClick={() => {
                        if (!currentInformationModel) {
                            return;
                        }
                        if (currentInformationModel.key === favoriteModel) {
                            localStorage.removeItem('favorite_model')
                            setFavoriteModel(null);
                        } else {
                            localStorage.setItem('favorite_model', currentInformationModel.key);
                            setFavoriteModel(currentInformationModel.key);
                        }
                    }}
                    className="p-2 cursor-pointer transition duration-500 hover:scale-90">
                    <i className={`${favoriteModel === currentInformationModel?.key ? 'fa-solid fa-star' : 'fa-regular fa-star'} text-2xl text-yellow-300`}></i>
                </button>
                <button
                    onClick={async () => {
                        const confirmation = await Dialog.showConfirmation('Are you sure want to remove this model?')
                        if (confirmation.isConfirmed) {
                            const localStorageKeys = Object.keys(localStorage);

                            localStorageKeys.forEach(item => {
                                if (currentInformationModel) {
                                    if (item.includes(currentInformationModel.key)) {
                                        localStorage.removeItem(item);
                                        setOptionModel(prev => prev?.filter(item => item.key !== currentInformationModel.key));
                                    }
                                }
                            });
                        }
                    }}
                    className={`p-2 cursor-pointer transition duration-500 hover:scale-90 
                    ${currentInformationModel?.key === 'model_default' ? 'hidden' : 'block'}`}
                >
                    <i className="fa-solid fa-trash text-2xl text-red-500"></i>
                </button>
            </div>

            <div className="w-full">
                <h2 className="mt-4 font-extrabold text-2xl">{currentInformationModel?.name}</h2>

                <section className="mt-4">
                    <p className="w-max px-2 py-2 font-semibold text-white bg-orange-500 border border-black rounded-ss rounded-se">
                        Layer Model
                    </p>
                    <div className="flex flex-col gap-8 p-4 shadow-lg border rounded rounded-tl-none">
                        {
                            currentInformationModel?.layerModel.map(layer => {
                                switch (layer.type) {
                                    case 'inputLayer':
                                        return (
                                            <div key={layer.id} className="flex flex-col">
                                                <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">
                                                    Input Layer
                                                </p>
                                                <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                                                    <div className="flex flex-row">
                                                        <label
                                                            htmlFor="input_shape"
                                                            className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-es">
                                                            input_shape
                                                        </label>
                                                        <input
                                                            disabled
                                                            value={layer.input_shape[0]}
                                                            id="input_shape"
                                                            type="number"
                                                            className="w-full p-2 border rounded-r opacity-75 cursor-not-allowed" />
                                                        <Tooltip text="Tuple of input dimensions" />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    case 'dense':
                                        return (
                                            <div key={layer.id} className="flex flex-col">
                                                <div className="flex flex-col">
                                                    <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">
                                                        Dense
                                                    </p>

                                                    <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                                                        <div>
                                                            <div className="flex flex-row">
                                                                <label
                                                                    htmlFor={`units-${layer.id}`}
                                                                    className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                                                    units
                                                                </label>
                                                                <input
                                                                    value={layer.units ?? ''}
                                                                    id={`units-${layer.id}`}
                                                                    type="number"
                                                                    disabled
                                                                    className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed" />
                                                                <Tooltip text="Number of neurons" />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="flex flex-row">
                                                                <label
                                                                    htmlFor={`activation-${layer.id}`}
                                                                    className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                                                    activation
                                                                </label>
                                                                <select
                                                                    id={`activation-${layer.id}`}
                                                                    value={layer.activation ?? ''}
                                                                    disabled
                                                                    className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                                                                >
                                                                    <option value="" disabled>Select activation</option>
                                                                    <option value="relu" className="border-black">relu</option>
                                                                    <option value="elu" className="border-black">elu</option>
                                                                    <option value="swish" className="border-black">swish</option>
                                                                    <option value="tanh" className="border-black">tanh</option>
                                                                </select>
                                                                <Tooltip html={
                                                                    <>
                                                                        <p>Applies a non-linear function to help the model learn complex patterns.</p>
                                                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                                                            <span className="font-mono">- relu:</span>
                                                                            <span>simple, fast, avoids vanishing gradients, works well in almost all deep nets</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                                                            <span className="font-mono">- elu:</span>
                                                                            <span>smooth version of relu; works better with negative inputs</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                                                            <span className="font-mono">- swish:</span>
                                                                            <span>newer relu alternative; often slightly better performance</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                                                            <span className="font-mono">- tanh:</span>
                                                                            <span>older, still good for small or normalized inputs; outputs in [-1, 1]</span>
                                                                        </div>
                                                                    </>
                                                                } />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    case 'batchNormalization':
                                        return (
                                            <div key={layer.id} className="flex flex-col">
                                                <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">
                                                    BatchNormalization
                                                </p>

                                                <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                                                    <div>
                                                        <div className="flex flex-row">
                                                            <label
                                                                htmlFor={`momentum-${layer.id}`}
                                                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                                                momentum
                                                            </label>
                                                            <input
                                                                value={layer.momentum ?? ''}
                                                                id={`momentum-${layer.id}`}
                                                                type="number"
                                                                disabled
                                                                className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                                                            />
                                                            <Tooltip text="How much past mean/variance are kept" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex flex-row">
                                                            <label
                                                                htmlFor={`epsilon-${layer.id}`}
                                                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                                                epsilon
                                                            </label>
                                                            <input
                                                                value={layer.epsilon ?? ''}
                                                                id={`epsilon-${layer.id}`}
                                                                type="number"
                                                                disabled
                                                                className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                                                            />
                                                            <Tooltip text="Small value to avoid division by zero" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    case 'dropout':
                                        return (
                                            <div key={layer.id} className="flex flex-col">
                                                <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">
                                                    Dropout
                                                </p>

                                                <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                                                    <div>
                                                        <div className="flex flex-row">
                                                            <label
                                                                htmlFor={`rate-${layer.id}`}
                                                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                                                rate
                                                            </label>
                                                            <input
                                                                value={layer.rate ?? ''}
                                                                id={`rate-${layer.id}`}
                                                                type="number"
                                                                disabled
                                                                className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed" />
                                                            <Tooltip text="Fraction (0-1) of neurons to drop" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    case 'output':
                                        return (
                                            <div key={layer.id} className="flex flex-col">
                                                <div className="flex">
                                                    <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">
                                                        Output
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                                                    <div className="flex flex-row">
                                                        <label
                                                            htmlFor={`units-output`}
                                                            className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                                            units
                                                        </label>
                                                        <input
                                                            disabled
                                                            value={layer.units}
                                                            id={`units-output`}
                                                            type="number"
                                                            className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed" />
                                                        <Tooltip text="Number of output prediction class" />
                                                    </div>
                                                    <div className="flex flex-row">
                                                        <label
                                                            htmlFor={`activation-output`}
                                                            className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                                            activation
                                                        </label>
                                                        <select
                                                            disabled
                                                            id={`activation-output`}
                                                            className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                                                        >
                                                            <option value="softmax">softmax</option>
                                                        </select>
                                                        <Tooltip text="softmax is used for multi class prediction" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                }
                            })
                        }
                    </div>
                </section>

                <section className="mt-4">
                    <p className="w-max px-2 py-2 font-semibold text-white bg-orange-500 border border-black rounded-ss rounded-se">
                        Compile Model
                    </p>
                    <div className="flex flex-col gap-8 p-4 shadow-lg border rounded rounded-tl-none">
                        <div>
                            <div className="flex flex-row">
                                <label
                                    htmlFor="optimizer"
                                    className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                    optimizer
                                </label>
                                <select
                                    value={currentInformationModel?.compileModel.optimizer ?? ''}
                                    id="optimizer"
                                    disabled
                                    className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                                >
                                    <option value="" disabled>Select optimizer</option>
                                    <option value="adam">Adam</option>
                                    <option value="rmsprop">RMSProp</option>
                                    <option value="sgd">SGD</option>
                                </select>
                                <Tooltip html={
                                    <>
                                        <p>An optimizer is an algorithm that adjusts the model's parameters (like weights and biases)
                                            during training to minimize the loss function — that is, to make predictions more accurate.</p>
                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                            <span className="font-mono">- Adam:</span>
                                            <span>combines momentum (past gradients) + RMSProp (adaptive learning rates).
                                                Keeps track of both mean and variance of gradients.</span>
                                        </div>
                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                            <span className="font-mono">- RMSProp:</span>
                                            <span>keeps a moving average of squared gradients and divides the learning rate by this average</span>
                                        </div>
                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                            <span className="font-mono">- SGD:</span>
                                            <span>updates weights using the gradient of the loss with respect to each parameter for each batch</span>
                                        </div>
                                    </>
                                }
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex flex-row">
                                <label
                                    htmlFor="learning-rate"
                                    className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                    learning_rate
                                </label>
                                <input
                                    value={currentInformationModel?.compileModel.learningRate ?? ''}
                                    id="learning-rate"
                                    type="number"
                                    disabled
                                    className={`w-full p-2 border rounded-se rounded-ee opacity-75`}
                                />
                                <Tooltip html={
                                    <>
                                        <p>Controls how fast the model updates its weights during training.</p>
                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                            <span>Too high → unstable training.</span>
                                        </div>
                                        <div className="grid grid-cols-[auto_1fr] gap-2">
                                            <span>Too low → very slow learning.</span>
                                        </div>
                                    </>
                                } />
                            </div>
                        </div>

                        <div className="flex flex-row">
                            <label
                                htmlFor="loss"
                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                loss
                            </label>
                            <select
                                disabled
                                value={currentInformationModel?.compileModel.loss}
                                id="loss"
                                className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                            >
                                <option value="categoricalCrossentropy">Categorical Crossentropy</option>
                            </select>
                            <Tooltip text="A number that shows how wrong the model's predictions are compared to the real answers.
The model tries to minimize this value while learning." />
                        </div>

                        <div className="flex flex-row">
                            <label
                                htmlFor="metrics"
                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                metrics
                            </label>
                            <select
                                disabled
                                value={currentInformationModel?.compileModel.metrics}
                                id="metrics"
                                className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                            >
                                <option value="accuracy">accuracy</option>
                            </select>
                            <Tooltip text="Extra measures to evaluate model performance, usually for reporting" />
                        </div>
                    </div>
                </section>

                <section className="mt-4">
                    <p className="w-max px-2 py-2 font-semibold text-white bg-orange-500 border border-black rounded-ss rounded-se">
                        Fit Model
                    </p>
                    <div className="flex flex-col gap-8 p-4 shadow-lg border rounded rounded-tl-none">
                        <div>
                            <div className="flex flex-row">
                                <label
                                    htmlFor="epochs"
                                    className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                    epochs
                                </label>
                                <input
                                    value={currentInformationModel?.fitModel.epochs ?? ''}
                                    id={`epochs`}
                                    type="number"
                                    disabled
                                    className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed" />
                                <Tooltip text="An epoch is one complete pass of the entire training dataset through the model during training (e.g. 10)" />
                            </div>
                        </div>

                        <div>
                            <div className="flex flex-row">
                                <label
                                    htmlFor="batch-size"
                                    className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                    batchSize
                                </label>
                                <input
                                    value={currentInformationModel?.fitModel.batchSize ?? ''}
                                    id={`batch-size`}
                                    type="number"
                                    disabled
                                    className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed" />
                                <Tooltip text="Batch size is the number of training samples the model processes before updating its weights once during training (e.g. 32)" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-8 w-full flex flex-col gap-4">
                    <canvas ref={splitDataCanvasElementRef} className="w-full"></canvas>
                    <canvas ref={accTrainValCanvasElementRef} className="w-full"></canvas>
                    <canvas ref={lossTrainValCanvasElementRef} className="w-full"></canvas>
                </div>

                <p className="font-semibold">Total data: {currentInformationModel?.totalData.toLocaleString('id-ID')}</p>
                <div className="my-4 grid grid-cols-2 gap-2">
                    <p className="p-2 text-green-500 border rounded shadow">Acc Test: {currentInformationModel?.evaluationTest.acc.toFixed(4)}</p>
                    <p className="p-2 text-red-500 border rounded shadow">Loss Test: {currentInformationModel?.evaluationTest.loss.toFixed(4)}</p>
                </div>
                <p className="text-sm text-gray-500 italic">Created at: {currentInformationModel?.createdAt}</p>
            </div>
        </>
    );
}