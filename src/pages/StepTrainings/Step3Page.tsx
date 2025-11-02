import type React from "react";
import { useState } from "react";
import { Dialog } from "../../utils/Dialog";
import { Tooltip } from "../../components/Tooltip";
import type { BatchNormalizationLayerType, DenseLayerType, DropoutLayerType, LayerType } from "../../types/layerType";
import { Model } from "../../utils/Model";

function InformationHelper() {
    return (
        <section className="flex flex-col gap-4 mt-4">
            <p>A Sequential model is a simple neural network where layers are stacked in order, passing data from one layer directly to the next.</p>
            <div className="p-2 border rounded shadow">
                <p className="font-semibold">InputLayer</p>
                <p className="mt-2">Defines the shape and size of the input data.</p>
            </div>

            <div className="p-2 border rounded shadow">
                <p className="font-semibold">Dense</p>
                <p className="mt-2">Fully connected layer where every neuron connects to all neurons in the next layer.</p>
            </div>

            <div className="p-2 border rounded shadow">
                <p className="font-semibold">BatchNormalization</p>
                <p className="mt-2">Normalizes activations across a batch to make learning faster and more stable.</p>
            </div>

            <div className="p-2 border rounded shadow">
                <p className="font-semibold">Dropout</p>
                <p className="mt-2">Randomly deactivates some neurons during training to prevent overfitting.</p>
            </div>
        </section >
    );
}

function HeaderLayer({
    id,
    title,
    removeLayerHandler,
}: {
    id: number,
    title: string,
    removeLayerHandler: (id: number) => {},
}) {
    return (
        <div className="flex">
            <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss">
                {title}
            </p>
            <button
                onClick={() => removeLayerHandler(id)}
                className="px-4 py-2 bg-red-500 border rounded-se cursor-pointer group">
                <i className="fa-solid fa-trash text-white transition duration-500 group-hover:opacity-75"></i>
            </button>
        </div>
    );
}

