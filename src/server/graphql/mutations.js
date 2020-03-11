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

export default class GraphQLCustomMutations extends Utils {
  constructor(logger, queries) {
    super(logger);
    this.logger = logger;
    this.queries = queries;
  }

  joinRoom(pgDb, userId, roomId) {
    const query = `
      UPDATE "users"
      SET room='${roomId}'
      WHERE id=${userId}
      RETURNING *
    `;

    return pgDb.one(query)
      .tapCatch((err) => this.logger.error(err))
    ;
  }

  leaveRoom(pgDb, userId) {
    const query = `
      UPDATE "users"
      SET room=null
      WHERE id=${userId}
      RETURNING *
    `;

    return pgDb.one(query)
      .tapCatch((err) => this.logger.error(err))
    ;
  }

  // pickCard is getting a card whose not in players hand and not in the cardPlayed of the room
  // this way we do not have to manage a full set of card for each room
  pickCards(roomId, userId, nbCardToDraw, pgDb, redisDb) {
    return this.queries.getUsersFromRoom(roomId, pgDb)
      .then((users) => {
        const handsKeys = _.map(users, user => this._addPrefixToKey(user.id, redisPrefix.HAND));
        const roomKey = this._addPrefixToKey(roomId, redisPrefix.CARDPLAYED);
        return redisDb.sunion([...handsKeys, roomKey]);
      })
      .then((notAvailableCardsKeys) => _.filter(notAvailableCardsKeys, card => !this._hasPrefix(card, redisPrefix.ENDING))) // we filter cards who are endings
      .then((notAvailableCardsKeys) => this._removePrefixFromKeys(notAvailableCardsKeys, redisPrefix.CARD))
      .then((notAvailableCards) => this._getRandomsCardsIds(redisDb, notAvailableCards, redisPrefix.CARD, nbCardToDraw))
      .then((randomCardsIds) => {
        return redisDb.mget(this._addPrefixToKeys(randomCardsIds, redisPrefix.CARD))
          .then((cards) => Promise.map(cards, card => this._addCardToUserHand(redisDb, userId, card.id).return(card)))
        ;
      })
    ;
  }

  pickEndings(redisDb, roomId, userId) {
    return redisDb.smembers(this._addPrefixToKey(roomId, redisPrefix.ALREADYPICKEDENDINGS))
      .catch((err) => {
        if (err.code === 404) {
          return [];
        }

        throw err;
      })
      .then((alreadyPickedEndings) => this._removePrefixFromKeys(alreadyPickedEndings, redisPrefix.ENDING))
      .then((alreadyPickedEndings) => this._getRandomsCardsIds(redisDb, alreadyPickedEndings, redisPrefix.ENDING, 2)) // TODO i dislike this also
      .then((randomsEndingsIds) => {
        return redisDb.mget(this._addPrefixToKeys(randomsEndingsIds, redisPrefix.ENDING))
          .then((endings) => {
            // adding endings draw to user's hand
            const addToUserHand = Promise.map(endings, ending => this._addCardToUserHand(redisDb, userId, ending.id, redisPrefix.ENDING));
            // adding to already picked endings
            const addToAlreadyPickedEndingsInRoom = Promise.map(endings, ending => this._addToAlreadyPickedEndingsInRoom(redisDb, roomId, ending.id));
            // could have used multiAndExec but it really doesn't matter that much
            return Promise.all(addToUserHand, addToAlreadyPickedEndingsInRoom)
              .return(endings)
            ;
          })
        ;
      })
    ;
  }

  setEnding(redisDb, userId, endingId) {
    return redisDb.smembers(this._addPrefixToKey(userId, redisPrefix.HAND))
      .then((cardsInHands) => _.filter(cardsInHands, cards => this._hasPrefix(card, redisPrefix.ENDING))) // we get only ends
      .then((endingsInHand) => this._removePrefixFromKeys(endingsInHand, redisPrefix.ENDING))
      .then((endingsInHand) => {
        const endingsToRemoves = _.difference(endingsInHand, [endingId.toString()]); // TODO i really dislike this

        if (!_.size(endingsToRemoves)) {
          return false;
        }

        return this._removeEndingsFromUserHand(redisDb, userId, endingsToRemoves);
      })
    ;
  }

  // TODO need to check coherence data maybe? (user in room and isActive? plus if card is in his hand)
  playCard(redisDb, userId, roomId, cardId) {
    return this._getPendingCard(redisDb, roomId)
      .then((pendingCardInfo) => {
        if (!pendingCardInfo) {
          // there is no pending card so we set it
          return this._setPendingCard(redisDb, userId, roomId, cardId);
        }

        throw new Error('There is already a card waiting for validation');
      })
    ;
  }



  playInterruptionCard(redisDb, userId, roomId, cardId) {
    return this._getPendingCard(redisDb, roomId)
      .then(async (pendingCardInfo) => {
        if (pendingCardInfo) {
          throw new Error('A card is waiting for validation, wait until it\'s validated to play an interruption card');
        }

        const lastPlayedCard = await this._getLastPlayedCard(redisDb, roomId);
        const cardPlayed = await this._getCard(redisDb, cardId);

        if (!cardPlayed.interruption) {
          throw new Error('Card is not an interruption');
        }

        if (cardPlayed.type !== lastPlayedCard.type) {
          throw new Error('Card played type does not match last card played type');
        }

        return this._setLastPlayedCard(redisDb, roomId, { ...cardPlayed, userId, timestamp: Date.now(), })
          .then(() => this._addCardToGraveyard(redisDb, roomId, cardId))
          .then(() => this._removeCardFromUserHand(redisDb, userId, cardId))
          .then(() => this._setUserActive(redisDb, roomId, userId))
        ;
      })
    ;
  }
}
