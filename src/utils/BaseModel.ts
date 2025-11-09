import * as tf from '@tensorflow/tfjs';
import type { InputLayerType, LayerType, OutputLayerType } from '../types/layerType';
import type { CompileModelType } from '../types/compileModelType';
import { Dialog } from './Dialog';

export class BaseModel {
    protected model: tf.Sequential;

    constructor() {
        this.model = tf.sequential();
    }

    createModel(layerModel: LayerType[], compileModel: CompileModelType): void {
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

    static async loadASLMetadata(keyName?: string) {
        let data;
        if (keyName) {
            const res = localStorage.getItem(keyName);
            if (!res) throw new Error(`No metadata found for key: ${keyName}`);
            data = JSON.parse(res);
        } else {
            const res = await fetch('asl_metadata.json');
            if (!res.ok) throw new Error('Failed to load asl_metadata.json');
            data = await res.json();
        }

        return {
            mean: tf.tensor1d(data.mean),
            std: tf.tensor1d(data.std),
            label: data.label,
        };
    }

    static initLayer(): LayerType[] {
        const inputLayer: InputLayerType = {
            id: crypto.randomUUID(),
            type: 'inputLayer',
            input_shape: [63],
        }

        const outputLayer: OutputLayerType = {
            id: crypto.randomUUID(),
            type: 'output',
            units: 26,
            activation: 'softmax',
        }

        return [inputLayer, outputLayer];
    }

    static recommendedLayer(): LayerType[] {
        const layer: LayerType[] = [];

        const initLayers = this.initLayer();
        layer.push(...initLayers);

        const hiddenLayers: LayerType[] = [
            {
                id: crypto.randomUUID(),
                type: 'dense',
                activation: 'relu',
                units: 64,
            },
            {
                id: crypto.randomUUID(),
                type: 'batchNormalization',
                epsilon: 0.001,
                momentum: 0.99,
            },
            {
                id: crypto.randomUUID(),
                type: 'dropout',
                rate: 0.4,
            },
            {
                id: crypto.randomUUID(),
                type: 'dense',
                activation: 'relu',
                units: 32,
            },

            {
                id: crypto.randomUUID(),
                type: 'dropout',
                rate: 0.5,
            },
        ]

        layer.splice(layer.length - 1, 0, ...hiddenLayers);
        return layer;
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
            Dialog.showError(error.message);
            return false;
        }
    }
}