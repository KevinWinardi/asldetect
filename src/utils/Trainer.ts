import type { CompileType } from '../types/compileType';
import type { FitModelType } from '../types/fitModelType';
import type { LayerType } from '../types/layerType';
import type { SplitDataType } from '../types/splitDataType';
import { BaseModel } from './BaseModel';
import { Dataset } from './Dataset';
import * as tf from '@tensorflow/tfjs';

export class Trainer extends BaseModel {
    private setProgress: React.Dispatch<React.SetStateAction<string>>;
    private evaluationTrainVal: {
        epoch: number,
        loss: number,
        acc: number,
        valLoss: number,
        valAcc: number,
    }[] = [];
    private evaluationTest = { loss: 0, acc: 0 };

    constructor(setProgress: React.Dispatch<React.SetStateAction<string>>) {
        super();
        this.setProgress = setProgress;
    }

    async startTraining(dataset: tf.data.CSVDataset | null, splitData: SplitDataType, layerModel: LayerType[], compileModel: CompileType, fitModel: FitModelType) {
        await tf.ready();
        this.setProgress('Preprocessing data...');
        const { xTrain, xVal, xTest, yTrain, yVal, yTest, mean, std, uniqueLabels } =
            await Dataset.preprocessDataset(dataset, splitData);

        this.setProgress('Create sequential model...');
        this.createModel(layerModel, compileModel);

        this.setProgress('Training...');
        await this.model.fit(xTrain, yTrain, {
            ...fitModel,
            validationData: [xVal, yVal],
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (logs) {
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

    async saveModel(name: string, metadata: { mean: number[]; std: number[]; label: string[] }) {
        const key = name.toLowerCase().replace(/\s+/g, '_');
        localStorage.setItem(
            key,
            JSON.stringify({
                name,
                createdAt: new Date(),
                evaluationTrainVal: this.evaluationTrainVal,
                evaluationTest: this.evaluationTest,
                ...metadata,
            }),
        );
        await this.model.save(`localstorage://${key}`);
    }
}
