import _ from 'lodash';
import { Redirect } from 'react-router';
import Promise from 'bluebird';

import App from './App';
import Home from './components/Home';
import Child from './components/Child';
import GrandChild from './components/GrandChild';
import NotFound from './components/NotFound';
import DataProvider from './utils/DataProvider';

const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: Home,
        loadData: () => {

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                test: 'test load data for App',
              })
            }, 400)
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
        path: '*',
        component: NotFound,
        exact: true,
      },
    ],
  },
];



// wrap a route that need data fetching with DataProvider component
function getWrapped(route) {
  const Component = route.component;

  // fetched data will be made available in Component.props.state
  const fn = (props) => {
    return (
      <DataProvider {...props}>
        <Component/>
      </ DataProvider>
    );
  }
  Object.defineProperty(fn, "name", {
    value: `${Component.name}Wrapped`,
  });

  return fn;
}

//  recursivly wrap all routes that need data fetching with DataProvider component
function wrapRoutes(routes) {

  _.each(routes, (route) => {

    if (route.loadData) {
      route.component = getWrapped(route);
    }

    if (route.routes) {
      wrapRoutes(route.routes);
    }
  });
}

// mutate object
wrapRoutes(routes);

export default routes;
