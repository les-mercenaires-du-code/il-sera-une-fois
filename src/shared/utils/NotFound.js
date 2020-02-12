import React from 'react';
import { css } from '@emotion/core';


const styles = {
  main: css`
    padding: 40px;
    display: flex;
    flex-direction: column;
  `,
};

export default function({ location }) {
  return (
    <main css={styles.main}>
      <p>Route Not Found test</p>
    </main>
  );
}
