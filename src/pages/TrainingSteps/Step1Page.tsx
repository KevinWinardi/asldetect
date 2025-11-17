import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import type { SweetAlertResult } from "sweetalert2";
import { Dialog } from "../../utils/Dialog";
import { Dataset } from "../../utils/Dataset";
import * as tf from '@tensorflow/tfjs';
import type React from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export function Step1Page({
    isStep1Valid,
    setIsStep1Valid,
    tensorflowfDatasetRef,
    totalData,
    setTotalData,
    previewData,
    setPreviewData,
}: {
    isStep1Valid: boolean
    setIsStep1Valid: React.Dispatch<React.SetStateAction<boolean>>
    tensorflowfDatasetRef: React.RefObject<tf.data.CSVDataset | null>,
    totalData: number,
    setTotalData: React.Dispatch<React.SetStateAction<number>>,
    previewData: string[][],
    setPreviewData: React.Dispatch<React.SetStateAction<string[][]>>
}) {
    const { t } = useLanguage();
    const [isUploading, setIsUploading] = useState(false);

    async function uploadDataset(e: ChangeEvent<HTMLInputElement>): Promise<void | SweetAlertResult<any>> {
        try {
            const target = e.target as HTMLInputElement;
            if (!target.files || target.files.length == 0 || target.files.length > 1) {
                return Dialog.showWarning(t.oneCsvFile);
            }

            const file = target.files[0];
            const dataset = new Dataset();

            setIsUploading(true);
            const isValid = await dataset.checkValidityDataset(file);
            if (isValid) {
                const urlObject = URL.createObjectURL(file);
                const data = dataset.loadDataset(urlObject);
                tensorflowfDatasetRef.current = data;

                const reader = new FileReader();
                reader.onload = function (e) {
                    const text = e.target?.result as string;
                    const rows = text.split(/\r?\n/);
                    const preview = rows.slice(0, 11).map(r => r.split(','));
                    setPreviewData(preview);

                    setTotalData(rows.length - 1); 
                }
                reader.readAsText(file);

                setIsStep1Valid(true);
                setIsUploading(false);
            }
        } catch (error: any) {
            setIsUploading(false);
            return Dialog.showError(error.message);
        }
    }

    return (
        <>
            <h2 className="font-bold text-2xl text-gray-700">1. {t.uploadDatasetFile}</h2>

            <section>
                <div className={`relative flex justify-center items-center w-full min-h-48 mt-4 border-2 border-dashed transition duration-500 
                ${isStep1Valid ? 'border-green-500' : 'border-gray-500'} rounded hover:border-green-500 hover:border-4 hover:bg-green-100`}>
                    <label htmlFor="dataset-input" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-full h-full flex flex-col justify-center items-center gap-4 
                    font-semibold text-gray-500 cursor-pointer transition-opacity hover:opacity-50">
                        <i className={`fa-solid ${isStep1Valid ? 'fa-rotate' : 'fa-upload'} text-4xl`}></i>
                        {isStep1Valid ? `${t.dataSuccessLoad} ${totalData.toLocaleString('id-ID') ?? ''}✅` : t.uploadDatasetFile}
                    </label>
                    <input
                        onChange={(e) => uploadDataset(e)}
                        id="dataset-input"
                        type="file"
                        accept=".csv"
                        className="hidden" />
                </div>
                <span className="mt-2 text-sm italic opacity-75">
                    {t.dontHaveDataset} <Link to='/dataset' className="font-semibold text-blue-500 underline transition-opacity hover:opacity-75">{t.clickHere}</Link>
                </span>

                <div className={`${isUploading ? 'block' : 'hidden'} mt-2 mx-auto w-max p-2 border rounded-md shadow-lg`}>
                    <div className="flex justify-center items-center'">
                        <div className="w-[30px] aspect-square rounded-full border-4 border-blue-500 border-r-gray-500 animate-spin"></div>
                        <span className="ml-2 line-clamp-1 text-ellipsis">{t.uploadDataset}</span>
                    </div>
                </div>
            </section>

            {previewData.length > 0 && (
                <section className="mt-4 p-2 rounded">
                    <h3 className="font-semibold text-xl text-gray-700">Preview Data</h3>

                    <div className="overflow-auto mt-2">
                        <table className="table-auto w-full border-collapse border border-gray-300 rounded">
                            <tbody>
                                {previewData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex === 0 ? 'font-bold text-white text-center bg-gray-700' : ''}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className={`border px-2 py-1 ${cellIndex === row.length - 1 && 'text-center'}`}>
                                                {rowIndex !== 0 && cellIndex !== row.length - 1
                                                    ? parseFloat(cell).toFixed(5) + '...'
                                                    : cell
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

        </>
    );
}