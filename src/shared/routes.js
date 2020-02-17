import _ from 'lodash';
import Promise from 'bluebird';
import { Redirect } from 'react-router';
import loadable from '@loadable/component';

import DataProvider from './utils/DataProvider';
import ErrorBoundary from './utils/ErrorBoundary';
import PrivateRoute from './utils/PrivateRoute';

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
        path: '/dashboard',
        component: loadable(props => import('./components/Dashboard')),
        exact: true,
        private: true,
      },
      {
        path: '/login',
        component: loadable(props => import('./components/Login')),
        exact: true,
      },
      {
        path: '/error',
        component: loadable(props => import('./components/Errors')),
        exact: true,
      },
      {
        path: '*',
        component: loadable(props => import('./components/NotFound')),
        exact: true,
      },
    ],
  },
];



// wrap a route that need data fetching with DataProvider component
// wrap private route with PrivateRoute cmp if needed
// add ErrorBoundary to all routes
function getWrapper(route) {

  let Component = route.component;

  if (!route.loadData) {
    const fn = (props) => (
      <ErrorBoundary {...props}>
        {route.private ?
          <PrivateRoute {...props}><Component {...props} /></PrivateRoute> :
          <Component {...props} />
        }
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
        {route.private ?
          <PrivateRoute {...props}>
            <DataProvider {...props}>
              <Component/>
            </DataProvider>
          </PrivateRoute> :
          <DataProvider {...props}>
            <Component/>
          </DataProvider>
        }
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
