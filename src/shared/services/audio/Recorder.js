class Recorder {
  constructor(audioContext, options = {}) {


    console.log('recorder', options);
    if (!_.isObject(options)) {
      throw new Error('[Recorder.constructor] options must be an object');
    }

    this._audioCtx = audioContext;

    if (!window || !window.navigator || !window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      throw new Error('[Recorder.constructor] getUserMedia is not supported');
    }

    // buffer size should match between front and back ends
    this._bufferSize = options.bufferSize || 2048;

    // empty buffer needed for audio context initialization
    this._constraints = {
      audio: {
        sampleRate: this._sampleRate,
        echoCancellation: true,
      },
      video: false,
    };

    // how many samples per seconds
    // different browsers have different value
    // TODO check if we can systematically enforce this
    this._sampleRate = 8000;
    this.ready = false;
    this._buffer = [];
  }

  start(cb) {

    if (this.ready) {
      return;
    }

    console.log('start');
    if (!_.isFunction(cb)) {
      throw new Error('[Player.start] cb must be a function');
    }
    // store for later use by worlet node
    this._cb = cb;

    return this.loadWorkletProcessor()
      .then(() => this.getLiveStream())
      .then((audioIn) => this.connectWorkletNode(audioIn))
      .then(() => {

        // it will not record if audio context is suspended
        if (this._audioCtx.state === "suspended") {
          this._audioCtx.resume();
        }
        this.ready = true;
        console.log('ready');
      })
      .catch((err) => console.log('init error', err))
    ;
  }

  connectWorkletNode(audioIn) {

    console.log('connectWorkletNode', this._cb);
    this._audioIn = audioIn;
    this._recorder = new AudioWorkletNode(this._audioCtx, 'recorder');
    this._recorder.port.onmessage = (event) => this._cb(event.data);

    this._audioIn.connect(this._recorder);
    this._recorder.connect(this._audioCtx.destination);

    console.log(this);
  }

  getLiveStream() {

    console.log('getLiveStream');
    return window.navigator
      .mediaDevices
      // capture audio only
      .getUserMedia(this._constraints)
      .then((userMediaStream) => {
        // keep reference to be able to stop
        this._userMedia = userMediaStream;
        return userMediaStream;
      })
      // create a media stream source that we can feed to processor
      .then((stream) => this._audioCtx.createMediaStreamSource(stream))
      .catch((err) => {
        console.log('getLiveStream error', err);
      })
    ;
  }

  loadWorkletProcessor() {
    console.log('loadWorkletProcessor');
    return this._audioCtx
      .audioWorklet
      .addModule('/worklet/streamOutProcessor.js')
      .catch((err) => {
        console.log('loadWorklet error', err);
      })
    ;
  }

  stop() {

    if (!this.ready) {
      return;
    }

    // stop capturing audio from mic
    this._userMedia.getTracks().forEach(track => track.stop());
    this._userMedia = null;

    // disconnect audio stream
    this._audioIn.disconnect(this._recorder);
    this._audioIn = null;

    // disconnect processor
    this._recorder.disconnect(this._audioCtx.destination);
    this.recorder = null;

    this.ready = false;

    console.log('stopped');
  }
}

export default Recorder;



  //
  // handleSuccess(stream) {
  //
  //   console.log('handleSuccess');
  //   try {
  //     this._recorder = new MediaRecorder(stream, {
  //       bitsPerSecond: 128000
  //     });
  //   } catch (e) {
  //     console.error('Exception while creating MediaRecorder: ' + e);
  //     return;
  //   }
  //
  //   this._recorder.ondataavailable = (event) => this.processData(event);
  //
  //
  //   // this._input = this._audioCtx.createMediaStreamSource(stream);
  //   // this._input.connect(this._processor);
  //   //
  //   // this._processor.onaudioprocess = (e) => this.process(e);
  // }
  //
  // processData(event) {
  //
  //   console.log(' Recorded chunk of size ' + event.data.size + "B");
  //
  //   let fileReader = new FileReader();
  //   let arrayBuffer;
  //
  //   fileReader.onloadend = () => {
  //
  //     arrayBuffer = fileReader.result;
  //     console.log('now', arrayBuffer);
  //   }
  //
  //   fileReader.readAsArrayBuffer(event.data);
  //
  //   console.log(event);
  //   // should have data.event of type Blob
  //
  //   // const float32 = e.inputBuffer.getChannelData(0);
  //   return this._cb(event.data);
  // }
