import _ from 'lodash';

export const getRoomById = _.template(
  `
    {
      roomById(roomId: <%= id %>) {
        id
        name
        users {
          id
          name
        }
      }
    }
  `
);

export const getRoomByIdWithCurrentUserHand = _.template(
  `
    query roomById($roomId: ID, $userId: ID) {
      roomById(roomId: $roomId) {
        id
        name
        users(userId: $userId) {
          id
          name
          handSize
          active
        }
        connectedUser(userId: $userId) {
          id
          name
          hand {
            id
            name
            interruption
            type
          }
          room
          active
        }
        lastPlayedCard {
          id
          name
          type
        }
      }
    }
  `
);

export const getRooms = _.template(
  `
    {
      roomsList {
        id
        name
        nbUsersConnected
      }
    }
  `
);

export const joinRoom = _.template(
  `
    mutation joinRoom($roomId: ID, $userId: ID) {
      joinRoom(roomId: $roomId, userId: $userId) {
        name
      }
    }
  `
)

export const pickCards = _.template(
  `
    mutation pickCards($roomId: ID, $userId: ID, $nbCardToDraw: Int) {
      pickCards(roomId: $roomId, userId: $userId, nbCardToDraw: $nbCardToDraw) {
        id
        name
        type
        interruption
      }
    }
  `
);

export const pickEndings = _.template(
  `
    mutation pickEndings($roomId: ID, $userId: ID) {
      pickEndings(roomId: $roomId, userId: $userId) {
        id
        name
        type
        interruption
      }
    }
  `
);
