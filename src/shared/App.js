import React from 'react';
import { renderRoutes } from 'react-router-config';

import Navbar from './components/Navbar';

// main entry point
function App(props) {

  return (
    <div>
      <Navbar />
      { renderRoutes(props.route.routes) }
    </div>
  );
}

export default App;
