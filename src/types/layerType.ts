export type InputLayerType = {
    id: number,
    type: 'inputLayer',
    input_shape: number[],
}

export type DenseLayerType = {
    id: number,
    type: 'dense',
    units: number,
    activation: 'relu' | 'elu' | 'swish' | 'tanh',
}

export type BatchNormalizationLayerType = {
    id: number,
    type: 'batchNormalization',
    momentum: number,
    epsilon: number,
}

export type DropoutLayerType = {
    id: number,
    type: 'dropout',
    rate: number,
}

export type OutputLayerType = {
    id: number,
    type: 'output',
    units: number,
    activation: 'softmax',
}

export type LayerType = InputLayerType | DenseLayerType | BatchNormalizationLayerType | DropoutLayerType | OutputLayerType;