export type CompileType = {
    optimizer: 'adam' | 'rmsprop' | 'sgd',
    learningRate: number,
    loss: 'categoricalCrossentropy',
    metrics: 'accuracy',
}