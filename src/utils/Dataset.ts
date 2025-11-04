import * as tf from '@tensorflow/tfjs';
import type { SplitDataType } from '../types/splitDataType';

export class Dataset {
    arrayData: (number | string)[][] = [
        ['x0', 'y0', 'z0',
            'x1', 'y1', 'z1',
            'x2', 'y2', 'z2',
            'x3', 'y3', 'z3',
            'x4', 'y4', 'z4',
            'x5', 'y5', 'z5',
            'x6', 'y6', 'z6',
            'x7', 'y7', 'z7',
            'x8', 'y8', 'z8',
            'x9', 'y9', 'z9',
            'x10', 'y10', 'z10',
            'x11', 'y11', 'z11',
            'x12', 'y12', 'z12',
            'x13', 'y13', 'z13',
            'x14', 'y14', 'z14',
            'x15', 'y15', 'z15',
            'x16', 'y16', 'z16',
            'x17', 'y17', 'z17',
            'x18', 'y18', 'z18',
            'x19', 'y19', 'z19',
            'x20', 'y20', 'z20',
            'label',
        ]
    ];
    async checkValidityDataset(file: File): Promise<boolean> {
        const expectedHeader = this.arrayData[0];

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const csvContent = e.target?.result;
                if (typeof csvContent !== 'string') {
                    return reject(new Error('File CSV not valid'));
                }
                const rows = csvContent.split(/\r?\n/);
                const csvHeader = rows[0].split(',').map(h => h.trim());

                if (
                    csvHeader.length !== expectedHeader.length ||
                    csvHeader.every((val, idx) => val !== expectedHeader[idx])
                ) {
                    return reject(new Error('Header CSV is not valid'));
                }

                if (rows.length < 261) {
                    return reject(new Error('CSV file is not valid, make sure the data is not changed/removed'));
                }

                for (let i = 1; i < Math.min(rows.length, 10); i++) {
                    const cols = rows[i].split(',');
                    if (cols.length !== expectedHeader.length) {
                        return reject(new Error(`Row ${i + 1} have not valid column count`))
                    }
                    if (cols.some((val, idx) => idx < cols.length - 1 && isNaN(Number(val)))) {
                        return reject(new Error(`Row ${i + 1} have non-numeric value`));
                    }
                }
                resolve(true);
            }
            reader.readAsText(file);
            reader.onerror = () => reject(new Error('Error when read file'));
        })
    }

    loadDataset(url: string): tf.data.CSVDataset {
        const data = tf.data.csv(url, {
            columnConfigs: {
                'label': { isLabel: true }
            },
            hasHeader: true,
        });

        return data;
    }

    static async preprocessDataset(tensorflowDataset: tf.data.CSVDataset | null, splitData: SplitDataType) {
        if (!tensorflowDataset) {
            throw new Error('Dataset cannot be null');
        }

        const typedDataset = tensorflowDataset as unknown as tf.data.Dataset<{
            xs: tf.TensorContainer;
            ys: tf.TensorContainer;
        }>;

        const pointsDataset = typedDataset.map(({ xs, ys }) => {
            const xsTensor = Object.values(xs as Record<string, number>);
            const ysTensor = Object.values(ys as Record<string, string>)[0];
            return { xs: xsTensor, ys: ysTensor };
        });

        const dataArray = await pointsDataset.toArray();
        const featureArray = dataArray.map(d => d.xs);
        const labelArray = dataArray.map(d => d.ys);

        // Label encoding
        const uniqueLabels = [...new Set(labelArray)];
        const labelToIndex = Object.fromEntries(uniqueLabels.map((label, idx) => [label, idx]));
        const encodedLabels = labelArray.map(label => labelToIndex[label]);

        // Stratified split
        const trainRatio = splitData.train / 100;
        const valRatio = splitData.val / 100;

        const perLabelIndices: Record<string, number[]> = {};
        uniqueLabels.forEach(label => {
            perLabelIndices[label] = [];
        });
        // Group index per label
        labelArray.forEach((label, i) => perLabelIndices[label].push(i));

        const trainIdx = [];
        const valIdx = [];
        const testIdx = [];

        for (const label of uniqueLabels) {
            const indices = perLabelIndices[label];
            tf.util.shuffle(indices);

            const nTotal = indices.length;
            const nTrain = Math.floor(nTotal * trainRatio);
            const nVal = Math.floor(nTotal * valRatio);

            trainIdx.push(...indices.slice(0, nTrain));
            valIdx.push(...indices.slice(nTrain, nTrain + nVal));
            testIdx.push(...indices.slice(nTrain + nVal));
        }

        // Get data from split index
        const xTrainArray = trainIdx.map(i => featureArray[i]);
        const yTrainArray = trainIdx.map(i => encodedLabels[i]);
        const xValArray = valIdx.map(i => featureArray[i]);
        const yValArray = valIdx.map(i => encodedLabels[i]);
        const xTestArray = testIdx.map(i => featureArray[i]);
        const yTestArray = testIdx.map(i => encodedLabels[i]);

        // Create tensor
        const xTrain = tf.tensor2d(xTrainArray);
        const xVal = tf.tensor2d(xValArray);
        const xTest = tf.tensor2d(xTestArray);

        const yTrain = tf.oneHot(tf.tensor1d(yTrainArray, 'int32'), uniqueLabels.length).toFloat();
        const yVal = tf.oneHot(tf.tensor1d(yValArray, 'int32'), uniqueLabels.length).toFloat();
        const yTest = tf.oneHot(tf.tensor1d(yTestArray, 'int32'), uniqueLabels.length).toFloat();

        // Standarize
        const { xTrainNorm, xValNorm, xTestNorm, mean, std } = tf.tidy(() => {
            const { mean, variance } = tf.moments(xTrain, 0);
            const std = tf.sqrt(variance);

            const xTrainNorm = xTrain.sub(mean).div(std);
            const xValNorm = xVal.sub(mean).div(std);
            const xTestNorm = xTest.sub(mean).div(std);

            return { xTrainNorm, xValNorm, xTestNorm, mean, std };
        });

        xTrain.dispose();
        xVal.dispose();
        xTest.dispose();

        return {
            xTrain: xTrainNorm,
            xVal: xValNorm,
            xTest: xTestNorm,
            yTrain,
            yVal,
            yTest,
            mean,
            std,
            uniqueLabels,
        };
    }

    addDataToArray(data: (number | string)[]): void {
        this.arrayData.push(data)
    }

    downloadDataset(): void {
        const csv = this.arrayData.map(row => row.join(',')).join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const downloadBtn = document.createElement('a');
        downloadBtn.setAttribute('href', url);
        downloadBtn.setAttribute('download', 'data.csv');
        document.body.appendChild(downloadBtn);
        downloadBtn.click();
        document.body.removeChild(downloadBtn);

        URL.revokeObjectURL(url);
    }
}