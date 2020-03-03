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

  async start(roomId, streamCb) {

    if (!_.isFunction(streamCb)) {
      throw new Error('[IO.start] streamCb must be a function');
    }

    if (!_.isNumber(roomId)) {
      throw new Error('[IO.start] roomId must be a number');
    }

    this.roomId = roomId;
    this.streamCb = streamCb;
    this.socket = ws.connect(this.uri, {'forceNew':true});
    this.open = true;

    this.socket.on('connect', () => {
      this.joinRoom();
      this.listenToStream();
    })

    this.socket.on('disconnect', (reason) => {
      if (reason !== 'transport close') {
        return;
      }

      // transport closed, server is probably restarting
      this.shouldJoin = true;
    })


    return this.socket.id;
  }

  listenToStream() {

    if (!this.socket) {
      return;
    }

    this.socket.on('stream', (data) => {

      // console.log(this.streamCb);
      // console.log('audio ws', audio);
      // const audio = new Float32Array(data);
      this.streamCb(data);
      // this.audioQueue.write(audio);
    });
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
