import _ from 'lodash';

class Rooms {
  constructor(options = {}) {

    if (!_.isObject(options)) {
      throw new Error('[Rooms.constructor] options must be an object');
    }

    this._maxRooms = options.maxRooms || 10;
    this._maxSocketPerRoom = options._maxSocketPerRoom || 5;
    this._sockets = {};
    this._rooms = {};

    this.initRooms();
  }

  initRooms() {

    if (!_.isNumber(this._maxRooms)) {
      throw new Error('[Rooms.initRooms] options.maxRooms must be a number');
    }

    const nb = _.parseInt(this._maxRooms);
    this._rooms = {};
    for (var i = 0; i < nb; i++) {
      this._rooms[i] = [];
    }
  }

  isRegisterd(socketId) {

    if (!_.isString(socketId)) {
      throw new Error('[Rooms.leave] socketId must be a String');
    }

    if (_.isUndefined(this._sockets[socketId])) {
      return false;
    }

    return true;
  }

  joinRoom(roomId, socket) {

    if (!_.isNumber(roomId)) {
      throw new Error('[Rooms.join] roomId must be a String');
    }

    if (!_.isObject(socket) || !_.isString(socket.id)) {
      throw new Error('[Rooms.join] socket must be an object with id property');
    }

    if (roomId >= this._maxRooms) {
      console.error({
        roomId,
        maxRoomsId: this._maxRooms - 1,
      });
      throw new Error('[Rooms.join] roomId is out of range');
    }

    if (_.size(this._rooms[roomId]) === this._maxSocketPerRoom) {
      throw new Error('[Rooms.join] cannot join, room is full');
    }

    const socketId = socket.id;

    if (!_.isUndefined(this._sockets[socketId])) {
      throw new Error('[Rooms.join] socket is already registered in a room');
    }

    // add socketId to room
    this._rooms[roomId].push(socketId);

    // store socket and room
    this._sockets[socketId] = { socket, roomId };
  }

  leaveRoom(socketId) {

    if (!_.isString(socketId)) {
      throw new Error('[Rooms.leave] socketId must be a String');
    }

    // grab socket data (socket ref and roomId)
    const socketData = this._sockets[socketId];

    if (_.isUndefined(socketData)) {
      console.log(`[Rooms.leave] ${socketId} does not exist in registry`);
      return;
    }

    // grab roomId
    const roomId = socketData.roomId;
    // remove id from room
    this._rooms[roomId] = _.pull(this._rooms[roomId], socketId);
    // delete ref in sockets registry
    delete this._sockets[socketId];
  }

  getSocketsIdByRoomId(roomId, socketId) {

    if (!_.isNumber(roomId)) {
      throw new Error(`[Rooms.getSocketsIdByRoomId] roomId: '${roomId}' must be a Number`);
    }

    const socketIds = this._rooms[roomId];

    if (!socketId) {
      return socketIds;
    }

    return _.without(socketIds, socketId);
  }

  getSocketsByRoomId(roomId, socketId) {

    if (!_.isNumber(roomId)) {
      throw new Error(`[Rooms.getSocketsByRoomId] roomId: '${roomId}' must be a Number`);
    }

    const socketIds = this._rooms[roomId];

    if (!_.size(socketIds)) {
      // no one in this room
      return [];
    }

    const excludeSocket = _.isString(socketId);
    const socketsData = _.map(socketIds, (id) => {

      const socketData = this._sockets[id];
      if (id === socketId) {
        return;
      }

      return socketData.socket;
    });

    return _.compact(socketsData);
  }

  getSocketsBySocketId(socketId) {

    if (!_.isString(socketId)) {
      throw new Error(`[Rooms.getSocketsBySocketId] socketId: '${socketId}' must be a String`);
    }

    const socketData = this._sockets[socketId];

    if (_.isUndefined(socketData)) {
      console.log(`[Rooms.getSocketsBySocketId] socketId: '${socketId}' does not reference a socket in registry`);
      return [];
    }

    const roomId = socketData.roomId;
    const sockets = this.getSocketsByRoomId(roomId, socketId);

    return sockets;
  }
}

export default Rooms;
