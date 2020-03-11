import React, { useState, useEffect } from 'react';
import { css } from '@emotion/core';
import _ from 'lodash';

import Cards from './Cards';
import Users from './Users';
import LastPlayedCard from './LastPlayedCard';
import * as graphqlRequest from '../graphqlRequest';

const styles = {
  cards: css`
    position: absolute;
    bottom: 0;
    left: 0;
  `,
  ending: css`
    position: absolute;
    top: 0;
    left: 0;
  `,
  users: css`
    position: absolute;
    top: 0;
    right: 0;
  `,
  lastPlayedCard: css`
    position: absolute;
    align-items: center;
    justify-content: center;
    display: flex;
    height: 100vh;
    width: 100%;
  `,
};

function Room({ state }) {

  if (!state) {
    return (
      <p>loading</p>
    );
  }

  const hand = _.get(state, ['connectedUser', 'hand'], []);
  const cardsInHand = _.filter(hand, card => card.type !== 'ending');
  const endingsInHand = _.filter(hand, card => card.type === 'ending');
  const [cards, setCards] = useState(cardsInHand);

  const pickCards = (connectedUser, cards, set) => {
    return graphqlRequest.pickCards(connectedUser.room, connectedUser.id, 1)
      .then((data) => set([...cards, ...(data.pickCards || [])]))
    ;
  }

  const [endings, setEnding] = useState(endingsInHand);

  const pickEndings = (connectedUser, _, set) => {
    return graphqlRequest.pickEndings(connectedUser.room, connectedUser.id)
      .then((data) => {
        return set([...(data.pickEndings || [])]);
      })
    ;
  }

  const buttonCondition = !_.size(endings);

  return (
    <div>
      <h2>{state.name}</h2>
      <LastPlayedCard lastPlayedCardStyle={styles.lastPlayedCard} lastPlayedCard={state.lastPlayedCard}/>
      <Users usersStyle={styles.users} users={state.users}/>
      <Cards cardStyle={styles.cards} connectedUser={state.connectedUser} cards={cards} pickCards={pickCards} setCards={setCards} buttonCondition={true}/>
      <Cards cardStyle={styles.ending} connectedUser={state.connectedUser} cards={endings} pickCards={pickEndings} setCards={setEnding} buttonCondition={buttonCondition}/>
    </div>
  )
};

export default Room;
