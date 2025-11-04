import { BaseModel } from './BaseModel';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import * as tf from '@tensorflow/tfjs';

export class Predictor extends BaseModel {
    static predict(
        landmarks: NormalizedLandmark[],
        metadata: { mean: tf.Tensor1D; std: tf.Tensor1D; label: string[] },
        model: tf.LayersModel,
    ): string {
        return tf.tidy(() => {
            const input = tf.tensor1d(landmarks.flatMap(p => [p.x, p.y, p.z]));
            const standardized = input.sub(metadata.mean).div(metadata.std).reshape([1, -1]);
            const output = model.predict(standardized) as tf.Tensor;
            const probs = output.dataSync();
            const maxIdx = probs.indexOf(Math.max(...probs));
            return probs[maxIdx] > 0.7 ? metadata.label[maxIdx] : '???';
        });
    }

    static async loadModelFromStorage(keyName: string): Promise<tf.LayersModel> {
        return await tf.loadLayersModel(`localstorage://${keyName}`);
    }
}
