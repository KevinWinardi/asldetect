export type InputLayerType = {
    id: string,
    type: 'inputLayer',
    input_shape: number[],
}

export type DenseLayerType = {
    id: string,
    type: 'dense',
    units: number | null,
    activation: 'relu' | 'elu' | 'swish' | 'tanh' | null,
}

export type BatchNormalizationLayerType = {
    id: string,
    type: 'batchNormalization',
    momentum: number | null,
    epsilon: number | null,
}

export type DropoutLayerType = {
    id: string,
    type: 'dropout',
    rate: number | null,
}

export type OutputLayerType = {
    id: string,
    type: 'output',
    units: number,
    activation: 'softmax',
}

export type LayerType = InputLayerType | DenseLayerType | BatchNormalizationLayerType | DropoutLayerType | OutputLayerType;