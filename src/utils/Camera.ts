import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { Dialog } from "./Dialog";
import type { Canvas } from "./Canvas";
import type { Dataset } from "./Dataset";
import * as tf from '@tensorflow/tfjs';
import { Model } from "./Model";

export class Camera {
    cameraSelectElement: HTMLSelectElement | null;
    videoElement: HTMLVideoElement | null;
    currentStream: MediaStream | null;
    detectionLoopId: number | null;

    constructor(cameraSelectElement: HTMLSelectElement | null, videoElement: HTMLVideoElement | null) {
        this.cameraSelectElement = cameraSelectElement;
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

    async createOptions(): Promise<void> {
        try {
            if (!this.cameraSelectElement) {
                throw new Error('Camera select not found');
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(device => device.kind === 'videoinput');

            videoInputs.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                this.cameraSelectElement!.appendChild(option);
            });

            this.cameraSelectElement.classList.remove('hidden');
        } catch (error: any) {
            Dialog.showError(error.message);
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

    async stop(): Promise<void> {
        try {
            if (!this.currentStream || !this.detectionLoopId || !this.videoElement) {
                console.log(3)
                throw new Error('Some element stream not found')
            };

            cancelAnimationFrame(this.detectionLoopId);

            this.videoElement.srcObject = null;
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;

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
        displayTextElement: HTMLDivElement | null,
        handLandmarker: HandLandmarker | undefined,
        canvasInstance: Canvas | null,
        datasetInstance: Dataset | null
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            let currentDataPerLabel = 0;

            const loop = () => {
                try {
                    if (!handLandmarker || !canvasInstance || !this.videoElement) {
                        throw new Error('Some element not found');
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

                    const tempRow = [];
                    if (results.landmarks.length != 0) {
                        for (const landmarks of results.landmarks) {
                            canvasInstance.drawLandmark(landmarks);
                            for (const landmark of landmarks) {
                                tempRow.push(landmark.x, landmark.y, landmark.z);
                            }
                        }
                        tempRow.push(currentLetter);
                        datasetInstance!.addDataToArray(tempRow);
                        ++currentDataPerLabel;

                        displayTextElement!.textContent = `${currentLetter}: ${currentDataPerLabel} data`;
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

    async predictionLoop(
        displayTextElement: HTMLDivElement | null,
        handLandmarker: HandLandmarker | undefined,
        canvasInstance: Canvas | null,
        aslMetadata: {
            mean: tf.Tensor1D,
            std: tf.Tensor1D,
            labels: [],
        },
    ): Promise<void> {
        const loadModel = await tf.loadLayersModel('./asl_model.json');
        return new Promise((_, reject) => {
            const loop = () => {
                try {
                    if (!handLandmarker || !canvasInstance || !this.videoElement) {
                        throw new Error('Some element not found');
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
                        for (const landmarks of results.landmarks) {
                            canvasInstance.drawLandmark(landmarks);
                            const predictedLabel = Model.prediction(landmarks, aslMetadata, loadModel);
                            displayTextElement!.textContent = `${predictedLabel}`;
                        }
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