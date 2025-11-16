import { BaseModel } from './BaseModel';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import * as tf from '@tensorflow/tfjs';

export class Predictor extends BaseModel {
    static async loadModel(keyName: string): Promise<tf.LayersModel> {
        if (keyName === 'model_default') {
            return await tf.loadLayersModel('./model_default.json');
        }
        return await tf.loadLayersModel(`localstorage://${keyName}`);
    }

    static predict({
        landmarks,
        mean,
        std,
        label,
        model,
    }: {
        landmarks: NormalizedLandmark[],
        mean: tf.Tensor1D,
        std: tf.Tensor1D,
        label: string[],
        model: tf.LayersModel,
    }) {
        return tf.tidy(() => {
            const input = tf.tensor1d(landmarks.flatMap(p => [p.x, p.y, p.z]));
            const standardized = input.sub(mean).div(std).reshape([1, -1]);
            const output = model.predict(standardized) as tf.Tensor;
            const probs = output.dataSync();
            const maxIdx = probs.indexOf(Math.max(...probs));
            return {
                predictedLabel: label[maxIdx],
                confidence: Math.max(...probs),
            }
        });
    }
}
