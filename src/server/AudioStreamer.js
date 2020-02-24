// https://exploringjs.com/impatient-js/ch_typed-arrays.html


import _ from 'lodash';
import ws from 'socket.io';


class AudioStreamer {
  constructor(server, options) {

    if (!_.isObject(options) || !server) {
      console.error('options should be an object');
      console.error('server must be defined');
      throw new Error('[AudioStream] Invalid constructor options');
    }

    this._server = server;

    // internal params
    this._buffer = [];
    this._bufferLength = 0;
    this._sampleRate = 44100;
    this._pause = false;
    this._closed = true;

    this._store = [];
    this._sockets = {};
    this._rooms = {};

    this.start = this.start.bind(this);
    this.attachListenners = this.attachListenners.bind(this);
    this.initRooms = this.initRooms.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.broadcastBufferToRoom = this.broadcastBufferToRoom.bind(this);

  }

  start() {

    this.initRooms(1);
    console.log(this._rooms);

    this._io = ws(this._server);
    this._closed = false;

    this._io.on('connection', (socket) => {

      const socketId = socket.id;

      if (this._sockets[socketId]) {
        console.log('socket id already defined');
        return;
      }

      this._sockets[socketId] = socket;
      this.attachListenners(socket);

      if (_.size(_.keys(this._sockets)) > 1) {

        console.log('%%%%%%% more than 1');
        // console.log(this._io);
        // this._io.clients.forEach(function each(client) {
        //   if (client.readyState === WebSocket.OPEN) {
        //     console.log(client.id, 'ready');
        //     return;
        //     // client.send(data);
        //   }
        //   console.log(client.id, 'notReady');
        //
        // });
      }

    });

    // TODO: double check event !!
    this._io.on('disconnect', (socket) => {
      console.log('should remove socket');
      // this.attachListenners(socket);
    });
  }

  stop() {
    // TODO: remove all listenners here
  }


  attachListenners(socket) {
    console.log('should attach listenners now');

    socket.on('disconnect', (...params) => {
      console.log('socket disconnect', socket.id, params);

      // this.leaveRoom(socket.id)
    })

    socket.on('join', (...params) => {
      console.log('socket join', socket.id, params);
      // this.join()
    })
    // console.log(socket);

    socket.on('startRecording', () => {
      this._store = [];
    })

    socket.on('binary', (data) => {
      console.log('binary', typeof data);

      this._store.push(data);
    });

    socket.on('stopRecording', () => {
      console.log('stop recording');
      console.log(this._store);
      _.each(this._store, (b) => {
        console.log('emit to ret');
        socket.emit('ret', b);
      });
    });

    setTimeout(() => {
      // console.log(this._store);
      _.each(this._store, (d) => {
        this.broadcast(d);
      })
    }, 10000);


  }

  initRooms(nb = 80) {

    if (!_.isNumber(nb)) {
      console.log('initRooms: nb must be a number');
      return;
    }

    this._rooms = {};
    for (var i = 0; i < nb; i++) {
      this._rooms[i] = [];
    }

    this.nbRooms = nb;
  }

  joinRoom(id, socket) {

    if (!_.isNumber(id)) {
      console.log('joinRoom: id must be a number');
      return;
    }

    if (_.isUndefined(this.roooms[id])) {
      console.log('joinRoom: trying to join a room that does not exist');
      return;
    }

    this.rooms[id].push(socket);
  }

  leaveRoom(id, socket) {

    if (!_.isNumber(id)) {
      console.log('leaveRoom: id must be a number');
      return;
    }

    if (_.isUndefined(this.roooms[id])) {
      console.log('leaveRoom: trying to leave a room that does not exist');
      return;
    }

    // TODO: double check this, not sure about syntax and mutation...
    _.pull(this.rooms[id], socket);
  }

  broadcastBufferToRoom(id, buffer) {
    if (!_.isNumber(id)) {
      console.log('broadcastToRoom: id must be a number');
      return;
    }

    const sockets = this.rooms[id];
    _.each(sockets, (client) => {
      if (client.readyState !== WebSocket.OPEN) {
        console.log('Should not broadcast to a client that is not ready');
        // TODO: pull socket ??
        return;
      }

      client.emit(buffer);
    });
  }


  handleBinary(data) {
    console.log('handleBinary', data);
  }

  handleText(str) {

    const data = JSON.parse(str);

    const { type, roomId, msg } = data;
    console.log('type', type);
    console.log('roomId', roomId);
    console.log('msg', msg);

  }


  broadcast(data) {

    _.each(this._sockets, (client) => {
        client.send(data);
    })
  }
}

export default AudioStreamer;


// https://www.clicktorelease.com/tmp/fastload/
// https://github.com/websockets/ws
// https://github.com/heineiuo/isomorphic-ws
// https://funweb.fr/article/utiliser-websocket-avec-express-node-js-et-la-librairie-ws/3



  // listen() {

    // this.io.on('connection', (socket) => {
    //
    //   socket.on('startRecording', () => {
    //     this._store = [];
    //   })
    //
    //   socket.on('binary', (data) => {
    //     console.log('binary', typeof data);
    //
    //     this._store.push(data);
    //   });
    //
    //   socket.on('stopRecording', () => {
    //     console.log('stop recording');
    //     console.log(this._store);
    //     _.each(this._store, (b) => {
    //       console.log('emit to ret');
    //       socket.emit('ret', b);
    //     });
    //   });
    //
    //   // setTimeout(() => {
    //   //   console.log(this._store);
    //   //   _.each(this._store, (d) => {
    //   //     this.broadcast(d);
    //   //   })
    //   // }, 10000);
    //
    // });

  // }


  // start() {

    // this.io.on('connection', (socket) => {
    //
    //
    // });

  // }
