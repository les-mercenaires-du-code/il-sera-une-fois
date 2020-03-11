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

import CardType from './card';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    room: { type: GraphQLID }, // roomId
    hand: {
      type: GraphQLList(CardType),
      resolve: (parentValue) => {
        return this.getDb('redis')
          .then((redisDb) => this.queries.getUserCards(parentValue, redisDb))
        ;
      },
    },
  }),
});

export default UserType;
