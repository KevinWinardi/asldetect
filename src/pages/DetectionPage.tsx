export function DetectionPage() {
    return (
        <>
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
                        <video className="border rounded block w-full min-h-96 bg-white"></video>
                        <canvas className="absolute top-0 left-0 block w-full min-h-96"></canvas>
                    </div>

                    <select name="camera-select"
                        className="w-full mt-4 p-2 border rounded hidden">
                    </select>

                    <button
                        className={` 
                            mt-4 px-4 py-2 font-bold text-white bg-blue-500 border-b-4 border-black
                            rounded cursor-pointer transition not-disabled:hover:translate-y-0.5 not-disabled:hover:border-transparent not-disabled:hover:opacity-75
                            disabled:cursor-not-allowed disabled:opacity-50
                        `}>
                        Start camera <i className="fa-solid fa-camera"></i>
                    </button>

                    <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-sm">
                        <div id="output-text" className="text-4xl font-bold"></div>
                    </div>
                </section>
            </div>
        </>
    );
}