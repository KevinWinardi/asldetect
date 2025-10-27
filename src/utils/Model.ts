import * as tf from '@tensorflow/tfjs';
import type { InputLayerType, LayerType, OutputLayerType } from '../types/layerType';

export class Model {
    constructor() {

    }

    static initLayer(): LayerType[] {
        const id = +new Date();

        const inputLayer: InputLayerType = {
            id: id,
            type: 'inputLayer',
            input_shape: [26],
        }

        const outputLayer: OutputLayerType = {
            id: id + 1,
            type: 'output',
            units: 26,
            activation: 'softmax',
        }

        return [inputLayer, outputLayer];
    }

    static recommendedLayer(): LayerType[] {
        const layer: LayerType[] = [];
        const id = +new Date() + 2;
        
        const initLayers = this.initLayer();
        layer.push(...initLayers);

        const hiddenLayers: LayerType[] = [
            {
                id: id + 1,
                type: 'dense',
                activation: 'relu',
                units: 64,
            },
            {
                id: id + 2,
                type: 'batchNormalization',
                epsilon: 0.001,
                momentum: 0.99,
            },
            {
                id: id + 3,
                type: 'dropout',
                rate: 0.4,
            },
            {
                id: id + 4,
                type: 'dense',
                activation: 'relu',
                units: 32,
            },

            {
                id: id + 5,
                type: 'dropout',
                rate: 0.5,
            },
        ]

        layer.splice(layer.length - 1, 0, ...hiddenLayers);
        return layer;

    }
}