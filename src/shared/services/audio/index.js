import Recorder from './Recorder';
import IO from './IO';
import Players from './Players';


// this wraps one recorder and mutiple players that send and receive data over websocket
// wrap one recorder for current user
// wrap as many player as users in the room (except our current user)
class AudioManager {
  constructor(setPlayers) {

    this._setPlayers = setPlayers;
    const AudioContext = window &&
      (window.AudioContext || window.webkitAudioContext);


    if (!AudioContext) {
      // trying to initialize on server ??
      throw new Error('[Recorder.constructor] AudioContext must be defined');
    }

    // create one context that will be shared by all players and recorder
    // better to add or remove audio nodes from a context than creating multiple context
    this._AudioContext = AudioContext;
    this._audioCtx = new this._AudioContext({
      // https:// developer.mozilla.org/en-US/docs/Web/API/AudioContextLatencyCategory
      latencyHint: 'interactive',
    });

    // create player manager
    this._players = new Players(this._audioCtx);
  }


  async init(roomId) {

    if (!_.isNumber(roomId)) {
      throw new Error('[AudioManager.init] roomId must be a number');
    }

    // create websocket manager
    if (!this.io) {
      this.io = new IO('ws://localhost:3000');
    }

    let dataCb;
    // this cb will be invoked by ws when a new user join the room
    const onJoin = async(socket, id) => {

      console.log('user joined', id);
      const player = this._players.register(id);

      if (!player) {
        return;
      }

      await player.init(id);
      // keep reference to handle removing listenner on user leave
      dataCb = (data) => player._player.port.postMessage(data);

      // add listenner to get other user audio data
      socket.on(id, dataCb);

      this._setPlayers(this._players._ids)
    }

    // this cb will be invoked by ws when a user leave the room
    const onLeave = (socket, id) => {
      console.log('user left', id);
      this._players.unregister(id);

      // remove listenner for audio data
      socket.off(id, dataCb);
      this._setPlayers(this._players._ids);
    }

    // // this cb will be invoked by ws when audio data is received
    // const onData = (id, data) => {
    //   console.log('id', id);
    //   console.log('data', data);
    //   // this.player._player.port.postMessage(data);
    //   // this.player2._player.port.postMessage(data);
    // }

    // - start ws connection
    // - join room
    await this.io.start(roomId, {
      onJoin,
      onLeave,
      // onData,
    });

    // create recorder
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
    await this.stopPlayers();
    await this.stopRecorder();
  }


  startPlayers() {

    if (!this._players) {
      return Promise.resolve();
    }

    return this._players.start();
  }

  stopPlayers() {

    if (!this._players) {
      return Promise.resolve();
    }

    return this._players.stop();
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
}

export default AudioManager;
