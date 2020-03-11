import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Promise from 'bluebird';
import _ from 'lodash';

import AudioStreamer from './AudioStreamer' ;
import Pg from './postgres';
import GraphQLCustomSchema from './graphql';
import Redis from './redis';

import { loadEnv, getConfig } from './config';

(async function() {
  try {
    loadEnv();

    const config = getConfig();
    console.log('Running with NODE_ENV =', config.env);

    const pg = new Pg(config.pg);
    await pg.start();

    const redis = new Redis(config.redis);
    await redis.start();
    await redis.fulfillRedis();

    const graphQl = new GraphQLCustomSchema();
    graphQl.registerDb(pg, 'pg');
    graphQl.registerDb(redis, 'redis');

    const createServer = require('./server.js').default;
    const expressApp = await createServer(graphQl);


    const server = expressApp
      .listen(config.port, () => {
        console.log('Listening at http://localhost:3000/');
      })
    ;

    const audioStream = new AudioStreamer(server, {});

    audioStream.start();
    // console.log('audioStream', audioStream);


  } catch (e) {
    console.error('Fatal error:', e);
  }
})();
