import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Promise from 'bluebird';
import _ from 'lodash';

import Pg from './postgres';
import GraphQlWrapper from './graphql';
import { loadEnv, getConfig } from './config';

(async function() {
  try {
    loadEnv();

    const config = getConfig();
    console.log('Running with NODE_ENV =', config.env);

    const pg = new Pg(config.pg);
    await pg.start();

    const graphQl = new GraphQlWrapper(pg.db);
    graphQl.init();

    const createServer = require('./server.js').default;
    const expressApp = await createServer(graphQl);

    const server = expressApp
      .listen(config.port, () => {
        console.log('Listening at http://localhost:3000/');
      })
    ;

  } catch (e) {
    console.error('Fatal error:', e);
  }
})();
