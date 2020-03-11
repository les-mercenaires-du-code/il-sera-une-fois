import _ from 'lodash';
import Promise from 'bluebird';

import { redisPrefix, Utils } from './utils'

const mockLogger = {
  info: console.log,
  warn: console.log,
  error: console.log,
  verbose: console.log,
  debug: console.log,
};

export default class GraphQLCustomQueries extends Utils {
  constructor(logger) {
    super(logger);

    this.logger = logger;
  }

  getUsersFromRoom(roomId, pgDb) {
    if (!pgDb) {
      throw new Error(`[queries][getUsersFromRoom] pgDb is missing`);
    }

    const query = `SELECT id, name FROM "users" WHERE room=${roomId}`;
    return pgDb.many(query)
      .catch((err) => {
        if (err.code === 0) { // empty data
          return [];
        }

        this.logger.error(err);
        throw err;
      })
    ;
  }

  getUser(pgDb, userId) {
    if (!pgDb) {
      throw new Error(`[queries][getUser] pgDb is missing`);
    }

    const query = `SELECT * FROM "users" WHERE id=${userId}`;
    return pgDb.one(query);
  }

  getCountUsersInRoom(pgDb, roomId) {
    if (!pgDb) {
      throw new Error(`[queries][getCountUsersInRoom] pgDb is missing`);
    }

    const query = `SELECT COUNT(*) FROM "users" WHERE room=${roomId}`;
    return pgDb.one(query)
      .then((res) => _.get(res, 'count', 0)) // pgDb return an object with a field count
    ;
  }

  getHandSize(redisDb, id) {
    if (!redisDb) {
      throw new Error(`[queries][getHandSize] redisDb is missing`);
    }

    return redisDb.scard(this._addPrefixToKey(id, redisPrefix.HAND));
  }

  getUserCards(user, redisDb) {
    if (!redisDb) {
      throw new Error(`[queries][getUsersCards] redisDb is missing`);
    }

    return redisDb.smembers(this._addPrefixToKey(user.id, redisPrefix.HAND))
      .then((cardsIds) => {
        if (!_.size(cardsIds)) {
          return [];
        }

        return redisDb.mget(cardsIds);
      })
      .catch((err) => {
        if (err.code === 404) {
          return [];
        }

        throw err;
      })
    ;
  }

  getRoomById(roomId, pgDb) {
    const query = `SELECT * FROM "rooms" WHERE id=${roomId}`;
    return pgDb.one(query)
      .catch((err) => {
        this.logger.error(err);
        throw err;
      })
    ;
  }

  roomsList(pgDb) {
    const query = `SELECT * FROM "rooms"`;
    return pgDb.many(query)
      .catch((err) => {
        if (err.code === 0) { // empty data
          return [];
        }

        this.logger.error(err);
        throw err;
      })
    ;
  }

  getActiveUser(redisDb, { room, id }) {
    if (!room) {
      return Promise.resolve(false);
    }

    return redisDb.get(this._addPrefixToKey(room, redisPrefix.ACTIVEUSER))
      .then((res) => res === id)
      .catch((err) => {
        if (err.code === 404) {
          return false;
        }

        throw err;
      })
    ;
  }

  getLastPlayedCardFromRoom(redisDb, roomId) {
    return this._getLastPlayedCard(redisDb, roomId)
      .catch(err => {
        if (err.code === 404) {
          return {};
        }

        throw err;
      })
    ;
  }

}
