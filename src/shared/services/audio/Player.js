import _ from 'lodash';

class Player {

  constructor(audioContex, options = {}) {

    if (!_.isObject(options)) {
      throw new Error('[Player.constructor] options must be an object');
    }

    this._audioCtx = audioContex;

    // new AudioWorkletNode(this._audioCtx, 'myProcessor');

    // buffer size should match between front and back ends
    this._bufferSize = options.bufferSize || 2048;

    // empty buffer needed for audio context initialization
    this._silence = new Float32Array(2048);
    // will hold all incoming audio
    this._buffer = new Float32Array(0);
    // store script processor
    this._processor = null;
    // store gain node (represents a volume modification)
    this._gainNode = null;

    this._constraints = {
      audio: true,
      video: false,
    };

    this.ready = false;
  }

  init() {
    return this._audioCtx
      .audioWorklet
      .addModule('/worklet/player.js')
      .then((res) => {

        this._player = new AudioWorkletNode(this._audioCtx, 'player');

        // it will not record if audio context is suspended
        if (this._audioCtx.state === "suspended") {
          this._audioCtx.resume();
        }

      })
      .catch((err) => {
        console.log('$$ err', err);
      })
    ;
  }

  start() {

    if (!this._player || !this._audioCtx) {
      return;
    }

    this._player.connect(this._audioCtx.destination);
    this.ready = true;
  }

  stop() {

    if (!this.ready) {
      return;
    }

    this._player.disconnect(this._audioCtx.destination);
    this.ready =false;
  }

    //
    // const numberOfInputChannels = 1;
    // const numberOfOutputChannels = 1;
    //
    // const audioBufferSourceNode = new AudioBufferSourceNode(this._audioCtx);
    //
    //
    // console.log('====>', audioBufferSourceNode);
    // console.log('====>', audioBufferSourceNode.createMediaStreamSource);
    //
    // // console.log(this._audioCtx);
    // // promise
    // return this._audioCtx.suspend()
    //   .then(() => {
    //
    //     this._processor = this._audioCtx.createScriptProcessor(this._bufferSize, numberOfInputChannels, numberOfOutputChannels);
    //
    //     // TODO: this is working in chrome but deprecated...
    //     // need to find alternate solution (https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode)
    //     this._processor.onaudioprocess = (e) => this.onaudioprocess(e);
    //     this._gainNode = this._audioCtx.createGain();
    //     this._processor.connect(this._gainNode);
    //     this._gainNode.connect(this._audioCtx.destination);
    //
    //   })
    // ;

  // onaudioprocess(e) {
  //
  //   // if we have no audio to play use silence buffer
  //   if (!this._buffer.length) {
  //     e.outputBuffer.getChannelData(0).set(this._silence);
  //     return;
  //   }
  //
  //   // grab _bufferSize from _buffer and send it to audio context
  //   const toPlay = this.bufferRead(this._bufferSize);
  //   e.outputBuffer.getChannelData(0).set(toPlay);
  //
  // }
  //
  // bufferWrite(audioBuffer) {
  //
  //   console.log(audioBuffer);
  //   // this._audioCtx.decodeAudioData(audioBuffer, (buffer) => {
  //   //   // This function can be anything to handle the returned arraybuffer
  //   //   // processAudio(buffer)
  //   //
  //   //   console.log('decodeAudioData', buffer);
  //   //
  //   //   // These three lines of code will play the video's audio
  //   //   // this._audioContextBuffer.buffer = buffer
  //   //   // this._audioContextBuffer.connect(audioContext.destination)
  //   //   // this._audioContextBuffer.start()
  //   // }, error => {
  //   //   console.log('Unable to decode audio stream')
  //   // })
  //
  //
  //   const currentQLen = this._buffer.length;
  //   const newQLen = currentQLen + audioBuffer.length;
  //
  //   const newBuffer = new Float32Array(newQLen);
  //   newBuffer.set(this._buffer, 0);
  //   newBuffer.set(audioBuffer.buffer, currentQLen);
  //
  //   this._buffer = newBuffer;
  // }
  //
  // // extract buffer size from current buffer
  // bufferRead(bufferSize) {
  //
  //   const buffer = this._buffer.subarray(0, bufferSize);
  //   this._buffer = this._buffer.subarray(bufferSize, this._buffer.length);
  //
  //   return buffer;
  // }
  //
  // loadSound(url) {
  //
  //   var request = new XMLHttpRequest();
  //   request.open('GET', url, true);
  //   request.responseType = 'arraybuffer';
  //
  //   return new Promise((resolve, reject) => {
  //     // Decode asynchronously
  //     request.onload = () => {
  //       this._audioCtx.decodeAudioData(request.response, function(buffer) {
  //         resolve(buffer);
  //       }, (e) => console.log('decodeAudioData error', e));
  //     }
  //
  //     request.send();
  //   })
  // }
  //
  // playSound(buffer) {
  //
  //   var source = context.createBufferSource(); // creates a sound source
  //   source.buffer = buffer;                    // tell the source which sound to play
  //   source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  //   source.start(0);                           // play the source now
  //                                              // note: on older systems, may have to use deprecated noteOn(time);
  // }
  //
}

export default Player;
