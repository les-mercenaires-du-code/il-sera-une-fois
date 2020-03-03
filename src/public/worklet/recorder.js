class OutputProcessor extends AudioWorkletProcessor {
  constructor (options) {
    // The initial parameter value can be set by passing |options|
    // to the processor’s constructor.
    super(options);
    console.log('RecorderProcessor');
  }

  process(inputs, outputs, parameters) {

    // asynchronously sends message to workletNode
    this.port.postMessage(inputs[0]);

    // keep processing
    return true;

  }

}

registerProcessor('recorder', OutputProcessor);
