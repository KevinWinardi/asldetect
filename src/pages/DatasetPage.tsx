import { Camera } from "../utils/Camera";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "../utils/Dialog";
import { Canvas } from "../utils/Canvas";
import { Mediapipe } from "../utils/Mediapipe";
import { Dataset } from "../utils/Dataset";

export function DatasetPage() {
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const cameraSelectElementRef = useRef<HTMLSelectElement | null>(null);
    const nextLetterButtonElementRef = useRef<HTMLButtonElement | null>(null);
    const downloadButtonElementRef = useRef<HTMLButtonElement | null>(null);
    const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const dataPerLabelInputElementRef = useRef<HTMLInputElement | null>(null);

    const cameraInstanceRef = useRef<Camera | null>(null);
    const canvasInstanceRef = useRef<Canvas | null>(null);
    const mediapipeInstanceRef = useRef<Mediapipe | null>(null);
    const datasetInstanceRef = useRef<Dataset | null>(null);

    const nextLetterHandlerRef = useRef<(() => void) | null>(null);
    const cameraChangeHandlerRef = useRef<((e: Event) => void) | null>(null);
    const videoLoaddedHandlerRef = useRef<(() => void) | null>(null);

    const [isCameraRunning, setIsCameraRunnning] = useState(false);
    const [dataPerLabelInput, setDataPerLabelInput] = useState<string | number>('');
    const [displayText, setDisplayText] = useState('');

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

        datasetInstanceRef.current = new Dataset();

        return () => {
            canvasInstanceRef.current = null;
            mediapipeInstanceRef.current = null;
            datasetInstanceRef.current = null

            if (nextLetterHandlerRef.current && nextLetterButtonElementRef.current) {
                nextLetterButtonElementRef.current.removeEventListener('click', nextLetterHandlerRef.current);
            }
            if (videoLoaddedHandlerRef.current && videoElementRef.current) {
                videoElementRef.current.removeEventListener('loadeddata', videoLoaddedHandlerRef.current);
            }
            if (cameraChangeHandlerRef.current && cameraSelectElementRef.current) {
                cameraSelectElementRef.current.removeEventListener('click', cameraChangeHandlerRef.current);
            }
        };
    }, []);

    function downloadButtonHandler() {
        if (!datasetInstanceRef.current) {
            return Dialog.showError('Dataset instance not found');
        }
        datasetInstanceRef.current.downloadDataset();
    }

    async function cameraButtonHandler() {
        if (
            !cameraSelectElementRef.current ||
            !videoElementRef.current ||
            !dataPerLabelInputElementRef.current ||
            !nextLetterButtonElementRef.current ||
            !downloadButtonElementRef.current ||
            !canvasInstanceRef.current ||
            !mediapipeInstanceRef.current ||
            !cameraInstanceRef.current ||
            !datasetInstanceRef.current ||
            !canvasInstanceRef.current
        ) {
            return Dialog.showError('Some element not found');
        }

        const dataPerLabelInputElement = dataPerLabelInputElementRef.current;
        const nextLetterButtonElement = nextLetterButtonElementRef.current;
        const cameraSelectElement = cameraSelectElementRef.current;
        const downloadButtonElement = downloadButtonElementRef.current;

        const cameraInstance = cameraInstanceRef.current;
        const canvasInstance = canvasInstanceRef.current;
        const mediapipeInstance = mediapipeInstanceRef.current;
        const datasetInstance = datasetInstanceRef.current;

        const parsedValue = Number(dataPerLabelInput);
        if (
            isNaN(parsedValue) ||
            !Number.isInteger(parsedValue) ||
            parsedValue < 10
        ) {
            dataPerLabelInputElementRef.current.focus();
            return Dialog.showWarning('Data per label must be a positive integer with minimum 10');
        }

        if (!isCameraRunning) {
            setIsCameraRunnning(true);

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

                let currentLetterIndex = 0;
                const letters = [
                    'A', 'B', 'C', 'D', 'E',
                    'F', 'G', 'H', 'I', 'J',
                    'K', 'L', 'M', 'N', 'O',
                    'P', 'Q', 'R', 'S', 'T',
                    'U', 'V', 'W', 'X', 'Y', 'Z'
                ]

                async function callGenerateDatasetLoop() {
                    nextLetterButtonElement.setAttribute('disabled', '');

                    await cameraInstance.generateDatasetLoop(
                        letters[currentLetterIndex],
                        parseInt(dataPerLabelInputElement.value.trim()),
                        setDisplayText,
                        handLandmarker,
                        canvasInstance,
                        datasetInstance,
                    );

                    if (currentLetterIndex >= letters.length - 1) {
                        setDisplayText('Finish generate dataset ✅');
                        nextLetterButtonElement.classList.add('hidden');
                        downloadButtonElement.classList.remove('hidden');
                        return;
                    }
                    nextLetterButtonElement.removeAttribute('disabled');
                };

                nextLetterButtonElement.classList.remove('hidden');
                setDisplayText(`${letters[currentLetterIndex]}: 0 data`);
                await callGenerateDatasetLoop();

                // Next letter event handler
                if (nextLetterHandlerRef.current) {
                    nextLetterButtonElement.removeEventListener('click', nextLetterHandlerRef.current);
                }
                const nextLetterHandlerTemp = async () => {
                    ++currentLetterIndex;
                    setDisplayText(`${letters[currentLetterIndex]}: 0 data`);
                    await callGenerateDatasetLoop();
                }
                nextLetterHandlerRef.current = nextLetterHandlerTemp;
                nextLetterButtonElement.addEventListener('click', nextLetterHandlerRef.current);
            }

        } else {
            const confirmation = await Dialog.showConfirmation('Are you sure want to stop camera stream?');

            if (confirmation.isConfirmed) {
                setIsCameraRunnning(false);
                setDisplayText('');

                cameraInstance.stop();
                canvasInstance.clear();

                nextLetterButtonElement.classList.add('hidden');
                downloadButtonElement.classList.add('hidden');

                cameraSelectElement.innerHTML = '';
                cameraSelectElement.classList.add('hidden');
            }
        }
    }

    return (
        <div className="px-4 sm:px-8 pt-24 pb-8">
            <h1 className="font-bold text-4xl text-center text-yellow-900">Generate Dataset</h1>

            <div className="mt-8 mx-auto p-4 flex flex-col gap-4 w-full max-w-md bg-white border rounded shadow-2xl">
                <label htmlFor="data-per-label">Total data per label: <span className="text-red-500">*</span></label>
                <div className="flex flex-col gap-2">
                    <input
                        disabled={isCameraRunning} ref={dataPerLabelInputElementRef}
                        value={dataPerLabelInput}
                        onChange={(e) => setDataPerLabelInput(parseInt(e.target.value))}
                        type="number" step="1" id="data-per-label" placeholder="500"
                        className="border rounded p-2 outline-none transition  focus:border-2 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                    <span id="data-per-label-error" className="text-red-500"></span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <section>
                    <ul
                        className="mt-8 p-4 h-min flex flex-col gap-4 list-decimal list-inside bg-amber-100 border-l-amber-700 border-l-[16px] sm:border-l-[32px] shadow-lg rounded-3xl">
                        <li>Input amount data per label on top input</li>
                        <li>Press "Start Camera" button</li>
                        <li>Enable camera permission on browser</li>
                        <li>Show your hand with ASL gesture to get the prediction</li>
                        <li>Wait until all letters finish recorded and you can download the csv file</li>
                        <img src="asl_dictionary.png" alt="ASL Dictionary" className="w-full max-w-sm block mx-auto" />
                    </ul>
                </section>

                <section className="flex flex-col items-center mt-8">
                    <div className="relative w-full h-max">
                        <video ref={videoElementRef} className="border rounded block w-full min-h-96 bg-white"></video>
                        <canvas ref={canvasElementRef} className="absolute top-0 left-0 block w-full min-h-96"></canvas>
                    </div>

                    <select ref={cameraSelectElementRef} name="camera-select"
                        className="w-full mt-4 p-2 border rounded hidden"></select>

                    <div className="mt-4 text-4xl font-bold">{displayText}</div>

                    <button
                        ref={nextLetterButtonElementRef}
                        className="hidden w-max mt-4 p-2 font-bold text-white bg-green-500 not-disabled:border-b-4 not-disabled:border-black 
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:text-green-500 disabled:bg-white disabled:border disabled:border-green-500"
                    >
                        Next Letter <i className="fa-solid fa-arrow-right"></i>
                    </button>

                    <button
                        ref={downloadButtonElementRef}
                        onClick={downloadButtonHandler}
                        className={` 
                            hidden mt-4 px-4 py-2 font-bold text-white bg-orange-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}
                    >
                        <i className="fa-solid fa-download"></i> Download Dataset (.csv)
                    </button>

                    <button
                        onClick={cameraButtonHandler}
                        className={` 
                            mt-4 px-4 py-2 font-bold text-white ${isCameraRunning ? 'bg-red-500' : 'bg-blue-500'} border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        {isCameraRunning ? 'Stop Camera' : 'Start Camera'} <i className={`fa-solid ${isCameraRunning ? 'fa-stop' : 'fa-camera'}`}></i>
                    </button>
                </section>
            </div>
        </div>
    );
}