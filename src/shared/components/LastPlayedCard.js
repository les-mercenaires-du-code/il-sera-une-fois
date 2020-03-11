import { css } from '@emotion/core';

const styles = {
  main: css`
    padding: 80px;
    border: 4px double #1C6EA4;
    list-style: none;
    margin: 10px;
  `,
};

function LastPlayedCard({ lastPlayedCardStyle, lastPlayedCard }) {

  if (!lastPlayedCard || !lastPlayedCard.id) {
    return (
      <div css={lastPlayedCardStyle}>
        <div css={styles.main}>
          <h2> No card played yet </h2>
        </div>
      </div>
    );
  }

  return (
    <div css={lastPlayedCardStyle}>
      <div css={styles.main}>
        <h2>{lastPlayedCard.name}</h2>
        <h2>{lastPlayedCard.type}</h2>
        <h2>{lastPlayedCard.interruption}</h2>
      </div>
    </div>
  )
};

export default LastPlayedCard;
