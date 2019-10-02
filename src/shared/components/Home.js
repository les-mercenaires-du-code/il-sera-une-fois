import React from 'react';
import { Link } from 'react-router-dom';
import { css } from '@emotion/core';

import Loader from './Loader';


const styles = {
  main: css`
    padding: 80px;
    display: flex;
    flex-direction: column;
  `,
};

export default (props) => {

  return (
    <main css={styles.main}>
      <Loader />
    </main>
  );
};
