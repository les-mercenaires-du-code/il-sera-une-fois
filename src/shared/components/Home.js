import React from 'react';
import { Link } from 'react-router-dom';
import { css } from '@emotion/core';

import Loader from '../utils//Loader';

const styles = {
  main: css`
    padding: 80px;
    display: flex;
    flex-direction: column;
  `,
};

const Home = (props) => {

  if (props.error) {
    //  handle error here or redirect to general error page
    return <p>Home error: {props.error.message}</p>
  }

  if (!props.state) {
    return (
      <main css={styles.main}>
        <Loader />
      </main>
    );
  }

  return (
    <main css={styles.main}>
      <p>{props.state.test}</p>
    </main>
  );
};

export default Home;
