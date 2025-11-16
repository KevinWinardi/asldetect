import * as tf from '@tensorflow/tfjs';
import type { LayerModelType } from '../types/layerModelType';
import type { CompileModelType } from '../types/compileModelType';
import type { EvaluationTrainValType } from '../types/evaluationTrainValType';
import type { FitModelType } from '../types/fitModelType';
import type { EvaluationTestType } from '../types/evaluationTestType';

export class BaseModel {
    protected model: tf.Sequential;

    constructor() {
        this.model = tf.sequential();
    }

    createModel(layerModel: LayerModelType[], compileModel: CompileModelType): void {
        try {
            this.model = tf.sequential();

            layerModel.forEach(layer => {
                switch (layer.type) {
                    case 'inputLayer':
                        // 26 letter * 3 point x y z 
                        this.model.add(tf.layers.inputLayer({ inputShape: layer.input_shape }));
                        break;
                    case 'dense':
                        if (layer.units === null || layer.activation === null) throw new Error(`Dense layer ${layer.id} has no units/activation`);
                        this.model.add(tf.layers.dense({ units: layer.units, activation: layer.activation }));
                        break;
                    case 'batchNormalization':
                        if (layer.momentum === null || layer.epsilon == null) throw new Error(`Batchnormalization layer ${layer.id} has no momentum/epsilon`);
                        this.model.add(tf.layers.batchNormalization({ momentum: layer.momentum, epsilon: layer.epsilon }));
                        break;
                    case 'dropout':
                        if (layer.rate === null) throw new Error(`Output layer ${layer.id} has no rate`);
                        this.model.add(tf.layers.dropout({ rate: layer.rate }));
                        break;
                    case 'output':
                        this.model.add(tf.layers.dense({ units: 26, activation: 'softmax' }));
                }
            })

            const optimizer = this._resolveOptimizer(compileModel.optimizer, compileModel.learningRate);
            this.model.compile({
                optimizer: optimizer,
                loss: compileModel.loss,
                metrics: compileModel.metrics,
            })
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected _resolveOptimizer(type: string | null, lr: number | null) {
        if (!lr) {
            throw new Error('Learning rate cannot be null');
        }

        switch (type) {
            case 'adam': return tf.train.adam(lr);
            case 'sgd': return tf.train.sgd(lr);
            case 'rmsprop': return tf.train.rmsprop(lr);
            default: throw new Error('Invalid optimizer');
        }
    }

    static async loadInformationModel(currentKeyModel: string): Promise<{
        key: string,
        name: string,
        totalData: number,
        splitData: {
            train: number,
            val: number,
            test: number,
        },
        mean: tf.Tensor1D
        std: tf.Tensor1D
        label: string[],
        layerModel: LayerModelType[],
        compileModel: CompileModelType,
        fitModel: FitModelType,
        evaluationTrainVal: EvaluationTrainValType,
        evaluationTest: EvaluationTestType,
        createdAt: string,
    }> {
        let data;

        if (currentKeyModel === 'model_default') {
            const res = await fetch('model_default_information.json');
            data = await res.json();
        } else {
            const res = localStorage.getItem(currentKeyModel);
            if (!res) {
                throw new Error('No model found');
            }
            data = JSON.parse(res);
        }

        return {
            key: data.key,
            name: data.name,
            totalData: data.totalData,
            splitData: data.splitData,
            mean: tf.tensor1d(data.mean),
            std: tf.tensor1d(data.std),
            label: data.label,
            layerModel: data.layerModel,
            compileModel: data.compileModel,
            fitModel: data.fitModel,
            evaluationTrainVal: data.evaluationTrainVal,
            evaluationTest: data.evaluationTest,
            createdAt: data.createdAt,
        };
    }

    static getAllModel(prefix: string): { key: string, name: string }[] | false {
        try {
            const models = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(prefix)) {
                    const value = localStorage.getItem(k);
                    if (value) {
                        try {
                            const item = JSON.parse(value);
                            if (item && typeof item.key === 'string' && typeof item.name === 'string') {
                                models.push({
                                    key: item.key,
                                    name: item.name,
                                });
                            }
                        } catch (error: any) {
                            throw new Error('Something error when getting the model');
                        }
                    }
                }
            }
            return models;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}