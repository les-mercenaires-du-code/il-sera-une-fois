import _ from 'lodash';

const mockLogger = {
  info: console.log,
  warn: console.log,
  error: console.log,
  verbose: console.log,
  debug: console.log,
};

export default class GraphQLCustomQueries {
  constructor(logger) {
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

  getUserCards(user, redisDb) {
    if (!redisDb) {
      throw new Error(`[queries][getUsersCards] redisDb is missing`);
    }

    const prefix = 'hand:'
    const key = 'hand:' + user.id;

    return redisDb.smembers(key)
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

    console.log('3333333333', roomId);

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

  // pickCard is getting a card whose not in players hand and not in the cardPlayed of the room
  // this way we do not have to manage a full set of card for each room
  pickCard(roomId, userId, pgDb, redisDb) {
    return this.getUsersFromRoom(roomId, pgDb)
      .then((users) => {
        const handsKeys = _.map(users, user => `hand:${user.id}`);
        const roomKey = `cardPlayed:${roomId}`;
        return redisDb.sunion([...handsKeys, roomKey]);
      })
      .then((notAvailableCardsKeys) => this.removePrefixFromKeys(notAvailableCardsKeys, 'card:'))
      .then(async (notAvailableCards) => {
        const totalCardNumber = await redisDb.scard('cardSet'); // TODO maybe cache it?
        const randomCardId = this.randomIntFromIntervalAndNotIn(0, totalCardNumber - 1, notAvailableCards);
        return randomCardId;
      })
      .then((randomCardId) => {
        return redisDb.get(`card:${randomCardId}`) // getting the card
          .then((card) => redisDb.sadd(`hand:${userId}`, `card:${randomCardId}`).return(card)) // adding it to the player's hand
        ;
      })
    ;
  }

  randomIntFromIntervalAndNotIn(min, max, notIn) { // min and max included
    const randomVal = Math.floor(Math.random() * (max - min + 1) + min).toString();
    if (_.includes(notIn, randomVal)) {
      return this.randomIntFromIntervalAndNotIn(min, max, notIn);
    }

    return randomVal;
  }

  removePrefixFromKey(key, prefix) {
    return _.replace(key, prefix, '');
  }

  removePrefixFromKeys(keys, prefix) {
    return _.map(keys, key => this.removePrefixFromKey(key, prefix));
  }
}
