import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import type { SweetAlertResult } from "sweetalert2";
import { Dialog } from "../../utils/Dialog";
import { Dataset } from "../../utils/Dataset";
import * as tf from '@tensorflow/tfjs';
import type React from "react";

export function Step1Page({
    isStep1Valid,
    setIsStep1Valid,
    tensorflowfDatasetRef,
    datasetInputElementRef,
}: {
    isStep1Valid: boolean
    setIsStep1Valid: React.Dispatch<React.SetStateAction<boolean>>
    tensorflowfDatasetRef: React.RefObject<tf.data.CSVDataset | null>
    datasetInputElementRef: React.RefObject<HTMLInputElement | null>
}) {
    async function uploadDataset(e: ChangeEvent<HTMLInputElement>): Promise<void | SweetAlertResult<any>> {
        try {
            const target = e.target as HTMLInputElement;
            if (!target.files || target.files.length == 0) {
                return Dialog.showWarning('Please upload 1 file csv');
            }
            if (target.files.length > 1) {
                return Dialog.showWarning('Input only accept 1 file');
            }

            const file = target.files[0];
            const dataset = new Dataset();

            Dialog.showLoading();
            const isValid = await dataset.checkValidityDataset(file);
            if (isValid) {
                const urlObject = URL.createObjectURL(file);
                const data = dataset.loadDataset(urlObject);
                tensorflowfDatasetRef.current = data;

                setIsStep1Valid(true);
                Dialog.hideLoading();
            }
        } catch (error: any) {
            Dialog.hideLoading();
            return Dialog.showError(error.message);
        }
    }

    return (
        <>
            <h2 className="font-bold text-2xl text-left text-gray-700">1. Upload your dataset file</h2>

            <div className={`relative flex justify-center items-center w-full min-h-48 mt-4 border-2 border-dashed transition duration-500 ${isStep1Valid ? 'border-green-500' : 'border-gray-500'} rounded hover:border-green-500 hover:border-4 hover:bg-green-100`}>
                <label htmlFor="dataset-input" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-full h-full flex flex-col justify-center items-center gap-4 
                    font-semibold text-gray-500 cursor-pointer transition-opacity hover:opacity-50">
                    <i className={`fa-solid ${isStep1Valid ? 'fa-rotate': 'fa-upload'} text-4xl`}></i>
                    {isStep1Valid ? 'Data successfully loadded ✅' : 'Upload your (.csv) file'}
                </label>
                <input
                    onChange={(e) => uploadDataset(e)}
                    ref={datasetInputElementRef}
                    id="dataset-input"
                    type="file"
                    accept=".csv"
                    className="hidden" />
            </div>

            <div className="mt-2 text-sm italic opacity-75">
                Don't have dataset? <Link to='/dataset' className="font-semibold text-blue-500 underline transition-opacity hover:opacity-75">Click here</Link>
            </div>
        </>
    );
}