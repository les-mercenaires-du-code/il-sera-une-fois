import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Promise from 'bluebird';
import _ from 'lodash';

import Pg from './postgres';
import GraphQlWrapper from './graphql';

(async function() {
  try {

    console.log('Running with NODE_ENV =', process.env.NODE_ENV);

    const pg = new Pg({});
    await pg.start();

    const graphQl = new GraphQlWrapper(pg.db);
    graphQl.init();

    const createServer = require('./server.js').default;
    const expressApp = await createServer(graphQl);

    const server = expressApp
      .listen(3000, () => {
        console.log('Listening at http://localhost:3000/');
      })
    ;

  } catch (e) {
    console.error('Fatal error:', e);
  }
})();
