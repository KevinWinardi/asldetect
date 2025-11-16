import { useEffect, useRef, useState } from "react";
import { Camera } from "../utils/Camera";
import { Canvas } from "../utils/Canvas";
import { Mediapipe } from "../utils/Mediapipe";
import { Dialog } from "../utils/Dialog";
import { BaseModel } from "../utils/BaseModel";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Predictor } from "../utils/Predictor";

export function DetectionPage() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraRunning, setIsCameraRunnning] = useState(false);
    const [predictionOutput, setPredictionOutput] = useState('');
    const [confidencePrediction, setConfidencePrediction] = useState(0);
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
            Dialog.showError(t.refNotFound);
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
        try {
            if (
                !videoElementRef.current ||
                !canvasInstanceRef.current ||
                !mediapipeInstanceRef.current ||
                !cameraInstanceRef.current ||
                !canvasInstanceRef.current
            ) {
                return Dialog.showError(t.refNotFound);
            }

            const cameraInstance = cameraInstanceRef.current;
            const canvasInstance = canvasInstanceRef.current;
            const mediapipeInstance = mediapipeInstanceRef.current;

            if (!isCameraRunning) {
                setIsCameraRunnning(true);

                setConfidencePrediction(0);
                setPredictionOutput('');

                const permission = await cameraInstance.requestPermission();
                if (permission) {
                    setIsLoading(true);
                    const cameraOptionList = await cameraInstance.createOptions();
                    if (cameraOptionList === false) {
                        return;
                    }
                    setCameraOption(cameraOptionList);

                    cameraInstance.start();

                    const handLandmarker = await mediapipeInstance.createHandLandmarker();
                    const { mean, std, label } = await BaseModel.loadInformationModel(currentKeyModel);
                    const model = await Predictor.loadModel(currentKeyModel);
                    setIsLoading(false);
                    await cameraInstance.predictionLoop({
                        setPredictionOutput,
                        handLandmarker,
                        setConfidencePrediction,
                        canvasInstance,
                        mean,
                        std,
                        label,
                        model,
                    });
                }
            } else {
                const confirmation = await Dialog.showConfirmation(t.confirmStopCamera);

                if (confirmation.isConfirmed) {
                    setIsCameraRunnning(false);
                    setConfidencePrediction(0);
                    setPredictionOutput('');

                    cameraInstance.stop();
                    canvasInstance.clear();
                }
            }
        } catch (error: any) {
            Dialog.showError(error.message);
            setIsCameraRunnning(false);
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-8">
            <h1 className="font-bold text-4xl text-center text-orange-500">{t.detection}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <section>
                    <div
                        className="mt-8 p-4 bg-amber-100 border-l-amber-700 border-l-[16px] sm:border-l-[32px] shadow-lg rounded-3xl">
                        <ul className="flex flex-col gap-4 list-decimal list-inside">
                            <li>{t.pressStartCamera}</li>
                            <li>{t.enableCameraPermission}</li>
                            <li>{t.showHand}</li>
                            <div className="flex flex-col justify-center items-center mt-4">
                                <img src="./images/asl_dictionary.jpg" alt="ASL Dictionary" className="w-full max-w-sm rounded-lg" />
                                <a className="text-sm text-blue-500 underline underline-offset-4" href="https://www.freepik.com/free-vector/sign-language-alphabet-hand-drawn-style_2563506.htm#fromView=keyword&page=1&position=0&uuid=81de6c25-ccc4-48e4-a7f3-134b7220dbad&query=American+sign+language+alphabet">Image by freepik</a>
                            </div>
                        </ul>
                    </div>
                </section>

                <section className="flex flex-col items-center mt-8">
                    <div className="mb-4 p-4 w-full bg-white border rounded shadow-2xl">
                        <label htmlFor="model-select" className="block mb-4 font-semibold text-gray-700">{t.select} model</label>
                        <select
                            value={currentKeyModel}
                            id="model-select"
                            disabled={isCameraRunning}
                            onChange={(e) => setCurrentKeyModel(e.target.value)}
                            name="model-select"
                            className={`w-full p-2 border rounded disabled:opacity-75 disabled:cursor-not-allowed`}>
                            <option value="model_default">Default</option>
                            {
                                modelOption && (
                                    modelOption.map(model => (
                                        <option key={model.key} value={model.key}>{model.name}</option>
                                    ))
                                )
                            }
                        </select>
                        <span className="mt-2 text-sm italic opacity-75">
                            {t.createModelCta} <Link to='/training' className="font-semibold text-blue-500 underline transition-opacity hover:opacity-75">{t.clickHere}</Link>
                        </span>
                    </div>

                    <div className="relative w-full h-max">
                        <video
                            ref={videoElementRef}
                            onLoadedData={e => canvasInstanceRef.current?.setWidthHeight(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
                            className="border rounded block w-full min-h-96 bg-white">
                        </video>
                        <canvas ref={canvasElementRef} className="absolute top-0 left-0 block w-full min-h-96"></canvas>

                        <div className={`${isLoading ? 'flex' : 'hidden'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30
                        w-full h-full flex-col justify-center items-center bg-black/50`}>
                            <div className="w-24 h-24 border-8 border-blue-500 border-t-white rounded-full animate-spin">
                            </div>
                            <p className="mt-4 text-lg text-white">Loading...</p>
                        </div >
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

                    <div className={`${isCameraRunning ? 'block' : 'hidden'} mt-4 text-4xl font-bold`}>{predictionOutput}</div>
                    <div className={`${isCameraRunning ? 'block' : 'hidden'} mt-4 text-sm font-semibold text-gray-600`}>{t.confidence}: {(confidencePrediction * 100).toFixed(1) + '%'}</div>

                    <button
                        onClick={cameraButtonHandler}
                        className={` 
                            mt-4 px-4 py-2 font-bold text-white ${isCameraRunning ? 'bg-red-500' : 'bg-blue-500'} border-b-4 border-black
                            rounded cursor-pointer transition hover:translate-y-0.5 hover:border-transparent hover:opacity-75
                        `}>
                        <i className={`fa-solid ${isCameraRunning ? 'fa-stop' : 'fa-camera'}`}></i> {isCameraRunning ? t.stopCamera : t.startCamera}
                    </button>

                    <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-sm">
                        <div id="output-text" className="text-4xl font-bold"></div>
                    </div>
                </section>
            </div >
        </div >
    );
}