import Promise from 'bluebird';
import _ from 'lodash';

import { matchRoutes } from 'react-router-config';
import { matchPath } from 'react-router-dom';

export default function getInitialData(routes, url, path) {

  const branch = matchRoutes(routes, path);

  const promises = branch.map(({ route, match }) => {

    const fetchData = route.loadData ?
      Promise.method(route.loadData) :
      () => Promise.resolve(null)
    ;

    return fetchData(match)
      .then((data) => {
        return {
          url: match.url,
          data,
        }
      })
  });

  return Promise.all(promises)
    .tap((res) => {
      // console.log('getInitialData', res);
    })
    .tapCatch((err) => {
      console.log('getInitialData', err);
    })
  ;
}
