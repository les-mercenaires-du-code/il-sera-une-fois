/**
 * Logger
 * 1.0.0
 */

import winston from 'winston';
import _ from 'lodash';
import moment from 'moment';
import Promise from 'bluebird';

export default class Loggers {

  constructor(config = {}) {

    this.options = config.options;
    this.register = _.omit(config, 'options');

    this._options = {
      timestamp: () => moment().format('DD/MM - hh:mm:ss'),
      colorize: true,
      prettyPrint: true,
      // stringify: true,
      // json: true,
      silent: false,
      humanReadableUnhandledException: true,
    };

    // used to compute space based on lowest active level
    this.biggestLevel = 5;
    this.levels = {
      debug: 7,
      verbose: 7,
      info: 5,
      warn: 5,
      error: 5,
    };

    console.log('->', this.options);
  }

  /**
   * Initialize then start loggers
  */
  async init(stop = Promise.resolve) {

    this._registry = {};

    try {
      let process = 0;
      let defaultLogger;

      _.forEach(this.register, (val, key) => {

        const tmp = {
          level: val.level,
          format: winston.format.simple(),
          transports: [],
        };

        if (val.console) {
          tmp.transports.unshift(new winston.transports.Console(_.merge({
            key,
            level: val.level,
          }, this._options, val.console)));
        }

        const logger = winston.createLogger(tmp);
        logger._name = key;


        if (val.process) {
          defaultLogger = key;
          process++;
        }

        const level = this.levels[val.level];
        this.biggestLevel = this.biggestLevel < level ? level : this.biggestLevel;

        this._registry[key] = logger;
        this._registry[key].prefix = val.prefix ? `[${val.prefix}] -` : '';
        this._registry[key]._prefix = val.prefix ? [val.prefix] : [];
      });

      if (process !== 1) {
        throw new Error('One logger (but only one) should set process: true');
      }

      this.defaultLogger = this._registry[defaultLogger];

      return this._registry;
    } catch (e) {

      // this.logger.error('start: init loggers failure', e);
      throw e;
    }
  }

  createWrap(defaultLogger, options = {}) {

    const loggerConfig = _.isString(options) ? {
      ...this.register[options],
      name: options,
      prefix: undefined,
    } : {
      ...this.register[options.name],
      ...options,
      prefix: options.prefix,
    };


    console.log('11111', loggerConfig);

    const logger = this._registry[loggerConfig.name];

    const valid = typeof logger === 'object' &&
      _.isFunction(logger.error) &&
      _.isFunction(logger.warn) &&
      _.isFunction(logger.info) &&
      _.isFunction(logger.verbose) &&
      _.isFunction(logger.debug)
    ;

    const use = valid ? logger : this.defaultLogger;
    const prefix = [];

    this.match(use._prefix)
      .on(_.isString, () => prefix.push(use._prefix))
      .on(_.isArray, () => prefix.push(...use._prefix))
      .otherwise();

    this.match(loggerConfig.prefix)
      .on(_.isString, () => prefix.push(loggerConfig.prefix))
      .on(_.isArray, () => prefix.push(...loggerConfig.prefix))
      .otherwise();

    const wrappedLogger = this.wrapLogger(use, { ...loggerConfig, prefix });
    console.log(wrappedLogger);
    return wrappedLogger;
  }

  wrapLogger(logger, options) {

    logger.verbose = logger.verbose || logger.info;
    logger.debug = logger.debug || logger.info;


    const show = _.isUndefined(options.console) ? true : Boolean(options.console);
    const len = _.size(options.prefix);

    // change wrapper just for fun
    const pre = _.reduce(options.prefix, (acc, p, i) => {
      switch (i) {
        case 0: {
          const add = len === 1 ? `[${p}]` : `[${p}`;
          acc.push(add);
          break;
        }
        case 1:
          acc.push(`|${p}]`);
          break;
        case 2:
          acc.push(`(${p})`);
          break;
        default:
          acc.push(` ${p}: `);
      }
      return acc;
    }, []);

    const prefix = _.join(pre, '');
    // const prefix = _.join(_.map(options.prefix, (p) => `[${p}]`), '');
    const wrap = (level) => {
      return (...args) => {
        // if (!show) {
        //   return;
        // }

        // align logs based on verbose length
        const spaceLen = this.biggestLevel - _.size(level);
        let space = '';
        for (let i = 0; i < spaceLen; i++) {
          space += ' ';
        }

        logger[level](...args);
      };
    };

    const levels = [
      'error',
      'warn',
      'info',
      'verbose',
      'debug',
    ];

    const wrappedLogger = { prefix, _prefix: options.prefix };
    _.each(levels, (level) => {
      wrappedLogger[level] = wrap(level);
    });

    wrappedLogger._name = logger._name;
    return wrappedLogger;
  }

  matched(x) {
    return {
      on: () => this.matched(x),
      otherwise: () => x,
    };
  }

  match(x) {
    return {
      on: (predicate, fn) => (predicate(x) ?
        this.matched(fn(x)) :
        this.match(x))
      ,
      otherwise: (fn) => _.isFunction(fn) ?
        fn(x) :
        fn
      ,
    };
  }
}
