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
        }
      }
    }
  `
);
