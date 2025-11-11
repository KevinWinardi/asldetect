import { useEffect, useRef, useState } from "react";
import { Camera } from "../utils/Camera";
import { Canvas } from "../utils/Canvas";
import { Mediapipe } from "../utils/Mediapipe";
import { Dialog } from "../utils/Dialog";
import { BaseModel } from "../utils/BaseModel";

export function DetectionPage() {
    const [isCameraRunning, setIsCameraRunnning] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const [currentKeyModel, setCurrentKeyModel] = useState(localStorage.getItem('favorite_model') ?? 'model_default');
    const [modelOption, setModelOption] = useState<{
        key: string,
        name: string,
    }[] | null>(null);
    const [cameraOption, setCameraOption] = useState<{
        value: string,
        text: string,
    }[] | null>(null);

    const cameraInstanceRef = useRef<Camera | null>(null);
    const canvasInstanceRef = useRef<Canvas | null>(null);
    const mediapipeInstanceRef = useRef<Mediapipe | null>(null);

    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!videoElementRef.current || !canvasElementRef.current) {
            Dialog.showError('Some ref not found');
            return;
        }

        const modelOptionList = BaseModel.getAllModel('model_');
        if (modelOptionList === false) {
            return;
        }
        setModelOption(modelOptionList);

        cameraInstanceRef.current = new Camera(videoElementRef.current);

        canvasInstanceRef.current = new Canvas(
            canvasElementRef.current,
            canvasElementRef.current.getContext('2d'),
        );

        mediapipeInstanceRef.current = new Mediapipe();

        return () => {
            cameraInstanceRef.current?.stop();

            cameraInstanceRef.current = null;
            canvasInstanceRef.current = null;
            mediapipeInstanceRef.current = null;
        }
    }, [])

    async function cameraButtonHandler() {
        if (
            // !cameraSelectElementRef.current ||
            !videoElementRef.current ||
            !canvasInstanceRef.current ||
            !mediapipeInstanceRef.current ||
            !cameraInstanceRef.current ||
            !canvasInstanceRef.current
        ) {
            return Dialog.showError('Some ref not found');
        }

        // const cameraSelectElement = cameraSelectElementRef.current;
        const cameraInstance = cameraInstanceRef.current;
        const canvasInstance = canvasInstanceRef.current;
        const mediapipeInstance = mediapipeInstanceRef.current;

        if (!isCameraRunning) {
            setIsCameraRunnning(true);

            setDisplayText('');

            const permission = await cameraInstance.requestPermission();
            if (permission) {
                const cameraOptionList = await cameraInstance.createOptions();
                if (cameraOptionList === false) {
                    return;
                }
                setCameraOption(cameraOptionList);

                cameraInstance.start();

                const handLandmarker = await mediapipeInstance.createHandLandmarker();
                const { mean, std, label } = await BaseModel.loadInformationModel(currentKeyModel);
                await cameraInstance.predictionLoop({
                    setDisplayText,
                    handLandmarker,
                    canvasInstance,
                    mean,
                    std,
                    label,
                    currentKeyModel,
                });
            }
        } else {
            const confirmation = await Dialog.showConfirmation('Are you sure want to stop camera stream?');

            if (confirmation.isConfirmed) {
                setIsCameraRunnning(false);
                setDisplayText('');

                cameraInstance.stop();
                canvasInstance.clear();
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
                    <div className="mb-4 p-4 flex flex-col gap-4 w-full bg-white border rounded shadow-2xl">
                        <label htmlFor="model-select" className="font-semibold text-gray-700">Select model</label>
                        <select
                            value={currentKeyModel}
                            id="model-select"
                            disabled={isCameraRunning}
                            onChange={(e) => setCurrentKeyModel(e.target.value)}
                            name="model-select"
                            className={`w-full mb-4 p-2 border rounded disabled:opacity-75 disabled:cursor-not-allowed`}>
                            <option value="default">Default</option>
                            {
                                modelOption && (
                                    modelOption.map(model => (
                                        <option key={model.key} value={model.key}>{model.name}</option>
                                    ))
                                )
                            }
                        </select>
                    </div>

                    <div className="relative w-full h-max">
                        <video
                            ref={videoElementRef}
                            onLoadedData={e => canvasInstanceRef.current?.setWidthHeight(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
                            className="border rounded block w-full min-h-96 bg-white">
                        </video>
                        <canvas ref={canvasElementRef} className="absolute top-0 left-0 block w-full min-h-96"></canvas>
                    </div>

                    <select
                        onChange={e => cameraInstanceRef.current!.change(e.target.value)}
                        className={`w-full mt-4 p-2 border rounded ${isCameraRunning ? 'block' : 'hidden'}`}>
                        {
                            cameraOption && (
                                cameraOption.map(camera => (
                                    <option key={camera.value} value={camera.value}>{camera.text}</option>
                                ))
                            )
                        }
                    </select>

                    <div className="mt-4 text-4xl font-bold">{displayText}</div>

                    <button
                        onClick={cameraButtonHandler}
                        className={` 
                            mt-4 px-4 py-2 font-bold text-white ${isCameraRunning ? 'bg-red-500' : 'bg-blue-500'} border-b-4 border-black
                            rounded cursor-pointer transition hover:translate-y-0.5 hover:border-transparent hover:opacity-75
                        `}>
                        <i className={`fa-solid ${isCameraRunning ? 'fa-stop' : 'fa-camera'}`}></i> {isCameraRunning ? 'Stop Camera' : 'Start Camera'}
                    </button>

                    <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-sm">
                        <div id="output-text" className="text-4xl font-bold"></div>
                    </div>
                </section>
            </div>
        </div >
    );
}