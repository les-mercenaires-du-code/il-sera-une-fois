import _ from 'lodash';
import Promise from 'bluebird';
import { Redirect } from 'react-router';
import loadable from '@loadable/component';

import DataProvider from './utils/DataProvider';
import ErrorBoundary from './utils/ErrorBoundary';

import * as graphqlRequest from './graphqlRequest';

const routes = [
  {
    // async => component: loadable(props => import('./ComponentName')),
    // sync => component: Component,
    component: loadable(props => import('./App')),
    routes: [
      {
        path: '/',
        exact: true,
        component: loadable(props => import('./components/Home')),
        loadData: (match) => {

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                test: 'test load data for App',
              })
            }, 700)
          });
        }
      },
      {
        path: '/rooms',
        exact: true,
        component: loadable(props => import('./components/Rooms')),
        loadData: () => {

          return graphqlRequest.getRooms();
        },
      },
      {
        path: '/room/:id',
        component: loadable(props => import('./components/Room')),
        loadData: (args) => {

          return graphqlRequest.getRoom(_.get(args, 'params.id'))
            .then((data) => data.roomById)
          ;
        },
      },
      {
        path: "/child/:id",
        component: loadable(props => import('./components/Child')),
        loadData: () => {

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                test: 'test load data for Child',
              })
            }, 400)
          });
        },
        routes: [
          {
            path: "/child/:id/grand-child",
            component: loadable(props => import('./components/GrandChild')),
            loadData: () => {

              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve({
                    test: 'test load data for GrandChild',
                  })
                }, 400)
              });
            }
          },
          {
            path: "/child/:id/*",
            component: (props) => {
              return (
                <Redirect to="/nimp" />
              );
            }
          },
        ]
      },
      {
        path: '/error',
        component: loadable(props => import('./utils/Errors')),
        exact: true,
      },
      {
        path: '*',
        component: loadable(props => import('./utils/NotFound')),
        exact: true,
      },
    ],
  },
];



// wrap a route that need data fetching with DataProvider component
function getWrapper(route) {

  let Component = route.component;

  if (!route.loadData) {
    const fn = (props) => (
      <ErrorBoundary {...props}>
        <Component {...props} />
      </ErrorBoundary>
    );

    Object.defineProperty(fn, "name", {
      value: 'RouteWrapper',
    });

    return fn;
  }

  // fetched data will be made available in Component.props.state
  const fn = (props) => {
    return (
      <ErrorBoundary {...props}>
        <DataProvider {...props}>
          <Component/>
        </DataProvider>
      </ErrorBoundary>
    );
  }

  Object.defineProperty(fn, "name", {
    value: 'RouteWrapper',
  });

  return fn;
}

//  recursivly wrap all routes that need data fetching with DataProvider component
function wrapRoutes(routes) {

  _.each(routes, (route) => {

    route.component = getWrapper(route);
    if (route.routes) {
      wrapRoutes(route.routes);
    }
  });
}

// mutate object
wrapRoutes(routes);

export default routes;
