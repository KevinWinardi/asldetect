import type { InputLayerType, LayerType, OutputLayerType } from '../types/layerType';
import * as tf from '@tensorflow/tfjs';
import type { SplitDataType } from '../types/splitDataType';
import type { CompileType } from '../types/compileType';
import { Dataset } from './Dataset';
import type { FitModelType } from '../types/fitModelType';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export class Model {
    model: tf.Sequential;
    tensorflowDataset: tf.data.CSVDataset | null;
    splitData: SplitDataType;
    layerModel: LayerType[];
    compileModel: CompileType;
    fitModel: FitModelType;
    setProgressTraining: React.Dispatch<React.SetStateAction<string>>;
    evaluationTrainVal: {
        epoch: number,
        loss: number,
        acc: number,
        val_loss: number,
        val_acc: number,
    }[];
    evaluationTest: {
        loss: number,
        acc: number,
    };

    constructor(
        tensorflowDataset: tf.data.CSVDataset | null,
        splitData: SplitDataType,
        layerModel: LayerType[],
        compileModel: CompileType,
        fitModel: FitModelType,
        setProgressTraining: React.Dispatch<React.SetStateAction<string>>
    ) {
        this.model = tf.sequential();
        this.tensorflowDataset = tensorflowDataset;
        this.splitData = splitData;
        this.layerModel = layerModel;
        this.compileModel = compileModel;
        this.fitModel = { epochs: fitModel.epochs, batchSize: fitModel.batchSize };
        this.setProgressTraining = setProgressTraining;
        this.evaluationTrainVal = [];
        this.evaluationTest = { loss: 0, acc: 0 };
    }

    static initLayer(): LayerType[] {
        const id = +new Date();

        const inputLayer: InputLayerType = {
            id: id,
            type: 'inputLayer',
            input_shape: [63],
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

    createModel(layerModel: LayerType[], compileModel: CompileType) {
        if (this.model) {
            this.model = tf.sequential();
        }
        this.setProgressTraining('Create sequential model');

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
            default:
                throw new Error('Layer model invalid');
        }
        this.model.compile({
            optimizer: optimizer,
            loss: compileModel.loss,
            metrics: compileModel.metrics,
        })
    }

    async startTrain() {
        try {
            await tf.ready();
            if (tf.getBackend() !== 'webgl') {
                await tf.setBackend('webgl');
                await tf.ready();
            }

            this.setProgressTraining('Preprocessing data...');
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

            this.createModel(this.layerModel, this.compileModel);
            this.setProgressTraining('Training model...');
            await this.model.fit(xTrain, yTrain, {
                epochs: this.fitModel.epochs as number,
                batchSize: this.fitModel.batchSize as number,
                validationData: [xVal, yVal],
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        tf.tidy(() => {
                            if (!logs) return;
                            this.evaluationTrainVal.push({
                                epoch: epoch + 1,
                                loss: parseFloat(logs.loss.toFixed(4)),
                                acc: parseFloat(logs.acc.toFixed(4)),
                                val_loss: parseFloat(logs.val_loss.toFixed(4)),
                                val_acc: parseFloat(logs.val_acc.toFixed(4)),
                            });
                        });
                    },
                },
            });

            this.setProgressTraining('Evaluating model...');
            await this.evaluateModel(xTest, yTest)

            return {
                evaluationTrainVal: this.evaluationTrainVal,
                evaluationTest: this.evaluationTest,
                model: this.model,
                mean: Array.from(await mean.data()),
                std: Array.from(await std.data()),
                label: uniqueLabels,
            };
        } catch (error: any) {
            throw new Error(error.message);
        } finally {
            tf.disposeVariables();
        }
    }

    async evaluateModel(xTest: tf.Tensor, yTest: tf.Tensor) {
        const { loss, acc } = tf.tidy(() => {
            const [lossTensor, accTensor] = this.model.evaluate(xTest, yTest) as tf.Scalar[];
            const loss = lossTensor.dataSync()[0];
            const acc = accTensor.dataSync()[0];
            return { loss, acc };
        });

        this.evaluationTest = { loss, acc };
    }

    static prediction(
        landmarks: NormalizedLandmark[],
        aslMetadata: {
            mean: tf.Tensor1D,
            std: tf.Tensor1D,
            label: [],
        },
        loadModel: tf.LayersModel,
    ) {
        const predictedLabel = tf.tidy(() => {
            const flatInput = landmarks.map(p => [p.x, p.y, p.z]).flat(); // result 63 element

            // Normalisasi menggunakan metadata
            const inputTensor = tf.tensor1d(flatInput);
            const standardized = inputTensor
                .sub(aslMetadata.mean)
                .div(aslMetadata.std)
                .reshape([1, -1]); // input [1, 63]

            const prediction = loadModel.predict(standardized); // Tensor [1, 26]
            let predictionData;
            if (Array.isArray(prediction)) {
                // If model outputs multiple tensors
                predictionData = prediction[0].dataSync();
                // Use prediction[0] (the main output)
            } else {
                // If single output tensor
                predictionData = prediction.dataSync();
            }

            const maxProb = Math.max(...predictionData);
            const maxIndex = predictionData.indexOf(maxProb);

            if (maxProb > 0.7) {
                const predictedLabel = aslMetadata.label[maxIndex];
                return predictedLabel;
            } else {
                return '???';
            }
        });
        return predictedLabel;
    }

    static async loadASLMetadata() {
        const res = await fetch('asl_metadata.json');
        const data = await res.json();

        return {
            mean: tf.tensor1d(data.mean),
            std: tf.tensor1d(data.std),
            label: data.label,
        };
    }

    saveModelHandler(
        name: string,
        aslMetadata: { mean: number[], std: number[], label: string[] },
    ): void {
        try {
            const keyModel = name.toLowerCase().split(' ').join('_');
            const metadataModelJSON = JSON.stringify({
                name: name,
                createdAt: new Date(),
                mean: aslMetadata.mean,
                std: aslMetadata.std,
                label: aslMetadata.label,
                evaluationTrainVal: this.evaluationTrainVal,
                evaluationTest: this.evaluationTest,
            })
            localStorage.setItem(keyModel, metadataModelJSON);

            this.model.save(`localstorage://${keyModel}`);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

}