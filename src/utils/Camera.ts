import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { Dialog } from "./Dialog";
import type { Canvas } from "./Canvas";
import type { Dataset } from "./Dataset";
import * as tf from '@tensorflow/tfjs';
import type React from "react";
import { Predictor } from "./Predictor";

export class Camera {
    videoElement: HTMLVideoElement | null;
    currentStream: MediaStream | null;
    detectionLoopId: number | null;

    constructor(videoElement: HTMLVideoElement | null) {
        this.videoElement = videoElement;
        this.currentStream = null;
        this.detectionLoopId = null;
    }

    async requestPermission(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((track) => track.stop());
            return true;
        } catch (error: any) {
            let message;
            if (error.name === 'NotAllowedError') {
                message = 'Please enable camera permission';
            } else if (error.name === 'NotFoundError') {
                message = 'Camera Not Found';
            }
            Dialog.showError(message ?? 'Something error');
            return false;
        }
    }

    async createOptions(): Promise<{ value: string, text: string }[] | false> {
        try {
            const options: { value: string, text: string }[] = [];
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(device => device.kind === 'videoinput');

            videoInputs.forEach((device, index) => {
                const value = device.deviceId;
                const text = device.label || `Camera ${index + 1}`;
                options.push({ value: value, text: text });
            });

            return options;
        } catch (error: any) {
            Dialog.showError(error.message);
            return false;
        }
    }

    async change(deviceId: string): Promise<void> {
        try {
            if (!this.videoElement) {
                throw new Error('videoElement element is not available');
            }

            if (!this.currentStream) {
                throw new Error('There is no active any camera');
            }

            this.currentStream.getTracks().forEach(track => track.stop());

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: {
                        exact: deviceId
                    }
                }
            });
            this.currentStream = stream;

            this.videoElement.srcObject = stream;
            await this.videoElement.play();
        } catch (error: any) {
            Dialog.showError(error.message);
        }
    }

    async start(): Promise<void> {
        try {
            if (!this.videoElement) {
                throw new Error('videoElement element is not available');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.currentStream = stream;

            this.videoElement.srcObject = stream;
            await this.videoElement.play();
        } catch (error: any) {
            Dialog.showError(error.message);
        }
    }

    stop(): void {
        try {
            if (this.detectionLoopId) {
                cancelAnimationFrame(this.detectionLoopId);
                this.detectionLoopId = null;
            }

            if (this.currentStream) {
                this.currentStream.getTracks().forEach(track => track.stop());
                this.currentStream = null;
            }

            if (this.videoElement) {
                this.videoElement.srcObject = null;
            }
        } catch (error: any) {
            Dialog.showError(error.message);
        }
    }

    async generateDatasetLoop(
        currentLetter: string,
        dataPerLabel: number,
        setDisplayText: React.Dispatch<React.SetStateAction<string>>,
        handLandmarker: HandLandmarker | undefined,
        canvasInstance: Canvas | null,
        datasetInstance: Dataset | null
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            let currentDataPerLabel = 0;

            const loop = () => {
                try {
                    if (!handLandmarker || !canvasInstance || !this.videoElement) {
                        throw new Error('Some ref not found');
                    }

                    const videoWidth = this.videoElement.videoWidth;
                    const videoHeight = this.videoElement.videoHeight;

                    if (videoWidth === 0 || videoHeight === 0) {
                        this.detectionLoopId = requestAnimationFrame(loop);
                        return;
                    }

                    const startTimeMs = performance.now();
                    const results = handLandmarker.detectForVideo(this.videoElement, startTimeMs);
                    canvasInstance.clear();

                    if (results.landmarks.length != 0) {
                        const landmarks = results.landmarks[0]; // get first hands
                        if (landmarks.every(lm => lm && lm.x != null && lm.y != null && lm.z != null)) {
                            canvasInstance.drawLandmark(landmarks);

                            const tempRow = [];
                            for (const landmark of landmarks) {
                                tempRow.push(landmark.x, landmark.y, landmark.z);
                            }

                            if (tempRow.length === 63) {
                                tempRow.push(currentLetter);
                                datasetInstance!.addDataToArray(tempRow);
                                ++currentDataPerLabel;
                                setDisplayText(`${currentLetter}: ${currentDataPerLabel} data`);
                            }
                        }

                    }

                    if (currentDataPerLabel < dataPerLabel) {
                        this.detectionLoopId = requestAnimationFrame(loop);
                    } else {
                        canvasInstance.clear();
                        resolve();
                    }
                } catch (error: any) {
                    Dialog.showError(error.message);
                    reject(error);
                }
            }

            loop();
        });
    }

    async predictionLoop({
        setDisplayText,
        handLandmarker,
        canvasInstance,
        mean,
        std,
        label,
        currentKeyModel,
    }: {
        setDisplayText: React.Dispatch<React.SetStateAction<string>>,
        handLandmarker: HandLandmarker | undefined,
        canvasInstance: Canvas | null,
        mean: tf.Tensor1D,
        std: tf.Tensor1D,
        label: string[],
        currentKeyModel: string,
    }): Promise<void> {
        const model = await Predictor.loadModel(currentKeyModel);

        return new Promise((_, reject) => {
            const loop = () => {
                try {
                    if (!handLandmarker || !canvasInstance || !this.videoElement) {
                        throw new Error('Some ref not found');
                    }

                    const videoWidth = this.videoElement.videoWidth;
                    const videoHeight = this.videoElement.videoHeight;

                    if (videoWidth === 0 || videoHeight === 0) {
                        this.detectionLoopId = requestAnimationFrame(loop);
                        return;
                    }

                    const startTimeMs = performance.now();
                    const results = handLandmarker.detectForVideo(this.videoElement, startTimeMs);
                    canvasInstance.clear();

                    if (results.landmarks.length != 0) {
                        const landmarks = results.landmarks[0]; // get first hands
                        canvasInstance.drawLandmark(landmarks);
                        const predictedLabel = Predictor.predict({
                            landmarks,
                            mean,
                            std,
                            label,
                            model
                        });
                        setDisplayText(predictedLabel);
                    }
                } catch (error: any) {
                    Dialog.showError(error.message);
                    reject(error);
                }
                this.detectionLoopId = requestAnimationFrame(loop);
            }
            loop();
        });
    }

}