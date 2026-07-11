import { HandLandmarker, DrawingUtils, type NormalizedLandmark } from "@mediapipe/tasks-vision";

export class Canvas {
    canvasElement: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;

    constructor(canvasElement: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D | null) {
        this.canvasElement = canvasElement;
        this.ctx = ctx;
    }

    setWidthHeight(videoWidth: number, videoHeight: number) {
        try {
            if (!this.canvasElement) {
                throw new Error("Canvas element not found");
            }
            this.canvasElement.width = videoWidth;
            this.canvasElement.height = videoHeight;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    drawLandmark(handLandmarker: NormalizedLandmark[]) {
        try {
            if (!this.ctx) {
                throw new Error("ctx not found");
            }
            const drawingUtils = new DrawingUtils(this.ctx);

            drawingUtils.drawConnectors(handLandmarker, HandLandmarker.HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5,
            });

            drawingUtils.drawLandmarks(handLandmarker, {
                color: "#FF0000",
                lineWidth: 2,
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    clear() {
        try {
            if (!this.canvasElement || !this.ctx) {
                throw new Error("Some ref not found");
            }

            this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
