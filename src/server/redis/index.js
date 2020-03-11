import redis from 'redis'; // https://github.com/NodeRedis/node_redis
import Promise from 'bluebird';
import _ from 'lodash';
import path from 'path';

import RedisRepository from './redisRepository';

const messagesTypes = ['error', 'ready', 'connect', 'reconnecting', 'warning', 'end'];

export const mockLogger = {
  info: console.log,
  warn: console.log,
  error: console.log,
  debug: console.log,
  verbose: console.log,
}

export default class RedisDB {
  constructor(params, logger = mockLogger) {
    this.params = params;
    this.logger = logger;

    this.db = new RedisRepository({}, logger = mockLogger);

    this.params.pingInterval = this.params.pingInterval || 60 * 1000;
    this.pingInterval = null; // store ping interval function
    this.ownListeners = []; // redis listeners
    this.awaiting = null; // store connection pending function
    this.awaitingInterval = null; // store the set interval for connection pending
    this.pendingPromise = null; // store the promise to resolve waiting for ready redis event
    this.ready = false; // toggled on 'ready' event
    this.redisClient = null; // store redis client

    this.reconnectAttempt = 0;
    this.maxNumberAttempt = _.get(params, 'maxNumberAttempt', 100);
    this.timeBetweenEachRetry = _.get(params, 'timeBetweenEachRetry', 3000);

    if (!this.params.port || !this.params.host || !this.params.password) {
      throw new Error('[RedisDB.constructor] No port, host or password found.');
    }

    // Promisify redis lib
    Promise.promisifyAll(redis.RedisClient.prototype);
    Promise.promisifyAll(redis.Multi.prototype);

    this.redisOptions = {
      host: params.host,
      port: params.port,
    };

    this.redisOptions.auth_pass = params.password; //eslint-disable-line

    if (this.params.tls) { // disable in local mode
      this.redisOptions.tls = {
        servername: params.host,
      };
    }
  }

  stop(reconnect = false) {

    if (!reconnect) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.pendingPromise) {
      this.clean();
      return Promise.resolve();
    }

