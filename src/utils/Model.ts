import type { InputLayerType, LayerType, OutputLayerType } from '../types/layerType';
import * as tf from '@tensorflow/tfjs';
import type { SplitDataType } from '../types/splitDataType';
import type { CompileType } from '../types/compileType';
import { Dataset } from './Dataset';

export class Model {
    model: tf.Sequential;
    tensorflowDataset: tf.data.CSVDataset | null;
    splitData: SplitDataType;
    sequentialModel: LayerType[];
    compileModel: CompileType;
    setProgressTraining: React.Dispatch<React.SetStateAction<string>>;
    evaluationModel: {
        epoch: number,
        loss: number,
        acc: number,
    }[];

    constructor(
        tensorflowDataset: tf.data.CSVDataset | null,
        splitData: SplitDataType,
        sequentialModel: LayerType[],
        compileModel: CompileType,
        setProgressTraining: React.Dispatch<React.SetStateAction<string>>
    ) {
        this.model=tf.sequential();
        this.tensorflowDataset = tensorflowDataset;
        this.splitData = splitData;
        this.sequentialModel = sequentialModel;
        this.compileModel = compileModel;
        this.setProgressTraining = setProgressTraining;
        this.evaluationModel = [];
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

    createModel(sequentialModel: LayerType[], compileModel: CompileType) {
        this.setProgressTraining('Create sequential model');

        sequentialModel.forEach(layer => {
            switch (layer.type) {
                case 'inputLayer':
                    this.model.add(tf.layers.inputLayer({ inputShape: [26] }));
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
                    this.model.add(tf.layers.dense({ units: 26, activation: 'softmax' }));
            }
        })

        this.setProgressTraining('Compiling model');
        let optimizer;
        switch (compileModel.optimizer) {
            case 'adam':
                optimizer = tf.train.adam(compileModel.learningRate);
                break;
            case 'rmsprop':
                optimizer = tf.train.rmsprop(compileModel.learningRate);
                break;
            case 'sgd':
                optimizer = tf.train.sgd(compileModel.learningRate);
                break;
        }
        this.model.compile({
            optimizer: optimizer,
            loss: compileModel.loss,
            metrics: compileModel.metrics,
        })
    }

    async startTrain() {
        this.setProgressTraining('Preprocessing Data');
        const {
            xTrain,
            xVal,
            xTest,
            yTrain,
            yVal,
            yTest,
            mean,
            std,
            uniqueLabels,
        } = await Dataset.preprocessDataset(this.tensorflowDataset, this.splitData);

        const model = this.createModel(this.sequentialModel, this.compileModel);

        this.setProgressTraining('Training model');

        await model.fit(xTrain, yTrain, {
            epochs: 5,
            batchSize: 32,
            validationData: [xVal, yVal],
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (!logs?.loss || !logs?.acc) return;

                    this.evaluationModel.push({
                        epoch: epoch,
                        loss: parseFloat(logs.loss.toFixed(4)),
                        acc: parseFloat(logs.acc.toFixed(4)),
                    })
                },
            },
        });
    }

    saveModel(){

    }
}