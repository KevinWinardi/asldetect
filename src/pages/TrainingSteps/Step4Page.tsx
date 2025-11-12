import type React from "react";
import { Tooltip } from "../../components/Tooltip";
import type { CompileModelType } from "../../types/compileModelType";
import { useLanguage } from "../../contexts/LanguageContext";

export function Step4Page({
    isStep4Valid,
    setIsStep4Valid,
    compileModel,
    setCompileModel,
}: {
    isStep4Valid: {
        optimizer: boolean | null,
        learningRate: boolean | null,
    },
    setIsStep4Valid: React.Dispatch<React.SetStateAction<{
        optimizer: boolean | null,
        learningRate: boolean | null,
    }>>,
    compileModel: CompileModelType,
    setCompileModel: React.Dispatch<React.SetStateAction<CompileModelType>>,
}) {
    const { t } = useLanguage();
    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">4. Compile model</h2>

            <section className="mt-4">
                <p>{t.compileInfo}</p>
            </section>

            <section className="mt-4">
                <div className="flex">
                    <p className="w-max px-2 py-2 font-semibold text-white bg-zinc-700 border border-black rounded-ss rounded-se">
                        Compile
                    </p>
                </div>
                <div className="flex flex-col gap-4 p-4 border rounded rounded-tl-none shadow">
                    <div>
                        <div className="flex flex-row">
                            <label
                                htmlFor="optimizer"
                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                optimizer
                            </label>
                            <select
                                value={compileModel.optimizer ?? ''}
                                required
                                id="optimizer"
                                className="w-full p-2 border rounded-se rounded-ee"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    let validity = true;
                                    if (!['adam', 'rmsprop', 'sgd'].includes(value)) {
                                        validity = false;
                                    }
                                    setCompileModel(prev => ({ ...prev, optimizer: value as 'adam' | 'rmsprop' | 'sgd' }));
                                    setIsStep4Valid(prev => ({ ...prev, optimizer: validity }));
                                }}
                            >
                                <option value="" disabled>{t.select} optimizer</option>
                                <option value="adam">Adam</option>
                                <option value="rmsprop">RMSProp</option>
                                <option value="sgd">SGD</option>
                            </select>
                            <Tooltip html={
                                <>
                                    <p>{t.optimizerInfo}</p>
                                    <div className="grid grid-cols-[auto_1fr] gap-2">
                                        <span className="font-mono">- Adam:</span>
                                        <span>{t.adamInfo}</span>
                                    </div>
                                    <div className="grid grid-cols-[auto_1fr] gap-2">
                                        <span className="font-mono">- RMSProp:</span>
                                        <span>{t.rmspropInfo}</span>
                                    </div>
                                    <div className="grid grid-cols-[auto_1fr] gap-2">
                                        <span className="font-mono">- SGD:</span>
                                        <span>{t.sgdInfo}</span>
                                    </div>
                                </>
                            }
                            />
                        </div>
                        {
                            isStep4Valid.optimizer === false && (
                                <p className="text-red-500 text-sm">{t.optimizerInvalid}</p>
                            )
                        }
                    </div>

                    <div>
                        <div className="flex flex-row">
                            <label
                                htmlFor="learning-rate"
                                className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                                learning_rate
                            </label>
                            <input
                                value={compileModel.learningRate ?? ''}
                                id="learning-rate"
                                type="number"
                                required
                                step={0.001}
                                min={0}
                                max={1}
                                className={`w-full p-2 border rounded-se rounded-ee`}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    if (value === '') {
                                        setCompileModel(prev => ({ ...prev, learningRate: null }));
                                        setIsStep4Valid(prev => ({ ...prev, learningRate: false }));
                                        return;
                                    }

                                    const parsedValue = Number(value);
                                    let validity = true;
                                    if (isNaN(parsedValue) || parsedValue <= 0 || parsedValue >= 1) {
                                        validity = false;
                                    }

                                    setCompileModel(prev => ({ ...prev, learningRate: parsedValue }));
                                    setIsStep4Valid(prev => ({ ...prev, learningRate: validity }));
                                }}
                            />
                            <Tooltip html={
                                <>
                                    <p>{t.learningRateInfo}</p>
                                    <div className="grid grid-cols-[auto_1fr] gap-2">
                                        <span>{t.learningRateHigh}</span>
                                    </div>
                                    <div className="grid grid-cols-[auto_1fr] gap-2">
                                        <span>{t.learningRateLow}</span>
                                    </div>
                                </>
                            } />
                        </div>
                        {
                            isStep4Valid.learningRate === false && (
                                <p className="text-red-500 text-sm">{t.learningRateInvalid}</p>
                            )
                        }
                    </div>

                    <div className="flex flex-row">
                        <label
                            htmlFor="loss"
                            className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                            loss
                        </label>
                        <select
                            disabled
                            value={compileModel.loss}
                            id="loss"
                            className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                        >
                            <option value="categoricalCrossentropy">Categorical Crossentropy</option>
                        </select>
                        <Tooltip text={t.lossInfo} />
                    </div>

                    <div className="flex flex-row">
                        <label
                            htmlFor="metrics"
                            className="flex items-center justify-center w-max px-2 font-mono text-black bg-gray-300 border border-black rounded-ss rounded-es">
                            metrics
                        </label>
                        <select
                            disabled
                            value={compileModel.metrics}
                            id="metrics"
                            className="w-full p-2 border rounded-se rounded-ee opacity-75 cursor-not-allowed"
                        >
                            <option value="accuracy">accuracy</option>
                        </select>
                        <Tooltip text={t.accInfo} />
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => {
                            setIsStep4Valid({
                                optimizer: true,
                                learningRate: true,
                            });
                            setCompileModel({
                                optimizer: 'adam',
                                learningRate: 0.001,
                                loss: 'categoricalCrossentropy',
                                metrics: 'accuracy',
                            });
                        }}
                        className={`
                    px-4 py-2 font-bold text-white bg-green-500 border-b-4 border-black rounded
                    cursor-pointer transition hover:translate-y-0.5 hover:border-transparent hover:opacity-75
                `}>
                        <i className="fa-solid fa-star"></i> {t.useRecomend}
                    </button>
                </div>
            </section>
        </>
    );
}