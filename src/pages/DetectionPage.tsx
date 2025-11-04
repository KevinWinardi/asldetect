import { useEffect, useRef, useState } from "react";
import { Camera } from "../utils/Camera";
import { Canvas } from "../utils/Canvas";
import { Mediapipe } from "../utils/Mediapipe";
import { Dialog } from "../utils/Dialog";
import { BaseModel } from "../utils/BaseModel";

export function DetectionPage() {
    const [isCameraRunning, setIsCameraRunnning] = useState(false);
    const [displayText, setDisplayText] = useState('');

    const cameraInstanceRef = useRef<Camera | null>(null);
    const canvasInstanceRef = useRef<Canvas | null>(null);
    const mediapipeInstanceRef = useRef<Mediapipe | null>(null);

    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const cameraSelectElementRef = useRef<HTMLSelectElement | null>(null);
    const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

    const cameraChangeHandlerRef = useRef<((e: Event) => void) | null>(null);
    const videoLoaddedHandlerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!videoElementRef.current || !cameraSelectElementRef.current || !canvasElementRef.current) {
            Dialog.showError('Some ref not found');
            return;
        }

        cameraInstanceRef.current = new Camera(
            cameraSelectElementRef.current,
            videoElementRef.current,
        );

        canvasInstanceRef.current = new Canvas(
            canvasElementRef.current,
            canvasElementRef.current.getContext('2d'),
        );

        mediapipeInstanceRef.current = new Mediapipe();

        return () => {
            cameraInstanceRef.current = null;
            canvasInstanceRef.current = null;
            mediapipeInstanceRef.current = null;

            if (videoLoaddedHandlerRef.current && videoElementRef.current) {
                videoElementRef.current.removeEventListener('loadeddata', videoLoaddedHandlerRef.current);
            }
            if (cameraChangeHandlerRef.current && cameraSelectElementRef.current) {
                cameraSelectElementRef.current.removeEventListener('click', cameraChangeHandlerRef.current);
            }
        }
    }, [])

    async function cameraButtonHandler() {
        if (
            !cameraSelectElementRef.current ||
            !videoElementRef.current ||
            !canvasInstanceRef.current ||
            !mediapipeInstanceRef.current ||
            !cameraInstanceRef.current ||
            !canvasInstanceRef.current
        ) {
            return Dialog.showError('Some ref not found');
        }

        const cameraSelectElement = cameraSelectElementRef.current;
        const cameraInstance = cameraInstanceRef.current;
        const canvasInstance = canvasInstanceRef.current;
        const mediapipeInstance = mediapipeInstanceRef.current;

        if (!isCameraRunning) {
            setIsCameraRunnning(true);

            setDisplayText('');

            const permission = await cameraInstance.requestPermission();
            if (permission) {
                cameraInstance.createOptions();
                cameraInstance.start();

                const handLandmarker = await mediapipeInstance.createHandLandmarker();

                // Video loadded event handler
                if (videoLoaddedHandlerRef.current) {
                    videoElementRef.current.removeEventListener('loadeddata', videoLoaddedHandlerRef.current);
                }
                const videoLoaddedHandlerTemp = () => {
                    canvasInstanceRef.current?.setWidthHeight(videoElementRef.current!.videoWidth, videoElementRef.current!.videoHeight);
                }
                videoLoaddedHandlerRef.current = videoLoaddedHandlerTemp;
                videoElementRef.current.addEventListener('loadeddata', videoLoaddedHandlerRef.current);

                // Camera change event handler
                if (cameraChangeHandlerRef.current) {
                    cameraSelectElement.removeEventListener('change', cameraChangeHandlerRef.current)
                }
                const cameraChangeHandlerTemp = (e: Event) => {
                    const target = e.target as HTMLSelectElement;
                    cameraInstanceRef.current!.change(target.value);
                }
                cameraChangeHandlerRef.current = cameraChangeHandlerTemp;
                cameraSelectElement.addEventListener('change', cameraChangeHandlerRef.current);

                const aslMetadata = await BaseModel.loadASLMetadata('model');
                await cameraInstance.predictionLoop(setDisplayText, handLandmarker, canvasInstance, aslMetadata);
            }
        } else {
            const confirmation = await Dialog.showConfirmation('Are you sure want to stop camera stream?');

            if (confirmation.isConfirmed) {
                setIsCameraRunnning(false);
                setDisplayText('');
                
                cameraInstance.stop();
                canvasInstance.clear();

                cameraSelectElement.innerHTML = '';
                cameraSelectElement.classList.add('hidden');
            }
        }
    }

    return (
        <div className="px-4 sm:px-8 pt-24 pb-8">
            <h1 className="font-bold text-4xl text-center text-yellow-900">Detection</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <section>
                    <ul
                        className="mt-8 p-4 h-min flex flex-col gap-4 list-decimal list-inside bg-amber-100 border-l-amber-700 border-l-[16px] sm:border-l-[32px] shadow-lg rounded-3xl">
                        <li>Press "Start Camera" button</li>
                        <li>Enable camera permission on browser</li>
                        <li>Show your hand with ASL gesture to get the prediction</li>
                        <img src="asl_dictionary.png" alt="ASL Dictionary" className="w-full max-w-sm block mx-auto" />
                    </ul>
                </section>

                <section className="flex flex-col items-center mt-8">
                    <div className="relative w-full h-max">
                        <video ref={videoElementRef} className="border rounded block w-full min-h-96 bg-white"></video>
                        <canvas ref={canvasElementRef} className="absolute top-0 left-0 block w-full min-h-96"></canvas>
                    </div>

                    <select ref={cameraSelectElementRef} name="camera-select"
                        className="w-full mt-4 p-2 border rounded hidden">
                    </select>

                    <div className="mt-4 text-4xl font-bold">{displayText}</div>

                    <button
                        onClick={cameraButtonHandler}
                        className={` 
                            mt-4 px-4 py-2 font-bold text-white ${isCameraRunning ? 'bg-red-500' : 'bg-blue-500'} border-b-4 border-black
                            rounded cursor-pointer transition hover:translate-y-0.5 hover:border-transparent hover:opacity-75
                        `}>
                        {isCameraRunning ? 'Stop Camera' : 'Start Camera'} <i className={`fa-solid ${isCameraRunning ? 'fa-stop' : 'fa-camera'}`}></i>
                    </button>

                    <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-sm">
                        <div id="output-text" className="text-4xl font-bold"></div>
                    </div>
                </section>
            </div>
        </div>
    );
}