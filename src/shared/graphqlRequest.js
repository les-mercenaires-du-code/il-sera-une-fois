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
    .catch((err) => {
      console.log('getRoom request failed', err);
    })
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
    .catch((err) => {
      console.log('getRooms request failed', err);
    })
  ;
}

export function pickCard(roomId, userId) {
  console.log('launching request pickCard');
  const query = queries.pickCard();

  const variables = { roomId, userId };

  console.log(query, variables);

  return client.request(query, variables)
    .then((data) => {
      console.log('pickCard request success', data);
      return data;
    })
    .catch((err) => {
      console.log('pickCard request failed', err);
    })
  ;
}
