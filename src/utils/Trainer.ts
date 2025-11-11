import type { CompileModelType } from '../types/compileModelType';
import type { EvaluationTrainValType } from '../types/evaluationTrainValType';
import type { FitModelType } from '../types/fitModelType';
import type { InputLayerType, LayerModelType, OutputLayerType } from '../types/layerModelType';
import type { SplitDataType } from '../types/splitDataType';
import { BaseModel } from './BaseModel';
import { Dataset } from './Dataset';
import * as tf from '@tensorflow/tfjs';

export class Trainer extends BaseModel {
    private setProgress: React.Dispatch<React.SetStateAction<string>>;
    private evaluationTrainVal: EvaluationTrainValType = [];
    private evaluationTest = { loss: 0, acc: 0 };

    constructor(setProgress: React.Dispatch<React.SetStateAction<string>>) {
        super();
        this.setProgress = setProgress;
    }

    async startTraining(
        dataset: tf.data.CSVDataset | null,
        splitData: SplitDataType,
        layerModel: LayerModelType[],
        compileModel: CompileModelType,
        fitModel: FitModelType
    ) {
        if (!fitModel.epochs || !fitModel.batchSize) {
            throw new Error('Epochs and batch size cannot be null');
        }

        await tf.setBackend('webgl');
        await tf.ready();
        this.setProgress('Preprocessing data...');
        const { xTrain, xVal, xTest, yTrain, yVal, yTest, mean, std, uniqueLabels } =
            await Dataset.preprocessDataset(dataset, splitData);

        this.setProgress('Create sequential model...');
        this.createModel(layerModel, compileModel);

        this.setProgress('Training model...');

        await this.model.fit(xTrain, yTrain, {
            epochs: fitModel.epochs,
            batchSize: fitModel.batchSize,
            validationData: [xVal, yVal],
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (logs) {
                        this.setProgress(`Training on epoch ${epoch}...`);

                        this.evaluationTrainVal.push({
                            epoch: epoch + 1,
                            loss: logs.loss,
                            acc: logs.acc,
                            valLoss: logs.val_loss,
                            valAcc: logs.val_acc,
                        });
                    }
                },
            },
        });

        await this._evaluateModel(xTest, yTest);
        return {
            evaluationTrainVal: this.evaluationTrainVal,
            evaluationTest: this.evaluationTest,
            mean: Array.from(await mean.data()),
            std: Array.from(await std.data()),
            label: uniqueLabels
        };
    }

    async _evaluateModel(xTest: tf.Tensor, yTest: tf.Tensor) {
        this.setProgress('Evaluate model...');
        const [loss, acc] = this.model.evaluate(xTest, yTest) as tf.Scalar[];
        this.evaluationTest = {
            loss: loss.dataSync()[0],
            acc: acc.dataSync()[0],
        };
    }

    async stopTraining() {
        if (this.model) {
            this.model.stopTraining = true;
        }
        tf.engine().disposeVariables();
    }

    async saveModel({
        name,
        totalData,
        splitData,
        mean,
        std,
        label,
        layerModel,
        compileModel,
        fitModel,
    }: {
        name: string,
        totalData: number,
        splitData: SplitDataType,
        mean: number[],
        std: number[],
        label: string[],
        layerModel: LayerModelType[],
        compileModel: CompileModelType,
        fitModel: FitModelType,
    }): Promise<void> {
        const key = 'model_' + name.toLowerCase().replace(/\s+/g, '_');
        localStorage.setItem(
            key,
            JSON.stringify({
                key: key,
                name: name,
                totalData: totalData,
                splitData: splitData,
                mean: mean,
                std: std,
                label: label,
                layerModel: layerModel,
                compileModel: compileModel,
                fitModel: fitModel,
                evaluationTrainVal: this.evaluationTrainVal,
                evaluationTest: this.evaluationTest,
                createdAt: new Date(),
            }),
        );
        await this.model.save(`localstorage://${key}`);
        // this.model.save('downloads://model_default');
        // const blob = new Blob([JSON.stringify({
        //     key: key,
        //     name: name,
        //     totalData: totalData,
        //     splitData: splitData,
        //     mean: mean,
        //     std: std,
        //     label: label,
        //     layerModel: layerModel,
        //     compileModel: compileModel,
        //     fitModel: fitModel,
        //     evaluationTrainVal: this.evaluationTrainVal,
        //     evaluationTest: this.evaluationTest,
        //     createdAt: new Date(),
        // }, null, 2)], { type: 'application/json' });
        // const url = URL.createObjectURL(blob);

        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'model_default_information.json';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
    }


    static initLayer(): LayerModelType[] {
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

    static recommendedLayer(): LayerModelType[] {
        const layer: LayerModelType[] = [];

        const initLayers = this.initLayer();
        layer.push(...initLayers);

        const hiddenLayers: LayerModelType[] = [
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

}
