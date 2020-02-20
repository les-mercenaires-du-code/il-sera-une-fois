/**
 * Auth
 * 1.0.0
 */

import _ from 'lodash';

export default class Auth {
  constructor(config, jwt) {

    this.config = config || {};
    this.logger = this.config.logger || loggerAuth;
    this.enabled = this.config.enabled || false;
    this.defaultRole = this.config.defaultRole || [];
    this.jwt = jwt;

    if (this.enabled) {
      this.logger.warn('[AUTH] Auth will be set up for all incoming requests.');
    } else {
      this.logger.warn('[AUTH] Auth will not be checked for incoming requests.');
    }

    this.authTypes = {
      Bearer: _.isUndefined(this.config.jwt) ? true : this.config.jwt,
    };
  }

  getMiddleware(routeDisable, roles) {

    const defaultAuth = (req, res, next) => {
      if (this.enabled && routeDisable) {
        this.logger.debug(`auth overide for route: ${req.path}`);
      }
      next();
    };

    if (routeDisable || !this.enabled) {
      return defaultAuth;
    }

    const normalizedRoles = _.isArray(roles) ? roles : this.defaultRole;
    const partial = _.partial(this.middleware, normalizedRoles);

    return _.bind(partial, this);
  }

  middleware(roles, req, res, next) {

    const auth = req.get('authorization');
    if (!auth) {
      this.logger.debug('[Auth.middleware] Authorization header is missing');
      return this.reject(res);
    }

    const tmp = _.compact(auth.split(' '));
    if (_.size(tmp) !== 2) {
      this.logger.debug('[Auth.middleware] Bad format for Authorization header');
      return this.reject(res);
    }

    const type = tmp[0];
    if (!this.authTypes[type]) {
      this.logger.debug(`[Auth.middleware] Requested invalid auth type: ${type}`);
      this.logger.debug('[Auth.middleware] accepted types', this.authTypes);
      return this.reject(res);
    }

    const token = tmp[1];
    if (type === 'Bearer') {
      return this.jwtAuth(roles, token, req, res, next);
    }

    return this.reject(res);
  }

  jwtAuth(roles, token, req, res, next) {

    return this.jwt.verify(token, roles)
      .then((decoded) => {
        // add this to the request for use in apis.
        req.scope = {};
        req.scope.decoded = decoded;
        req.scope.token = token;
        next();
      })
      .catch(() => this.reject(res))
    ;
  }

  reject(res, code = 401) {

    return res.status(code).json({ message: 'Unauthorized' });
  }
}
