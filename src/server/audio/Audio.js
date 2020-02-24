import Emitter from 'events'


class AudioStream extends Emitter {

  constructor(options = {}) {

    if (!_.isObject(options) || !options.server) {
      console.error('options should be an object');
      console.error('options.server must be defined');
      throw new Error('[AudioStream] Invalid constructor options');
    }

    this._server = server;

    // internal params
    this._buffer = [];
    this._bufferLength = 0;
    this._sampleRate = 44100;
  }

  // should handle cases where server has not been provided but
  // we've got port and uri options instead.
  listen() {

    // attach ws to server
    this.io = ws(this._server);
  }

  subscribe(type) {

    if (!_.isString(type)) {
      console.error('[AudioStream.subscribe] type must be a string');
      return;
    }

    console.log('trying to subscribe to type', type);
  }

  //
  resampleInput(buffer) {
    return buffer;
  }

  resampleOutput(buffer) {
    return buffer;
  }

  // store audio input
  // mostly used for debug
  store() {

  }


  streamIn() {

  }

  streamOut() {

  }

  pause() {

  }

  resume() {

  }

  stop() {

  }

  broadcast() {

  }

}

export default AudioStream;
