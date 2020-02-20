/**
 * Jwt
 * 1.0.0
 */

import jwt from 'jsonwebtoken';
import _ from 'lodash';
import Promise from 'bluebird';

Promise.promisifyAll(jwt);

export default class JWT {
  constructor(config) {
    this.config = config || {};

    this.logger = this.config.logger || loggerAuth;
    this.expiresIn = this.config.expiresIn || '20s';
    this.secret = this.config.secret;

    if (!this.secret || !_.isString(this.secret) || !_.size(this.secret)) {
      throw new Error('Jwt class needs to be passed a jwt secret that is a not empty string');
    }
  }

  /*
  ** External functions
  */
  constructPayload(data = {}) {
    const payload = {
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roleCode,
    };
    return payload;
  }

  signJwt(payload) {
    return this.signAsync(payload);
  }

  verify(token, roles) {
    this.logger.info('jwt auth, roles:', roles, ' token:', token);
    return this.verifyAsync(token)
      .then((decoded) => this.validate(decoded, roles))
      .tap((res) => this.logger.debug('[jwt.verify]', res))
      .tapCatch((err) => this.logger.error('[jwt.verify]', err))
    ;
  }

  /*
  ** Internal functions
  */
  validate(decoded, roles = []) {
    this.logger.debug('decoded', decoded);

    // debug - approximate
    const exp = (decoded.exp * 1000) - ((new Date()).getTime());
    this.logger.debug(`[Jwt.validate] Token will expire ${exp}ms`);

    // authentification needed but not authorization
    if (!_.size(roles)) {
      this.logger.debug('[Jwt.validate] no roles needed');
      return Promise.resolve(decoded);
    }

    const common = _.map(roles, (role) => {
      return _.find(decoded.roles, (userRole) => userRole === role);
    });
    const authorized = _.size(_.compact(common));
    this.logger.debug('[Jwt.validate] authorized', authorized);

    if (!authorized) {
      this.logger.warn(`[Jwt.validate] Unsufficient credientials, need ${roles}, has ${decoded.roles}`);
      const error = new Error('Unauthorized: Unsufficient credientials');
      return Promise.reject(error);
    }

    return Promise.resolve(decoded);
  }

  verifyAsync(token) {
    return jwt.verifyAsync(token, this.secret)
      .tap(() => this.logger.debug('[Jwt.verifyAsync] Token is valid'))
    ;
  }

  signAsync(payload) {
    this.logger.debug(payload);
    return jwt.signAsync(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }
}
