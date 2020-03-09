import _ from 'lodash';
import ws from 'socket.io-client';

class IO {

  constructor(options, roomId) {

    this.uri = _.isString(options) ?
      options :
      options.uri
    ;

    if (!_.isString(this.uri)) {
      throw new Error('Uri is required to build construct WebSocket');
    }

    this.open = false;
    this.shouldJoin = true;
  }

  async start(roomId, cbs) {


    // if (!_.isFunction(cbs.onJoin) || !_.isFunction(cbs.onLeave) || !_.isFunction(cbs.onData)) {
    //   throw new Error('[IO.start] cbs must be a functions');
    // }

    if (!_.isNumber(roomId)) {
      throw new Error('[IO.start] roomId must be a number');
    }

    this.roomId = roomId;
    // this.streamCb = cbs.onData;
    this.socket = ws.connect(this.uri, {'forceNew':true});
    this.open = true;

    this.socket.on('connect', () => {
      this.joinRoom();
    })

    this.socket.on('register', (ids) => {
      _.each(ids, (id) => {
        cbs.onJoin(this.socket, id);
      })
    })

    this.socket.on('join', (id) => cbs.onJoin(this.socket, id));
    this.socket.on('leave', (id) => cbs.onLeave(this.socket, id))

    this.socket.on('disconnect', (reason) => {
      if (reason !== 'transport close') {
        return;
      }

      // transport closed, server is probably restarting
      this.shouldJoin = true;
    })


    return this.socket.id;
  }

  joinRoom() {

    if (!this.shouldJoin || !this.socket) {
      return;
    }

    this.socket.emit('joinRoom', {
      roomId: this.roomId,
    })

    this.shouldJoin = false;
  }

  stop() {

    if (!this.socket) {
      return;
    }

    this.socket.emit('leaveRoom', {
      roomId: this.roomId,
    })

    this.open = false;
    return this.socket.disconnect();
  }
}

export default IO;
