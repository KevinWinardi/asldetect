import { Chart } from "chart.js/auto";

export class ChartJS {
    currentChart: Chart | null;

    constructor() {
        this.currentChart = null;
    }

    createEvalChart(
        element: HTMLCanvasElement | null,
        type: 'acc' | 'loss',
        data: { epoch: number, loss: number, acc: number, valLoss: number, valAcc: number }[]
    ) {
        if (!element) {
            throw new Error('Canvas not found');
        }

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
                    borderColor: '#470000',
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

        this.currentChart = new Chart(
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
                            text: 'Plot Training Model',
                            display: true,
                        }
                    }
                }
            },
        )
    }
}