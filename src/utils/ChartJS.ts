import { Chart } from "chart.js/auto";
import type { SplitDataType } from "../types/splitDataType";
import type { EvaluationTrainValType } from "../types/evaluationTrainValType";

export class ChartJS {
    static createEvalChart({
        element,
        type,
        data,
        title,
    }: {
        element: HTMLCanvasElement | null,
        type: 'acc' | 'loss',
        data: EvaluationTrainValType,
        title: string
    }) {
        if (!element) throw new Error('Canvas not found');

        const labels = data.map(row => row.epoch);
        const datasets = type === 'acc'
            ? [
                {
                    label: 'Acc',
                    data: data.map(row => row.acc),
                    borderColor: '#15FF00',
                },
                {
                    label: 'Val Acc',
                    data: data.map(row => row.valAcc),
                    borderColor: '#005601',
                },
            ]
            : [
                {
                    label: 'Loss',
                    data: data.map(row => row.loss),
                    borderColor: '#FF0000',
                },
                {
                    label: 'Val Loss',
                    data: data.map(row => row.valLoss),
                    borderColor: '#8B0000',
                },
            ];

        const existing = Chart.getChart(element);
        if (existing) {
            existing.data.labels = labels;
            existing.data.datasets = datasets;
            existing.update('active');
            return existing;
        }

        return new Chart(
            element,
            {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets,
                },
                options: {
                    plugins: {
                        title: {
                            text: title,
                            display: true,
                        }
                    }
                }
            },
        )
    }

    static createSplitDataChart({
        element,
        splitData,
        title,
    }: {
        element: HTMLCanvasElement | null,
        splitData: SplitDataType,
        title: string,
    }) {
        if (!element) throw new Error('Canvas not found');

        const existing = Chart.getChart(element);

        const isEmpty = Object.values(splitData).every(v => v === null || v === 0);
        const data = isEmpty
            ? [1, 1, 1]
            : Object.values(splitData).map(v => v ?? 0);
        const backgroundColor = isEmpty ? ['#E0E0E0', '#E0E0E0', '#E0E0E0'] : ['#36A2EB', '#FF6384', '#FFCD56',];

        if (existing) {
            existing.data.labels = Object.keys(splitData);
            existing.data.datasets[0].data = Object.values(splitData);
            existing.data.datasets[0].backgroundColor = backgroundColor;
            existing.update('active');
            return existing;
        }

        return new Chart(
            element,
            {
                type: 'pie',
                data: {
                    labels: Object.keys(splitData),
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColor,
                        hoverOffset: 4,
                    }]
                },
                options: {
                    animation: {
                        duration: 800,
                        easing: 'easeOutQuart',
                    },
                    plugins: {
                        title: {
                            text: title,
                            display: true,
                        }
                    }
                }
            },
        )
    }
}