import { css } from '@emotion/core';

const styles = {
  main: css`
    padding: 80px;
    border: 4px double #1C6EA4;
    list-style: none;
    margin: 10px;
  `,
};

function Card({ state }) {

  if (!state) {
    return (
      <p>loading</p>
    );
  }

  return (
    <div css={styles.main}>
      <h2>{state.name}</h2>
      <h2>{state.type}</h2>
      <h2>{state.interruption}</h2>
    </div>
  )
};

export default Card;
