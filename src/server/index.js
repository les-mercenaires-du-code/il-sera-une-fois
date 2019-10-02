import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Promise from 'bluebird';
import _ from 'lodash';

(async function() {
  try {

    console.log('Running with NODE_ENV =', process.env.NODE_ENV);

    const createServer = require('./server.js').default;
    const expressApp = await createServer();

    const server = expressApp
      .listen(3000, () => {
        console.log('Listening at http://localhost:3000/');
      })
    ;

  } catch (e) {
    console.error('Fatal error:', e);
  }
})();
