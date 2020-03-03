class Processor extends AudioWorkletProcessor {
  constructor (options) {
    // The initial parameter value can be set by passing |options|
    // to the processor’s constructor.
    super(options);

    this._buffers = [];
    this.port.onmessage = (event) => this.updateBuffer(event);
  }

  process(inputs, outputs, parameters) {

    if (this._buffers.length === 0) {
      // console.log('empty buffer');
      return true;
    }

    // remove and grab first elem (fifo)
    let ins = this._buffers.splice(0, 1);

    if (!Array.isArray(ins) || ins.length !== 1) {
      console.log('ins is not an array or of length different than 1');
      return true;
    }

    // we're expecting two channels (left and right)
    ins = ins[0];
    if (!Array.isArray(ins) || ins.length !== 2) {
      console.log('ins is not an array or of length different than 2', ins);
      return true;
    }

    const output = outputs[0];
    for (var i = 0; i < output.length; i++) {

      // output is always of length 128, we need the same for our input
      // if (ins[i].length !== 128) {
      //   console.log('ins[i] length is not equal to 128', ins[i], output[i]);
      //   break;
      // }

      for (let j = 0; j < output[i].length; j++) {
        // copy received input to our ouput channel
        output[i][j] = ins[i][j];
      }
    }
    return true;
  }

  updateBuffer(event) {

    //
    // const currentQLen = this._buffer.length;
    // const newQLen = currentQLen + audioBuffer.length;
    //
    // const newBuffer = new Float32Array(newQLen);
    // newBuffer.set(this._buffer, 0);
    // newBuffer.set(audioBuffer.buffer, currentQLen);
    //
    // this._buffer = newBuffer;

    this._buffers.push(event.data);
  }


}

registerProcessor('player', Processor);
