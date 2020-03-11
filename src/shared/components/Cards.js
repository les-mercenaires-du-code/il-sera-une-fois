import React, { useState, useEffect } from 'react';
import { css } from '@emotion/core';
import _ from 'lodash';

import Card from './Card';
import * as graphqlRequest from '../graphqlRequest';

const styles = {
  main: css`
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
  `,
};

function Cards({ cardStyle, connectedUser, cards, pickCards, buttonCondition, setCards }) {

  if (!connectedUser) {
    return (
      <p>loading</p>
    );
  }

  console.log('cards and buttonCondition', cards, buttonCondition)

  return (
    <div css={cardStyle}>
      {buttonCondition ? <button type="button" onClick={() => pickCards(connectedUser, cards, setCards)}>Pick a card</button> : null}
      <ul css={styles.main}>
        {_.map(cards, card =>
          <li key={card.id}>
            <Card state={card}/>
          </li>
        )}
      </ul>
    </div>
  )
};

export default Cards;
