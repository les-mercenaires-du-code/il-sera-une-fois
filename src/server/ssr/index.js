import _ from 'lodash';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';
import { ChunkExtractor } from '@loadable/server';
import { renderRoutes } from "react-router-config";
const util = require('util')

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

  // if options.cache is true the generated html page for this url will be cached here and returned directly on next call
  // this should NOT be used to replace an api cache
  // - On Browser, user will still have to wait when navigating to a route that requires data fetching
  const cached = {};

  return async(req, res, next) => {

    const routes = process.env.NODE_ENV === 'production' ?
      require('../client/main').default :
      require('../../shared/routes').default
    ;

    if (_.startsWith(req.path, '/api') || _.startsWith(req.path, '/graphql')) {
      next();
      return;
    }

    const html = cached[req.url];
    if (options.cache && html) {
      res.send(html);
      return;
    }

    console.log('serving request', req.url);
    return getInitialData(routes, req.url, req.path)
      .then(async(staticData) => {

        const staticContext = {
          staticData,
        };

        const statsFile = path.resolve(options.statsFile);
        const extractor = new ChunkExtractor({ statsFile });

        // setting context implies we'll get props.staticContext in our components
        const markup = renderToString(
          extractor.collectChunks(
            <StaticRouter location={req.url} context={staticContext}>
              {renderRoutes(routes)}
            </StaticRouter>,
          ),
        );


        const scriptTags = extractor.getScriptTags(); // or extractor.getScriptElements();
        const html = getHtml(staticContext, markup, scriptTags);

        if (options.cache) {
          cached[req.url] = html;
        }

        res.send(html);
      })
      .catch((err) => {

        return res.redirect('/error');
      })
    ;
  };
}
