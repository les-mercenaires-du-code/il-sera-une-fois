import Promise from 'bluebird';

// Remove when logger is injected
const mockLogger = {
  info: console.log,
  warn: console.log,
  error: console.log,
  verbose: console.log,
  debug: console.log,
};

export default class GraphQlWrapper {
  constructor(logger = mockLogger) {
    this.dbs = {};
    this.logger = logger;
  }

  registerDb(db, name) {
    if (!name || !db) {
      throw new Error('[graphql][registerDb] registerDb need a client and a name');
    }

    if (this.dbs[name]) {
      throw new Error(`[graphql][registerDb] A db is already registered at this name ${name}`);
    }

    this.dbs[name] = db;
  }

  getDb(name) {
    return new Promise((resolve, reject) => {
      if (!this.dbs[name]) {
        reject(new Error(`[graphql][getDb] No db found with this name ${name}`));
      }

      return this.dbs[name].check()
        .then((res) => {
          if (res) {
            resolve(this.dbs[name].db);
          }

          reject(new Error(`[graphql][getDb] Db ${name} is unavailable`));
        })
      ;
    });
  }
}
