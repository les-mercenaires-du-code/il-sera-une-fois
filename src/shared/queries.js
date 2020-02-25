import _ from 'lodash';

export const getRoomById = _.template(
  `
    {
      roomById(id: <%= id %>) {
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

export const getRooms = _.template(
  `
    {
      roomsList {
        id
        name
        users {
          id
          name
          room
          hand {
            id
            name
          }
        }
      }
    }
  `
);

export const pickCard = _.template(
  `
    query pickCard($roomId: ID, $userId: ID ) {
      pickCard(roomId: $roomId, userId: $userId) {
        id
        name
        type
        interruption
      }
    }
  `
);
