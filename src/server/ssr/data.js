import Promise from 'bluebird';
import _ from 'lodash';

import { matchRoutes } from 'react-router-config';
import { matchPath } from 'react-router-dom';

export default function getInitialData(routes, url, path) {

  const branch = matchRoutes(routes, path);

  const promises = branch.map(({ route, match }) => {

    return route.loadData ?
      Promise.method(route.loadData(match)) :
      Promise.resolve(null)
    ;
  });

  return Promise.all(promises)
    .tap((res) => {
      console.log('getInitialData', res);
    })
    .catch((err) => {
      console.log('getInitialData', err);
    })
  ;
}