export function Step3Page({
    isStep3Valid,
    setIsStep3Valid,
    layerModel,
    setLayerModel,
}: {
    isStep3Valid: { [key: string]: boolean },
    setIsStep3Valid: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
    layerModel: LayerType[],
    setLayerModel: React.Dispatch<React.SetStateAction<LayerType[]>>,
}) {
    const [isOpenOptionLayer, setIsOpenOptionLayer] = useState(false);

    function addLayerHandler(type: 'dense' | 'batchNormalization' | 'dropout') {
        setIsOpenOptionLayer(false);

        const id = +new Date();
        switch (type) {
            case 'dense':
                setLayerModel(prev => {
                    const newLayer: DenseLayerType = {
                        id: id,
                        type: 'dense',
                        activation: 'relu',
                        units: 32,
                    };

                    const updated = [...prev];
                    updated.splice(updated.length - 1, 0, newLayer);
                    return updated;
                })
                setIsStep3Valid(prev => ({ ...prev, [`units-${id}`]: true }));
                setIsStep3Valid(prev => ({ ...prev, [`activation-${id}`]: true }));
                break;
            case 'batchNormalization':
                setLayerModel(prev => {
                    const newLayer: BatchNormalizationLayerType = {
                        id: id,
                        type: 'batchNormalization',
                        epsilon: 0.001,
                        momentum: 0.99,
                    };

                    const updated = [...prev];
                    updated.splice(updated.length - 1, 0, newLayer);
                    return updated;
                });
                setIsStep3Valid(prev => ({ ...prev, [`momentum-${id}`]: true }));
                setIsStep3Valid(prev => ({ ...prev, [`epsilon-${id}`]: true }));
                break;
            case 'dropout':
                setLayerModel(prev => {
                    const newLayer: DropoutLayerType = {
                        id: id,
                        type: 'dropout',
                        rate: 0.5,
                    }

                    const updated = [...prev];
                    updated.splice(updated.length - 1, 0, newLayer);
                    return updated;
                })
                setIsStep3Valid(prev => ({ ...prev, [`rate-${id}`]: true }));
                break;
        }
    }

    async function removeLayerHandler(id: number) {
        const confirmation = await Dialog.showConfirmation('Are you sure want to delete this layer?')
        if (confirmation.isConfirmed) {
            setLayerModel(prev =>
                prev.filter(l => l.id !== id)
            );
        }
    }

    function renderLayer(layer: LayerType) {
        switch (layer.type) {
            case 'dense':
                return (
                    <div key={layer.id} className="flex flex-col">
                        <div className="flex flex-col">
                            <HeaderLayer id={layer.id} title="Dense" removeLayerHandler={removeLayerHandler} />

                            <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                                <div>
                                    <div className="flex flex-row">
                                        <label
                                            htmlFor={`units-${layer.id}`}
                                            className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                            units
                                        </label>
                                        <input
                                            value={layer.units}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                let validity = true;
                                                if (isNaN(value) || !Number.isInteger(value) || value <= 0) {
                                                    validity = false;
                                                }
                                                setIsStep3Valid(prev => ({ ...prev, [`units-${layer.id}`]: validity }));

                                                setLayerModel(prev =>
                                                    prev.map(l =>
                                                        l.id === layer.id ? { ...l, units: value } : l
                                                    )
                                                );
                                            }}
                                            id={`units-${layer.id}`}
                                            type="number"
                                            step={1}
                                            min={1}
                                            className="w-full p-2 border rounded-se rounded-ee" />
                                        <Tooltip text="Number of neurons" />
                                    </div>
                                    {
                                        !isStep3Valid[`units-${layer.id}`] && (
                                            <p className="text-red-500 text-sm">Input must be positive integer number</p>
                                        )
                                    }
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
                                            value={layer.activation}
                                            required
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                let validity = true;
                                                if (!['relu', 'elu', 'swish', 'tanh'].includes(value)) {
                                                    validity = false;
                                                }

                                                setIsStep3Valid(prev => ({ ...prev, [`activation-${layer.id}`]: validity }));

                                                setLayerModel(prev =>
                                                    prev.map(l =>
                                                        l.id === layer.id && l.type === 'dense'
                                                            ? ({ ...l, activation: value } as LayerType)
                                                            : l
                                                    )
                                                );

                                            }}
                                            className="w-full p-2 border rounded-se rounded-ee"
                                        >
                                            <option value="relu" className="border-4 bg-blue-100">relu</option>
                                            <option value="elu" className="border-4 bg-blue-100">elu</option>
                                            <option value="swish" className="border-4 bg-blue-100">swish</option>
                                            <option value="tanh" className="border-4 bg-blue-100">tanh</option>
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
                                    {
                                        !isStep3Valid[`activation-${layer.id}`] && (
                                            <p className="text-red-500 text-sm">Activation can be used are relu, elu, swish, and tanh</p>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'batchNormalization':
                return (
                    <div key={layer.id} className="flex flex-col">
                        <HeaderLayer id={layer.id} title="BatchNormalization" removeLayerHandler={removeLayerHandler} />

                        <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                            <div>
                                <div className="flex flex-row">
                                    <label
                                        htmlFor={`momentum-${layer.id}`}
                                        className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                        momentum
                                    </label>
                                    <input
                                        value={layer.momentum}
                                        id={`momentum-${layer.id}`}
                                        type="number"
                                        step={0.01}
                                        min={0.00}
                                        max={1}
                                        className="w-full p-2 border rounded-se rounded-ee"
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            let validity = true;
                                            if (isNaN(value) || value <= 0 || value >= 1) {
                                                validity = false;
                                            }

                                            setIsStep3Valid(prev => ({ ...prev, [`momentum-${layer.id}`]: validity }));

                                            setLayerModel(prev =>
                                                prev.map(l =>
                                                    l.id === layer.id ? { ...l, momentum: value } : l
                                                )
                                            );
                                        }}
                                    />
                                    <Tooltip text="How much past mean/variance are kept" />
                                </div>
                                {
                                    !isStep3Valid[`momentum-${layer.id}`] && (
                                        <p className="text-red-500 text-sm">Input must be a float greater than 0 and less than 1(e.g., 0.99)</p>
                                    )
                                }
                            </div>

                            <div>
                                <div className="flex flex-row">
                                    <label
                                        htmlFor={`epsilon-${layer.id}`}
                                        className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                        epsilon
                                    </label>
                                    <input
                                        value={layer.epsilon}
                                        id={`epsilon-${layer.id}`}
                                        type="number"
                                        step={0.00001}
                                        min={0.00000}
                                        max={0.001}
                                        className="w-full p-2 border rounded-se rounded-ee"
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            let validity = true;
                                            if (isNaN(value) || value <= 0 || value >= 1) {
                                                validity = false;
                                            }

                                            setIsStep3Valid(prev => ({ ...prev, [`epsilon-${layer.id}`]: validity }));

                                            setLayerModel(prev =>
                                                prev.map(l =>
                                                    l.id === layer.id ? { ...l, epsilon: value } : l
                                                )
                                            );
                                        }}
                                    />
                                    <Tooltip text="Small value to avoid division by zero" />
                                </div>
                                {
                                    !isStep3Valid[`epsilon-${layer.id}`] && (
                                        <p className="text-red-500 text-sm">Input must be float in range from 0.00001 - 0.001</p>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                );
            case 'dropout':
                return (
                    <div key={layer.id} className="flex flex-col">
                        <HeaderLayer id={layer.id} title="Dropout" removeLayerHandler={removeLayerHandler} />

                        <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                            <div>
                                <div className="flex flex-row">
                                    <label
                                        htmlFor={`rate-${layer.id}`}
                                        className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                        rate
                                    </label>
                                    <input
                                        value={layer.rate}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            let validity = true;
                                            if (isNaN(value) || value <= 0 || value >= 1) {
                                                validity = false
                                            }

                                            setIsStep3Valid(prev => ({ ...prev, [`rate-${layer.id}`]: validity }));

                                            setLayerModel(prev =>
                                                prev.map(l =>
                                                    l.id === layer.id ? { ...l, rate: value } : l
                                                )
                                            );
                                        }}
                                        id={`rate-${layer.id}`}
                                        type="number"
                                        step={0.1}
                                        min={0.0}
                                        max={1}
                                        className="w-full p-2 border rounded-se rounded-ee" />
                                    <Tooltip text="Fraction (0-1) of neurons to drop" />
                                </div>
                                {
                                    !isStep3Valid[`rate-${layer.id}`] && (
                                        <p className="text-red-500 text-sm">Input must be a float greater than 0 and less than 1 (e.g., 0.5)</p>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                );
        }
    }

    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">3. Create sequential model</h2>

            <InformationHelper />

            <section className="mt-8">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col">
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
                                    value={26}
                                    id="input_shape"
                                    type="number"
                                    className="w-full p-2 border rounded-r opacity-75 cursor-not-allowed" />
                                <Tooltip text="Tuple of input dimensions" />
                            </div>
                        </div>
                    </div>

                    {layerModel.map(layer => renderLayer(layer))}

                    <div>
                        <button
                            onClick={() => setIsOpenOptionLayer(!isOpenOptionLayer)}
                            title="Add Layer"
                            className=" flex justify-center items-center mx-auto w-12 h-12 px-4 py-2 font-bold text-white bg-yellow-500 border-b-4 border-black
                            rounded-full cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        "
                        >
                            <i className={`fa-solid fa-plus transition ${isOpenOptionLayer ? 'rotate-45' : 'rotate-0'} text-2xl text-white`}></i>
                        </button>

                        <div className={`transition duration-500 ${isOpenOptionLayer ? 'translate-y-0 opacity-100' : 'opacity-0 -translate-y-2 max-h-0'} flex justify-center flex-wrap gap-4 mt-4`}>
                            <button
                                onClick={() => addLayerHandler('dense')}
                                className="p-2 font-semibold border rounded shadow cursor-pointer transition hover:scale-95">
                                Dense
                            </button>
                            <button
                                onClick={() => addLayerHandler('batchNormalization')}
                                className="p-2 font-semibold border rounded shadow cursor-pointer transition hover:scale-95">
                                BatchNormalization
                            </button>
                            <button
                                onClick={() => addLayerHandler('dropout')}
                                className="p-2 font-semibold border rounded shadow cursor-pointer transition hover:scale-95">
                                Dropout
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
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
                                    value={26}
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
                </div>

                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => {
                            const recommendedLayer: LayerType[] = Model.recommendedLayer();
                            setIsStep3Valid({});
                            recommendedLayer.forEach(item => {
                                switch (item.type) {
                                    case 'dense':
                                        setIsStep3Valid(prev => ({ ...prev, [`units-${item.id}`]: true }));
                                        setIsStep3Valid(prev => ({ ...prev, [`activation-${item.id}`]: true }));
                                        break;
                                    case 'batchNormalization':
                                        setIsStep3Valid(prev => ({ ...prev, [`momentum-${item.id}`]: true }));
                                        setIsStep3Valid(prev => ({ ...prev, [`epsilon-${item.id}`]: true }));
                                        break;
                                    case 'dropout':
                                        setIsStep3Valid(prev => ({ ...prev, [`rate-${item.id}`]: true }));
                                }
                            });
                            setLayerModel(recommendedLayer);
                        }}
                        className={`
                            px-4 py-2 font-bold text-white bg-green-500 border-b-4 border-black rounded
                            cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        <i className="fa-solid fa-star"></i> Use recommended
                    </button>
                </div>
            </section >
        </>
    );
}