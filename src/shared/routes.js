import { Redirect } from 'react-router';

import App from './App';
import Home from './components/Home';
import Child from './components/Child';
import GrandChild from './components/GrandChild';
import NotFound from './components/NotFound';

const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: Home,
      },
      {
        path: "/child/:id",
        component: Child,
        routes: [
          {
            path: "/child/:id/grand-child",
            component: GrandChild,
          },
          {
            path: "/child/:id/*",
            component: (props) => {
              console.log(props);
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

export default routes;
