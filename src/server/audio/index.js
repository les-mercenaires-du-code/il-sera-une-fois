import _ from 'lodash';
import ws from 'socket.io';

import Rooms from './Rooms';

class AudioWS extends Rooms {
  constructor(options = {}) {
    super(options);

    if (!_.isObject(options) || !options.server) {
      console.error('options should be an object');
      console.error('options.server must be defined');
      throw new Error('[AudioStream] Invalid constructor options');
    }

    this._server = options.server;
    this._buffer = [];
    this._bufferLength = 0;
    this._sampleRate = 44100;

    this._pause = false;
    this._closed = true;
    this._store = [];
  }

  start() {

    this._io = ws(this._server);
    this._closed = false;

    this._io.on('connection', (socket) => {
      this.attachListenners(socket);
    });
  }

  attachListenners(socket) {

    const socketId = socket.id;

    socket.on('disconnect', () => {

      if (!this.isRegisterd(socketId)) {
        return;
      }

      this.leaveRoom(socketId);
    });

    const binaryCb = (params) => {
      const sockets = this.getSocketsBySocketId(socketId);
      this.broadcastStream(sockets, params);
    };

    socket.on('joinRoom', (params) => {

      const roomId = _.get(params, 'roomId')
      this.joinRoom(roomId, socket);
      socket.on('binary', binaryCb);
    });

    socket.on('leaveRoom', (params) => {

      this.leaveRoom(socketId);
      socket.off('binary', binaryCb);
    });
  }

  broadcastStream(sockets, data) {

    if (!_.isArray(sockets) || !_.size(sockets) || !data) {
      return;
    }

    _.each(sockets, (socket) => {
      socket.emit('stream', data);
    });
  }
}

export default AudioWS;
