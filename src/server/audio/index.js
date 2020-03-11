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

      const sockets = this.getSocketsBySocketId(socketId);
      _.each(sockets, (socket) => {
        console.log('emitt leave');
        socket.emit('leave', socketId);
      });

      this.leaveRoom(socketId);
    });

    const binaryCb = (params) => {

      console.log('binaryCb', socketId);
      const sockets = this.getSocketsBySocketId(socketId);
      this.broadcastStream(socketId, sockets, params);
    };

    socket.on('joinRoom', (params) => {

      console.log('join room', socketId);
      const roomId = _.get(params, 'roomId');
      this.joinRoom(roomId, socket);

      const otherSocketIds = this.getSocketsIdByRoomId(roomId, socketId);

      socket.on('binary', binaryCb);

      if (!_.size(otherSocketIds)) {
        return;
      }

      console.log('otherSocketIds', otherSocketIds);
      socket.emit('register', otherSocketIds);

      const sockets = this.getSocketsBySocketId(socketId);
      _.each(sockets, (socket) => {
        socket.emit('join', socketId);
      });

    });

    socket.on('leaveRoom', (params) => {

      console.log('leave room', socketId);

      this.leaveRoom(socketId);
      socket.off('binary', binaryCb);

      const sockets = this.getSocketsBySocketId(socketId);
      _.each(sockets, (socket) => {
        console.log('emitt leave');
        socket.emit('leave', socketId);
      });

    });
  }

  broadcastStream(socketId, sockets, data) {

    if (!_.isArray(sockets) || !_.size(sockets) || !data) {
      return;
    }

    _.each(sockets, (socket) => {
      socket.emit(socketId, data);
    });
  }
}

export default AudioWS;
