import pg from 'pg-promise';
import Promise from 'bluebird';
import _ from 'lodash';
import Joi from '@hapi/joi';

const mockLogger = {
  info: console.log,
  warn: console.log,
  error: console.log,
  verbose: console.log,
  debug: console.log,
};

const connectionSchema = Joi.object().keys({
  host: Joi.string().required(),
  port: Joi.string().required(),
  user: Joi.string().required(),
  password: Joi.string().required(),
  database: Joi.string().required(),
  ssl: Joi.boolean().required(),
});

export default class Pg {
  constructor(params, logger = mockLogger) {

    // const connectOpts = {
    //   host: this.params.endpoint,
    //   port: this.params.port,
    //   user: this.params.user,
    //   password: this.params.password,
    //   database: this.params.schema,
    //   ssl: true,
    // };
    const connectOpts = {
      host: 'localhost',
      port: '5432',
      user: 'postgres',
      password: 'password',
      database: 'ilseraunefois',
      ssl: true,
    };

    this.db = null;
    this.formatter = null;
    this.pendingPromise = null;
    this.logger = logger;

    try {
      Joi.assert(connectOpts, connectionSchema);
      this.connectOpts = connectOpts;
    } catch (e) {
      this.logger.error('[Pg] err: ', e);
      throw new Error('[Pg] invalid parameters');
    }

    if (process.env.NODE_ENV === 'development') {
       delete this.connectOpts.ssl;
    }

    this.logger.info('[Pg.constructor] Connexion au serveur sqlDB with opts.', _.omit(this.connectOpts, ['password']));
  }

  start() {

    if (this.db) {
      return Promise.resolve();
    }

    if (this.pendingPromise) {
      return this.pendingPromise;
    }

    this.pendingPromise = new Promise((resolve, reject) => {
      this.pgp = pg({
        // use bluebird as promise
        promiseLib: Promise,
      });

      this.db = this.pgp(this.connectOpts);

      return this.db.connect()
        .then((client) => {
          client.done();
          this.formatter = this.pgp.as;
          this.pendingPromise = null;
          this.logger.info(`[Pg.start]: Connection to pg established on: ${this.connectOpts.host}:${this.connectOpts.port}`);
          resolve();
        })
        .catch(reject)
      ;
    });

    return this.pendingPromise;
  }

  stop() {

    if (!this.db && !this.pendingPromise) {
      this.logger.info('[Pg.stop] Pg was not running.');
      return Promise.resolve();
    }

    if (this.pendingPromise) {
      return this.pendingPromise
        .then(() => this.stop())
      ;
    }

    this.db.$pool && this.db.$pool.end();
    this.db = null;
    this.pgp = null;
    this.formatter = null;
    this.logger.info('[Pg.stop] Pg has been stopped.');
    return Promise.resolve();
  }

  check() {

    const clients = _.get(this.db, '$pool._clients');

    if (!_.isArray(clients)) {
      this.logger.verbose('Pg.check: no clients');
      return Promise.resolve(false);
    }

    const allConnected = _.every(this.db.$pool._clients, (client) => {
      return client._connected;
    });

    allConnected && this.logger.verbose('[Pg.check] All clients are connected');

    return Promise.resolve(allConnected);
  }
}
