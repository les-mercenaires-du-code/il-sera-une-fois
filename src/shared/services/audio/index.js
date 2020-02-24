import Recorder from './Recorder';
import Player from './Player';
import IO from './IO';

class AudioManager {
  constructor() {

    this.recorderCb = this.recorderCb.bind(this);
  }

  async init(roomId) {

    if (!_.isNumber(roomId)) {
      throw new Error('[AudioManager.init] roomId must be a number');
    }

    if (!this.io) {
      this.io = new IO('ws://localhost:3000');
    }

    if (!this.player) {
      this.player = new Player();
      await this.player.init();
    }

    if (!this.recorder) {
      this.recorder = new Recorder();
      await this.recorder.init(this.recorderCb);
    }

    await this.io.start(roomId, this.player.bufferWrite)
  }

  async stop() {

    if (this.io) {
      await this.io.stop();
    }
    await this.stopPlayer();
    await this.stopRecorder();
  }


  startPlayer() {

    if (!this.player || !this.player.ready) {
      return Promise.resolve();
    }

    return this.player.start();
  }

  stopPlayer() {

    if (!this.player || !this.player.ready) {
      return Promise.resolve();
    }

    return this.player.pause();
  }

  startRecorder() {

    if (!this.recorder || !this.recorder.ready) {
      return;
    }

    return this.recorder.start();
  }


  stopRecorder() {

    if (!this.recorder || !this.recorder.ready) {
      return;
    }

    return this.recorder.pause();
  }

  recorderCb(data) {

    if (!this.io.open) {
      return;
    }

    this.io.socket.emit('binary', data);
  }
}

export default AudioManager;
