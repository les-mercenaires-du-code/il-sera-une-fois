import React from 'react';
import { renderRoutes } from 'react-router-config';
import { css } from '@emotion/core';

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
function App(props) {

  return (
    <div css={styles.main}>
      <Navbar />
      <div css={styles.components}>
        { renderRoutes(props.route.routes) }
      </div>
    </div>
  );
}

export default App;
