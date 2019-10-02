import _ from 'lodash';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';
import { ChunkExtractor } from '@loadable/server';
import { renderRoutes } from "react-router-config";

import getHtml from './html.js';
import getInitialData from './data.js';


const defaultOptions = {
  hot: true,
  statsFile: './src/stats.json',
};

export default function ssr(options = defaultOptions) {

  if (!_.isString(options.statsFile)) {
    throw new Error('statsFile is required to be a string.');
  }

  if (options.hot && options.compiler) {
    const hot = require('./hot.js').default;
    hot(options.compiler);
  }

  return async(req, res, next) => {

    const routes = process.env.NODE_ENV === 'production' ?
      require('../client/main').default :
      require('../../shared/routes').default
    ;

    if (_.startsWith(req.path, '/api')) {
      console.log('api call returning');
      next();
      return;
    }

    console.log('serving request', req.url);
    return getInitialData(routes, req.url, req.path)
      .then(async(staticData) => {

        console.log('-----------> staticData', staticData);

        const context = {
          staticData,
        };

        const statsFile = path.resolve(options.statsFile);
        const extractor = new ChunkExtractor({ statsFile });

        const markup = renderToString(
          extractor.collectChunks(
            <StaticRouter location={req.url} context={context}>
              {renderRoutes(routes)}
            </StaticRouter>,
          ),
        );


        const scriptTags = extractor.getScriptTags(); // or extractor.getScriptElements();
        const html = getHtml(context, markup, scriptTags);

        res.send(html);
      })
      .catch(next)
    ;
  };
}
