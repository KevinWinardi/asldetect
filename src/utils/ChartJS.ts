import { Chart } from "chart.js/auto";
import type { SplitDataType } from "../types/splitDataType";

export class ChartJS {
    createEvalChart(
        element: HTMLCanvasElement | null,
        type: 'acc' | 'loss',
        data: { epoch: number, loss: number, acc: number, valLoss: number, valAcc: number }[]
    ) {
        if (!element) throw new Error('Canvas not found');

        const existing = Chart.getChart(element);
        if (existing) {
            existing.destroy();
        }

        const datasets = type === 'acc'
            ? [
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
            ]
            :
            [
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
            ];

        return new Chart(
            element,
            {
                type: 'line',
                data: {
                    labels: data.map(row => row.epoch),
                    datasets: datasets,
                },
                options: {
                    plugins: {
                        title: {
                            text: 'Evaluation Chart',
                            display: true,
                        }
                    }
                }
            },
        )
    }

    static createSplitDataChart(
        element: HTMLCanvasElement | null,
        splitData: SplitDataType,
    ) {
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
                            text: 'Plot Training Model',
                            display: true,
                        }
                    }
                }
            },
        )
    }
}