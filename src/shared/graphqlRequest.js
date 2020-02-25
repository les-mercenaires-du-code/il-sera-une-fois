import { GraphQLClient  } from 'graphql-request';

import * as queries from './queries';

const client = new GraphQLClient('http://localhost:3000/graphql');

export function getRoom(id) {
  console.log('launching request getRoom with params :', id);
  const query = queries.getRoomById({id});

  console.log(query);

  return client.request(query)
    .then((data) => {
      console.log('getRoom request success', data);
      return data;
    })
    .tapCatch((err) => console.log('getRoom request failed', err))
  ;
}

export function getRoomByIdWithCurrentUserHand(roomId, userId) {
  console.log('launching request getRoomByIdWithCurrentUserHand with params :', { roomId, userId });
  const query = queries.getRoomByIdWithCurrentUserHand();

  const variables = { roomId, userId };
  console.log(query, variables);

  return client.request(query, variables)
    .then((data) => {
      console.log('getRoomByIdWithCurrentUserHand request success', data);
      return data;
    })
    .tapCatch((err) => console.log('getRoomByIdWithCurrentUserHand request failed', err))
  ;
}

export function joinRoom(roomId, userId) {
  console.log('launching request joinRoom with params :', { roomId, userId });
  const query = queries.joinRoom();

  const variables = { roomId, userId };
  console.log(query, variables);

  return client.request(query, variables)
    .then((data) => {
      console.log('joinRoom request success', data);
      return data;
    })
    .tapCatch((err) => console.log('joinRoom request failed', err))
  ;
}

export function getRooms() {
  console.log('launching request getRooms');
  const query = queries.getRooms();

  console.log(query);

  return client.request(query)
    .then((data) => {
      console.log('getRooms request success', data);
      return data;
    })
    .tapCatch((err) => console.log('getRooms request failed', err))
  ;
}

export function pickCards(roomId, userId, nbCardToDraw) {
  console.log('launching request pickCards');
  const query = queries.pickCards();

  const variables = { roomId, userId, nbCardToDraw };

  console.log(query, variables);

  return client.request(query, variables)
    .then((data) => {
      console.log('pickCards request success', data);
      return data;
    })
    .tapCatch((err) => console.log('pickCards request failed', err))
  ;
}

export function pickEndings(roomId, userId) {
  console.log('launching request pickEndings');
  const query = queries.pickEndings();

  const variables = { roomId, userId };

  console.log(query, variables);

  return client.request(query, variables)
    .then((data) => {
      console.log('pickEndings request success', data);
      return data;
    })
    .tapCatch((err) => console.log('pickEndings request failed', err))
  ;
}
