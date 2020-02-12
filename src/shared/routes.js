import _ from 'lodash';
import { Redirect } from 'react-router';
import Promise from 'bluebird';

import App from './App';
import Home from './components/Home';
import Child from './components/Child';
import GrandChild from './components/GrandChild';

import NotFound from './utils/NotFound';
import DataProvider from './utils/DataProvider';
import Errors from './utils/Errors';
import ErrorBoundary from './utils/ErrorBoundary';

const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: Home,
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
        component: Child,
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
            component: GrandChild,
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
        component: Errors,
        exact: true,
      },
      {
        path: '*',
        component: NotFound,
        exact: true,
      },
    ],
  },
];



// wrap a route that need data fetching with DataProvider component
function getWrapper(route) {

  const Component = route.component;

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
