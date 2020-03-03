class Processor extends AudioWorkletProcessor {
  constructor (options) {
    // The initial parameter value can be set by passing |options|
    // to the processor’s constructor.
    super(options);
    console.log('- AudioWorkletProcessor options', options);

    this.port.onmessage = (event) => {
      // Handling data from the node.
      console.log('on port message', event.data);
    };


  }

  process(inputs, outputs, parameters) {

    const output = outputs[0];
    output.forEach(channel => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1
      }
    })
    return true
  }

}

registerProcessor('myProcessor', Processor);
