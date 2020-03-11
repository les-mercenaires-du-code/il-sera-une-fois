import React from 'react';
import {
  Route,
  Redirect,
} from 'react-router-dom';


// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, user, ...rest }) {

  const authenticated = user && user.authenticated;

  return (
    <Route
      {...rest}
      render={({ location }) =>
        authenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
// function PrivateRoute({ children, user, ...rest }) {
//
//   const authenticated = user && user.authenticated || false;
//   console.log(user);
//   if (!user) {
//     console.log('user is not defined');
//   }
//
//   return (
//     <Route
//       {...rest}
//       render={({ location }) =>
//         authenticated ? (
//           children
//         ) : (
//           <Redirect
//             to={{
//               pathname: '/login',
//               state: { from: location },
//             }}
//           />
//         )
//       }
//     />
//   );
// }

export default PrivateRoute;
