import React from 'react';
import _ from 'lodash';
import { css } from '@emotion/core';


const styles = {
  main: css`
    padding: 40px;
    display: flex;
    flex-direction: column;
  `,
};

export default function({ location }) {

  // ${_.get(location, 'state.from')} using this will need some work to render server side
  const defaultErr = `Error: The route could not be rendered.`;
  const msg = _.get(location, 'state.message', defaultErr);


  return (
    <main css={styles.main}>
      <p>{msg}</p>
    </main>
  );
}
