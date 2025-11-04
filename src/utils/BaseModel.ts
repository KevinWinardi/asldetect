import * as tf from '@tensorflow/tfjs';
import type { LayerType } from '../types/layerType';
import type { CompileType } from '../types/compileType';

export class BaseModel {
    protected model: tf.Sequential;

    constructor() {
        this.model = tf.sequential();
    }

    createModel(layerModel: LayerType[], compileModel: CompileType) {
        this.model = tf.sequential();

        layerModel.forEach(layer => {
            switch (layer.type) {
                case 'inputLayer':
                    // 26 letter * 3 point x y z 
                    this.model.add(tf.layers.inputLayer({ inputShape: layer.input_shape }));
                    break;
                case 'dense':
                    this.model.add(tf.layers.dense({ units: layer.units, activation: layer.activation }));
                    break;
                case 'batchNormalization':
                    this.model.add(tf.layers.batchNormalization({ momentum: layer.momentum, epsilon: layer.epsilon }));
                    break;
                case 'dropout':
                    this.model.add(tf.layers.dropout({ rate: layer.rate }));
                    break;
                case 'output':
                    this.model.add(tf.layers.dense({ units: layer.units, activation: 'softmax' }));
            }
        })

        const optimizer = this._resolveOptimizer(compileModel.optimizer, compileModel.learningRate);
        this.model.compile({
            optimizer: optimizer,
            loss: compileModel.loss,
            metrics: compileModel.metrics,
        })
    }

    protected _resolveOptimizer(type: string, lr: number) {
        switch (type) {
            case 'adam': return tf.train.adam(lr);
            case 'sgd': return tf.train.adam(lr);
            case 'rmsprop': return tf.train.adam(lr);
            default: throw new Error('Invalid optimizer');
        }
    }

    static async loadASLMetadata(keyLocalStorage: string){
        // let res;
        // if(keyLocalStorage){
        //     res = localStorage.getItem(keyLocalStorage);
        //     const json = await JSON.parse(res);
        // }
        const res = await fetch('asl_metadata.json');
        const data = await res.json();
        return {
            mean: tf.tensor1d(data.mean),
            std: tf.tensor1d(data.std),
            label: data.label,
        }
    }
}