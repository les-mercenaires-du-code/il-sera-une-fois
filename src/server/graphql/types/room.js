const graphql = require('graphql');

const {
   GraphQLObjectType,
   GraphQLID,
   GraphQLInt,
   GraphQLString,
   GraphQLBoolean,
   GraphQLList,
   GraphQLSchema
} = graphql;

import UserType from './user';

const RoomType = new GraphQLObjectType({
  name: 'Room',
  fields: () => ({
    id: { type: GraphQLID, },
    name: { type: GraphQLString, },
    users: {
      type: GraphQLList(UserType),
      resolve: (parentValue) => {
        return this.getDb('pg')
          .then((pgDb) => this.queries.getUsersFromRoom(parentValue.id, pgDb))
        ;
      },
    },
  }),
});

export default RoomType;
