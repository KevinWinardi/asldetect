import { drawLandmarks, drawConnectors } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { Dialog } from "./Dialog";
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export class Canvas {
    canvasElement: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;

    constructor(canvasElement: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D | null) {
        this.canvasElement = canvasElement;
        this.ctx = ctx
    }

    setWidthHeight(videoWidth: number, videoHeight: number) {
        try {
            if (!this.canvasElement) {
                throw new Error('Canvas element not found');
            }
            this.canvasElement.width = videoWidth;
            this.canvasElement.height = videoHeight;
        } catch (error: any) {
            Dialog.showError(error.message);
        }
    }

    drawLandmark(handLandmarker: NormalizedLandmark[]) {
        try {
            if (!this.ctx) {
                throw new Error('ctx not found');
            }

            drawConnectors(this.ctx, handLandmarker, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5
            });

            drawLandmarks(this.ctx, handLandmarker, {
                color: "#FF0000",
                lineWidth: 2
            });
        } catch (error: any) {
            Dialog.showError(error.message);
        }
    }

    clear() {
        try {
            if (!this.canvasElement || !this.ctx) {
                throw new Error('Some element not found');
            }

            this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        } catch (error: any) {
            Dialog.showError(error.message);
        }
    }
}