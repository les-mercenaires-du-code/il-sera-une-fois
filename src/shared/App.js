import React from 'react';
import { renderRoutes } from 'react-router-config';

import Navbar from './components/Navbar';

import getCollection from './store';

// main entry point
// - load router from config file
// - create shared collection
// - define app layout
function App(props) {

  // create shared user
  // if using sub routes you will need to pass user as 2nd params to renderRoutes or import store and call getCollection
  const [user, userActions ] = getCollection('user');

  return (
    <div>
      <Navbar />
      { renderRoutes(props.route.routes, { user, userActions }) }
    </div>
  );
}

export default App;