    if (!this.ready || !this.redisClient) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.redisClient.quit(() => {
        resolve();
      });
    });
  }

  retryStrategy(options) {

    this.reconnectAttempt++;
    this.ready = false;
    this.logger.warn('[RedisDB.retryStrategy] Connection has been lost, initiating retry');
    this.logger.debug('[RedisDB][retryStrategy] Event retry strategy fired with options:', options);

    if (!options.error) { // the final end, fire the retry strategy without error
      this.logger.error('[RedisDB.retryStrategy] Connection has been stopped without error, retrying anyway');
    }

    if (this.reconnectAttempt > this.maxNumberAttempt) {
      this.logger.warn('[RedisDB.retryStrategy] max Number Attempt reached, stopping retry.');
      return;
    }

    // this need to be launched at the next frame, it will clear the listeners and the RedisClient
    this.timeout = setTimeout(() => {

      clearTimeout(this.timeout);
      this.timeout = null;
      this.removeAllListener();
      // properly kill redisClient
      // while reconnecting (and therefore no connection to the redis server exists)
      // it is going to end the connection right away instead of resulting in further reconnections!
      // All offline commands are going to be flushed with an error in that case.
      this.redisClient.quit(() => {
       return this.changeRedisClient();
      });

    }, this.timeBetweenEachRetry);

    return ;
  }

  init() {

    this.redisOptions['retry_strategy'] = this.retryStrategy.bind(this);
    this.logger.info(`[RedisDB.constructor] Connexion au serveur ${this.params.host}:${this.params.port}.`);
    this.redisClient = redis.createClient(this.redisOptions);
    this.updateRepository();
    this.initCallbackListener();
    this.clientEvents();
  }

  clean() {

    if (this.awaitingInterval) {
      clearInterval(this.awaitingInterval);
      this.awaitingInterval = null;
    }

    this.awaiting = false;
    this.pendingPromise = null;
  }

  start() {

    if (this.ready) {
      this.logger.verbose('[RedisDB.start] RedisDB is already started and ready.');
      return Promise.resolve();
    }

    // if it is currently trying to start, we resolve this one because we do not want
    // to restart the subscribers until the original pending promise watching the ready event
    // is resolved
    if (this.pendingPromise) {
      this.logger.verbose('[RedisDB.start] RedisDB is starting.');
      return Promise.resolve();
    }

    if (!this.redisClient) {
      this.logger.verbose('[RedisDB.start] Initiating redis connection');
      this.init();
    }

    // this is the pending promise who will only resolve when the ready event from redis is fired
    // the next part of the promise is the restart of each subscribers
    this.pendingPromise = new Promise((resolve, reject) => {

      this.awaiting = () => {

        if (this.reconnectAttempt > this.maxNumberAttempt) {
          this.logger.warn('[RedisDB.retryStrategy] maxNumberAttempt reached, stopping retry.');
          this.clean();
          const error = new Error('redisdb connection: max number attempt reached');
          error.fatal = true;
          reject(error);
          return;
        }

        this.logger.verbose('[RedisDB.start.awaiting] Checking redis ready state.');
        if (!this.ready) {
          this.logger.warn('[RedisDB] Awaiting ready event from Redis');
          return ;
        }

        this.updateRepository(this.redisClient);
        this.logger.verbose('[RedisDB.start.awaiting] Received ready event, clearing interval and resolving.');
        this.clean();
        return resolve();
      };

      // each $timeBetweenEachRetry, check if we received ready event
      this.awaitingInterval = setInterval(this.awaiting, this.timeBetweenEachRetry);
    });

    return this.pendingPromise
      .tap(() => this.logger.info('[RedisDB.start] Redis has been properly started'))
      .catch(err => {
        this.logger.error(`[RedisDB.start] An error occured while starting redis ${err.message}`, err);
        if (err.fatal) {
          process.exit(1); // TODO find a cleaner way to quit
        }
      })
    ;
  }

  clientEvents() {
    if (!this.redisClient) {
      throw new Error('[RedisDB] Cannot add event listenners, RedisDB Client is undefined.');
    }

    _.forEach(this.ownListeners, listener => {
      this.redisClient.addListener(listener.message, listener.listener);
    });
  }

  initCallbackListener() {

    this.errorCallback = (err) => {
      this.logger.error('[RedisDB] Client error event:', err);
    };

    this.readyCallback = () => {
      this.ready = true;
      this.reconnectAttempt = 0;
      this.logger.info('[RedisDB] Client ready event.');

      if (this.awaiting) {
        this.logger.verbose('[RedisDB.readyCallback] start has been called and is awaiting resolution, forcing resolve');
        // resolving pending promise right away
        this.awaiting();
      }

      this.initPingInterval();
    };

    this.connectCallback = () => {
      this.logger.info('[RedisDB] Client connect event.');
    };

    this.reconnectingCallback = (reconnecting) => {
      const attempt = _.get(reconnecting, 'attempt', null);
      const errorCode = _.get(reconnecting, 'error.code', 'none');
      const address = _.get(reconnecting, 'error.address', '');
      this.logger.warn(`[RedisDB] Client reconnecting event : attempt ${attempt} error` +
        ` ${errorCode} ${address ? `for address ${address} ` : ''}and host ${this.redisOptions.host}`)
      ;
    };

    this.warningCallback = (warning) => {
      this.logger.warn('[RedisDB] Client warning event.', warning);
    };

    this.endCallback = () => {
      this.ready = false;
      clearInterval(this.pingInterval);
      this.logger.info('[RedisDB] Client end event.');
    };

    // this way we can remove the listeners properly when switching redisClient
    this.ownListeners = _.map(messagesTypes, message => {
      const listener = this[message + 'Callback'];
      return {
        message,
        listener,
      };
    });
  }

  removeAllListener() {
    _.forEach(this.ownListeners, listener => {
      this.redisClient.removeListener(listener.message, listener.listener);
    });

    this.logger.debug('[RedisDB][removeAllListener] Listeners removed');
  }

  initPingInterval() {
    this.pingInterval = setInterval(() => {
      this.ping();
    }, this.params.pingInterval);
  }

  ping() {
    if (!this.redisClient) {
      this.logger.warn('[RedisDB.ping] RedisDB Client is undefined, cannot ping');
      return ;
    }

    if (!this.ready) {
      this.logger.warn('[RedisDB.ping] RedisDB Client is not ready, cannot ping');
      return ;
    }

    this.logger.verbose('[RedisDB.ping] Ping to RedisDB Client...');
    this.redisClient.ping();
  }

  changeRedisClient() {

    this.logger.verbose('[RedisDB.changeRedisClient]', {
      reconnectAttempt: this.reconnectAttempt,
      maxNumberAttempt: this.maxNumberAttempt,
    });

    this.redisClient = null;

    this.logger.info(`[RedisDB.changeRedisClient] Tentative de connexion au serveur redis ${this.redisOptions.host}:${this.redisOptions.port}.`);
    this.redisClient = redis.createClient(this.redisOptions);

    this.updateRepository();
    this.clientEvents();

    if (this.pendingPromise) {
      return Promise.resolve();
    }

    return this.start();
  }

  check() {
    const ready = Boolean(this.ready);
    this.logger.debug('[redisDB.check] ready?', {
      ready,
    });
    return Promise.resolve(ready);
  }

  // this will update the redis client for each repositories who have registered
  updateRepository() {
    this.db._updateClient(this.redisClient);
  }

  async fulfillRedis() {
    const redisSize = await this.db.dbsize();

    if (redisSize) {
      this.logger.info(`[REDIS][fulfillRedis] Redis seems not empty, found ${redisSize} keys`);
      return Promise.resolve();
    }

    let cards;
    try {
      const destination = path.join('..', '..', '..', 'initDb', 'redis', 'cards.json');
      cards = require(destination);
    } catch(e) {
      this.logger.error(`[REDIS][fulfillRedis] Unable to get file at path ${destination}`, e);
    }

    const cardsList = cards.cards;

    const splittedCards = _.reduce(cardsList, (acc, card) => {
      if (card.type === 'ending') {
        acc.endings.push(card);
        return acc;
      }

      acc.others.push(card);
      return acc;
    }, { endings: [], others: [] });

    const endingsKeys = _.map(splittedCards.endings, (ending, index) => {
      ending.id = index; // mutating
      return `ending:${index}`;
    });

    const othersKeys = _.map(splittedCards.others, (card, index) => {
      card.id = index; // mutating
      return `card:${index}`;
    });

    return this.db.mset(endingsKeys, splittedCards.endings) // add every ending in redis
      .then(() => this.db.mset(othersKeys, splittedCards.others)) // add every other card in redis
      .then(() => Promise.map(endingsKeys, (ending) => this.db.sadd('endingSet', ending))) // create a set of every ending
      .then(() => Promise.map(othersKeys, (card) => this.db.sadd('cardSet', card))) // create a set of every other card
    ;
  }

}
