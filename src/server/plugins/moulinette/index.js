/*
  Moulinette
  1.0.0
  register apis from static config files
 */

import _ from 'lodash';
import pathUtils from 'path';

export default class Moulinette {
  constructor(config, scope) {
    this.config = config || {};
    this.logger = config.logger || loggerApp;

    // used to versions api urls
    this.config.version = config.version || '';

    // interface used for auth checks
    this.auth = config.auth || { enabled: false };

    this.scope = scope || {};
    this.scope.swagger = {};
  }

  register(expressApp, ...apis) {
    if (_.isUndefined(expressApp) || _.isNull(expressApp)) {
      this.logger.error('[Moulinette] error: expressApp need to exists');
      return;
    }

    if (_.isUndefined(apis) || !_.isArray(apis)) {
      this.logger.error('[Moulinette] error: apis need to exists');
      return;
    }

    const data = _.reduce(apis, (acc, api) => {
      if (_.isArray(api)) {
        _.each(api, (ap) => {
          acc.push(ap);
        });
        return acc;
      }

      acc.push(api);
      return acc;
    }, []);
    this.expressApp = expressApp;
    this._register(data);
  }

  _register(...configs) {
    _.each(configs, (config) => {
      const apis = _.isArray(config) ? config : [config];

      _.forEach(apis, (api) => {
        const middlewares = [];

        try {
          if (this.auth.enabled) {
            const authMiddleware = this.auth.getMiddleware(api.disableAuth, api.roles);
            middlewares.push(authMiddleware);
          }

          this.registerRoute(api.path, api.method, api.handler, middlewares);
          this.updateSwagger(api.path, api.method, api.description);

        } catch (e) {
          this.logger.error('[Moulinette] Failed to registerRoute', e);
        }
      });
    });
  }

  registerRoute(path, method, handler, middlewares = []) {
    const paths = _.isArray(path) ?
      _.map(path, path => {
        return pathUtils.join('/api', this.config.version, path);
      }) :
      pathUtils.join('/api', this.config.version, path)
    ;

    const cb = _.bind(handler, this.scope);
    this.expressApp[method.toLowerCase()](paths, middlewares, cb);

    this.logger.info(`[Moulinette]: Registered method ${method} for route ${paths}`)
    ;
  }

  updateSwagger(path, method, description) {

    if (!this.scope.swagger[path]) {
      this.scope.swagger[path] = {};
    }

    if (!this.defaultDescription) {
      this.defaultDescription = 'todo: add a description field to route definition';
    }

    const key = `${path}.${method.toLowerCase()}`;
    const methodExists = !_.isUndefined(this.scope.swagger[path][method.toLowerCase()]);
    if (this.scope.swagger[path] && methodExists) {
      throw new Error(`[Moulinette] Method ${method} for route ${path} already exists!`);
    }

    _.set(this.scope.swagger, key, description || this.defaultDescription);
  }
}
