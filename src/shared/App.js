import React from 'react';
import { renderRoutes } from 'react-router-config';

import Navbar from './components/Navbar';

// main entry point
function App({ route }) {

  return (
    <div>
      <Navbar />
      { renderRoutes(route.routes) }
    </div>
  );
}

export default App;
