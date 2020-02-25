import _ from 'lodash';

export const redisPrefix = {
  CARD: 'card',
  ENDING: 'ending',
  HAND: 'hand',
  CARDPLAYED: 'cardPlayed',
  ALREADYPICKEDENDINGS: 'alreadyPickedEndings',
  ACTIVEUSER: 'activeUser',
  PENDINGCARD: 'pendingCard',
  LASTPLAYEDCARD: 'lastPlayedCard',
};

export class Utils {
  constructor(logger) {
    this.logger = logger;
  }

  _addCardToGraveyard(redisDb, roomId, cardId) {
    return redisDb.sadd(this._addPrefixToKey(roomId, redisPrefix.CARDPLAYED), this._addPrefixToKey(cardId, redisPrefix.CARD));
  }

  _addToAlreadyPickedEndingsInRoom(redisDb, roomId, endingId) {
    return redisDb.sadd(this._addPrefixToKey(roomId, redisPrefix.ALREADYPICKEDENDINGS), this._addPrefixToKey(endingId, redisPrefix.ENDING));
  }

  _removeEndingsFromUserHand(redisDb, userId, endingsToRemoves) {
    return redisDb.srem(this._addPrefixToKeys(userId, redisPrefix.HAND), this._addPrefixToKeys(endingsToRemoves, redisPrefix.ENDING));
  }

  _addCardToUserHand(redisDb, userId, cardId, prefix = redisPrefix.CARD) {
    return redisDb.sadd(this._addPrefixToKey(userId, redisPrefix.HAND), this._addPrefixToKey(cardId, prefix))
  }

  _removeCardFromUserHand(redisDb, userId, cardId) {
    return redisDb.srem(this._addPrefixToKey(userId, redisPrefix.HAND), this._addPrefixToKey(cardId, redisPrefix.CARD))
  }

  _setUserActive(redisDb, roomId, userId) {
    return redisDb.set(this._addPrefixToKey(room, redisPrefix.ACTIVEUSER), userId);
  }

  _getPendingCard(redisDb, roomId) {
    return redisDb.get(this._addPrefixToKey(roomId, redisPrefix.PENDINGCARD))
      .catch((err) => {
        if (err.code === 404) {
          return null;
        }

        throw err;
      })
    ;
  }

  _setPendingCard(redisDb, userId, roomId, cardId) {
    return redisDb.set(this._addPrefixToKey(roomId, redisPrefix.PENDINGCARD), { userId, cardId });
  }

  _deletePendingCard(redisDb, roomId) {
    return redisDb.set(this._addPrefixToKey(roomId, redisPrefix.PENDINGCARD), { userId, cardId });
  }

  _getLastPlayedCard(redisDb, roomId) {
    return redisDb.get(this._addPrefixToKey(roomId, redisPrefix.LASTPLAYEDCARD));
  }

  _setLastPlayedCard(redisDb, roomId, card) {
    return redisDb.set(this._addPrefixToKey(roomId, redisPrefix.LASTPLAYEDCARD), card);
  }
  _getCard(redisDb, cardId) {
    return redisDb.get(this._addPrefixToKey(cardId, redisPrefix.CARD));
  }

  async _getRandomsCardsIds(redisDb, unavailableCards, cardType, numberOfCard) {
    const totalCards = await redisDb.scard(`${cardType}Set`);

    const everyIds = _.reduce(Array(totalCards), (acc, _, index) => {
      acc.push(index.toString());
      return acc;
    }, []);

    const cardsLeft = _.difference(everyIds, unavailableCards);

    if (!_.size(cardsLeft)) {
      throw new Error(`[${cardType}] No more cards left in deck`);
    }

    if (_.size(cardsLeft) < numberOfCard) {
      throw new Error(`[${cardType}] Not enough cards left in deck to fulfill request`);
    }

    const acc = [];

    while (_.size(acc) !== numberOfCard) {
      const randomIndex = this._randomIntFromIntervalAndNotIn(0, _.size(cardsLeft) -1);

      if (!_.includes(acc, randomIndex)) {
        acc.push(randomIndex);
      }
    }

    return _.map(acc, randomIndex => cardsLeft[randomIndex]);
  }

  _randomIntFromIntervalAndNotIn(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  _removePrefixFromKey(key, prefix) {
    return _.replace(key, `${prefix}:`, '');
  }

  _removePrefixFromKeys(keys, prefix) {
    return _.map(keys, key => this._removePrefixFromKey(key, prefix));
  }

  _addPrefixToKey(key, prefix) {
    return `${prefix}:${key}`;
  }

  _addPrefixToKeys(keys, prefix) {
    return _.map(keys, key => this._addPrefixToKey(key, prefix));
  }

  _hasPrefix(key, prefix) {
    return _.includes(key, prefix);
  }
}
