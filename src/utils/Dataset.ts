import * as tf from '@tensorflow/tfjs';

export class Dataset {
    arrayData: (number | string)[][];

    constructor() {
        this.arrayData = [
            ['x0', 'y0', 'z0',
                'x1', 'y1', 'z1',
                'x2', 'y2', 'z2',
                'x3', 'y3', 'z3',
                'x4', 'y4', 'z4',
                'x5', 'y5', 'z5',
                'x6', 'y6', 'z6',
                'x7', 'y7', 'z7',
                'x8', 'y8', 'z8',
                'x9', 'y9', 'z9',
                'x10', 'y10', 'z10',
                'x11', 'y11', 'z11',
                'x12', 'y12', 'z12',
                'x13', 'y13', 'z13',
                'x14', 'y14', 'z14',
                'x15', 'y15', 'z15',
                'x16', 'y16', 'z16',
                'x17', 'y17', 'z17',
                'x18', 'y18', 'z18',
                'x19', 'y19', 'z19',
                'x20', 'y20', 'z20',
                'label',
            ]
        ];
    }
    
    async checkValidityDataset(file: File): Promise<boolean> {
        const header = this.arrayData[0];

        console.log(file);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file);

            reader.onload = function (e) {
                const csvContent = e.target?.result;
                if (typeof csvContent !== 'string') {
                    reject(new Error('File csv not valid'));
                } else {
                    const rows = csvContent.split(/\r?\n/);
                    const csvHeader = rows[0].split(',');

                    const headerValid = header.length === csvHeader.length && header.every((val, idx) => val === csvHeader[idx]);
                    if (!headerValid) {
                        reject(new Error('Header csv is not valid'));
                    }

                    // 26 letters x 10 = 260 row + 1 row header = 261 minimum
                    const rowData = rows.length >= 261;
                    if (!rowData) {
                        reject(new Error('CSV file is not valid, make sure the data is not changed/removed'));
                    }

                    resolve(true);
                }
            }

            reader.onerror = () => reject(new Error('Error when read file'));
        })
    }

    loadDataset(url: string): tf.data.CSVDataset {
        const data = tf.data.csv(url, {
            columnConfigs: {
                'label': { isLabel: true }
            },
            hasHeader: true,
        });

        return data;
    }

    addDataToArray(data: (number | string)[]): void {
        this.arrayData.push(data)
    }

    downloadDataset(): void {
        const csv = this.arrayData.map(row => row.join(',')).join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const downloadBtn = document.createElement('a');
        downloadBtn.setAttribute('href', url);
        downloadBtn.setAttribute('download', 'data.csv');
        document.body.appendChild(downloadBtn);
        downloadBtn.click();
        document.body.removeChild(downloadBtn);
    }
}