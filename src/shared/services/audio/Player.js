import _ from 'lodash';

class Player {

  constructor(options = {}) {

    if (!_.isObject(options)) {
      throw new Error('[Player.constructor] options must be an object');
    }

    const AudioContext = window &&
      (window.AudioContext || window.webkitAudioContext);


    if (!AudioContext) {
      // trying to initialize on server ??
      throw new Error('[Player.constructor] AudioContext must be defined');
    }

    // buffer size should match between front and back ends
    this._bufferSize = options.bufferSize || 2048;
    // store audioContext
    this._AudioContext = AudioContext;
    // empty buffer needed for audio context initialization
    this._silence = new Float32Array(2048);
    // will hold all incoming audio
    this._buffer = new Float32Array(0);
    // store audioContext
    this._audioCtx = null;
    // store script processor
    this._processor = null;
    // store gain node (represents a volume modification)
    this._gainNode = null;

    this._constraints = {
      audio: true,
      video: false,
    };

    this.ready = false;

    this.bufferRead = this.bufferRead.bind(this);
    this.bufferWrite = this.bufferWrite.bind(this);
  }

  init() {

    const numberOfInputChannels = 1;
    const numberOfOutputChannels = 1;

    this._audioCtx = new this._AudioContext(this._constraints);

    // promise
    return this._audioCtx.suspend()
      .then(() => {

        this._processor = this._audioCtx.createScriptProcessor(this._bufferSize, numberOfInputChannels, numberOfOutputChannels);

        // TODO: this is working in chrome but deprecated...
        // need to find alternate solution (https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode)
        this._processor.onaudioprocess = (e) => this.onaudioprocess(e);
        this._gainNode = this._audioCtx.createGain();
        this._processor.connect(this._gainNode);
        this._gainNode.connect(this._audioCtx.destination);

        this.ready = true;
      })
    ;
  }

  start() {

    if (!this._audioCtx || this._audioCtx.state !== 'suspended') {
      return Promise.resolve();
    }

    // promise
    return this._audioCtx.resume();
  }

  pause() {

    if (!this._audioCtx || this._audioCtx.state === 'suspended') {
      return Promise.resolve();
    }


    return this._audioCtx.suspend();
  }

  onaudioprocess(e) {

    // if we have no audio to play use silence buffer
    if (!this._buffer.length) {
      e.outputBuffer.getChannelData(0).set(this._silence);
      return;
    }

    // grab _bufferSize from _buffer and send it to audio context
    const toPlay = this.bufferRead(this._bufferSize);
    e.outputBuffer.getChannelData(0).set(toPlay);

  }

  bufferWrite(audioBuffer) {

    const currentQLen = this._buffer.length;
    const newQLen = currentQLen + audioBuffer.length;

    const newBuffer = new Float32Array(newQLen);
    newBuffer.set(this._buffer, 0);
    newBuffer.set(audioBuffer, currentQLen);

    this._buffer = newBuffer;
  }

  // extract buffer size from current buffer
  bufferRead(bufferSize) {

    const buffer = this._buffer.subarray(0, bufferSize);
    this._buffer = this._buffer.subarray(bufferSize, this._buffer.length);

    return buffer;
  }

}

export default Player;
