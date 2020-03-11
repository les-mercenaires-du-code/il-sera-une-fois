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

const CardType = new GraphQLObjectType({
  name: 'Card',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    interruption: { type: GraphQLBoolean },
  }),
});

export default CardType;
