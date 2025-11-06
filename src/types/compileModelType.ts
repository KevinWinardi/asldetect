export type CompileModelType = {
    optimizer: 'adam' | 'rmsprop' | 'sgd' | null,
    learningRate: number | null,
    loss: 'categoricalCrossentropy',
    metrics: 'accuracy',
}