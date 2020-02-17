import React from 'react';
import { renderRoutes } from 'react-router-config';
import { css } from '@emotion/core';
import getCollection from './store';

import Navbar from './components/Navbar';

const styles = {
  main: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
  `,
  components: css`
    flex: 1;
    position: relative;
  `,
}

// main entry point
// - load router from config file
// - create shared collection
// - define app layout
function App(props) {

  // create shared user
  // if using sub routes you will need to pass user as 2nd params to renderRoutes or import store and call getCollection
  const [user, userActions ] = getCollection('user');

  return (
    <div css={styles.main}>
      <Navbar />
      <div css={styles.components}>
        { renderRoutes(props.route.routes, { user, userActions }) }
      </div>
    </div>
  );
}

export default App;
