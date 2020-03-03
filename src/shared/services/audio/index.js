import Recorder from './Recorder';
import Player from './Player';
import IO from './IO';


// https://webaudio.github.io/web-audio-api/#audioworklet
class AudioManager {
  constructor() {

    // this.recorderCb = this.recorderCb.bind(this);

    const AudioContext = window &&
      (window.AudioContext || window.webkitAudioContext);


    if (!AudioContext) {
      // trying to initialize on server ??
      throw new Error('[Recorder.constructor] AudioContext must be defined');
    }

    this._AudioContext = AudioContext;
    // we only need one audio context
    // better to add or remove audio nodes from a context than creating multiple context
    this._audioCtx = new this._AudioContext({
      // https:// developer.mozilla.org/en-US/docs/Web/API/AudioContextLatencyCategory
      latencyHint: 'interactive',
    });

  }


  async init(roomId) {

    if (!_.isNumber(roomId)) {
      throw new Error('[AudioManager.init] roomId must be a number');
    }

    if (!this.io) {
      this.io = new IO('ws://localhost:3000');
    }

    if (!this.player) {
      this.player = new Player(this._audioCtx, {});
    }

    await this.player.init();
    await this.io.start(roomId, (data) => {
      this.player._player.port.postMessage(data);
    })

    if (!this.recorder) {
      this.recorder = new Recorder(this._audioCtx, {
        roomId,
      });
    }
  }

  async stop() {

    if (this.io) {
      await this.io.stop();
    }
    await this.stopPlayer();
    await this.stopRecorder();
  }


  startPlayer() {

    if (!this.player || this.player.ready) {
      return Promise.resolve();
    }

    return this.player.start();
  }

  stopPlayer() {

    if (!this.player || !this.player.ready) {
      return Promise.resolve();
    }

    return this.player.stop();
  }

  startRecorder() {

    if (!this.recorder) {
      return;
    }

    return this.recorder.start((data) => {
      console.log('sending binary');
      this.io.socket.emit('binary', data);
    });
  }


  stopRecorder() {

    if (!this.recorder || !this.recorder.ready) {
      return;
    }

    return this.recorder.stop();
  }
  //
  // recorderCb(data) {
  //
  //   if (!this.io.open) {
  //     return;
  //   }
  //
  //   this.io.socket.emit('binary', data);
  // }
}

export default AudioManager;
