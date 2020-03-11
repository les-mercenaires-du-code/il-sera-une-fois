import _ from 'lodash';
import Promise from 'bluebird';

import Player from './Player';

class Players {

  constructor(audioContex, options = {}) {

    this._maxPlayers = 5;
    this._audioCtx = audioContex;
    this._registry = {};
    this._ids = [];
  }

  // add player in registry if it's not already
  register(id) {

    if (!_.isString(id)) {
      console.log('cannot register a player if id is not a string');
      return
    }

    if (_.includes(this._ids, id)) {
      console.log(`${id} is already registered`);
      return;
    }

    const player = new Player(this._audioCtx);
    this._registry[id] = player;
    this._ids.push(id);

    console.log(`registered player: ${id}`);
    return player;
  }

  // remove player from registry if it's registerd
  // TODO: enforce _maxPlayers
  unregister(id) {

    if (!_.isString(id)) {
      console.log('cannot register a player if id is not a string');
      return
    }

    if (!_.includes(this._ids, id)) {
      console.log(`${id} is not registered`);
      return;
    }

    const player = this._registry[id];
    if (player.ready) {
      console.log(`player ${id}  need to be stopped before being unregistered`);
      return;
    }

    this._ids = _.without(this._ids, id);
    delete this._registry[id];
    console.log(`unregistered player: ${id}`);
  }

  // if id is given init one player
  // if not init all players
  async init(id) {

    const ids = id ? [id] : this._ids;

    console.log('initializing ids', ids);

    return Promise.map(ids, async(id) => {
      const player = this._registry[id];
      return await player.init();
    });
  }


  // if id is given start one player
  // if not start all players
  start(id) {

    const ids = id ? [id] : this._ids;
    console.log('starting ids', ids);

    return Promise.map(ids, async(id) => {
      const player = this._registry[id];
      await player.start();
    });
  }

  // if id is given stop one player
  // if not stop all players
  stop(id) {

    const ids = id ? [id] : this._ids;
    console.log('stopping ids', ids);

    return Promise.map(ids, async(id) => {
      const player = this._registry[id];
      await player.stop();
    });
  }
}

export default Players;
