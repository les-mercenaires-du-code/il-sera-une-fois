class Recorder {
  constructor(options = {}) {

    if (!_.isObject(options)) {
      throw new Error('[Recorder.constructor] options must be an object');
    }

    const AudioContext = window &&
      (window.AudioContext || window.webkitAudioContext);


    if (!AudioContext) {
      // trying to initialize on server ??
      throw new Error('[Recorder.constructor] AudioContext must be defined');
    }

    if (!window || !window.navigator || !window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      throw new Error('[Recorder.constructor] getUserMedia is not supported');
    }

    // buffer size should match between front and back ends
    this._bufferSize = options.bufferSize || 2048;
    // store audioContext
    this._AudioContext = AudioContext;
    // empty buffer needed for audio context initialization
    this._constraints = {
      audio: true,
      video: false,
    };

    this._audioCtx = null;
    this._input = null;
    this._processor = null;

    this.ready = false;
  }

  polyfillMediaDevice() {

    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {

      navigator.mediaDevices.getUserMedia = function(constraints) {

        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

  }

  init(cb) {

    if (!_.isFunction(cb)) {
      throw new Error('[Player.init] cb must be a function');
    }

    this._cb = cb;

    const numberOfInputChannels = 1;
    const numberOfOutputChannels = 1;

    this._audioCtx = new this._AudioContext({
      // https:// developer.mozilla.org/en-US/docs/Web/API/AudioContextLatencyCategory
      latencyHint: 'interactive',
    });


    return this._audioCtx.suspend()
      .then(() => {

        this._processor = this._audioCtx.createScriptProcessor(this._bufferSize, numberOfInputChannels, numberOfOutputChannels);

        this._processor.connect(this._audioCtx.destination);

        this.ready = true;
        return window.navigator
          .mediaDevices
          .getUserMedia({ audio: { echoCancellation: true } })
          .then((stream) => this.handleSuccess(stream))
        ;
      })
    ;

  }

  handleSuccess(stream) {

    this._input = this._audioCtx.createMediaStreamSource(stream);
    this._input.connect(this._processor);

    this._processor.onaudioprocess = (e) => this.process(e);
  }

  process(e) {

    const arrayBuffer = e.inputBuffer.getChannelData(0);
    return this._cb(arrayBuffer.buffer);
  }

  start() {

    if (!this._audioCtx || this._audioCtx.state !== 'suspended') {
      return Promise.resolve();
    }

    // promise
    return this._audioCtx.resume();
  }

  pause() {

    return this._audioCtx.suspend();
  }
}

export default Recorder;
