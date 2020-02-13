// import GraphQlWrapper from './schema.js';
//
// export default [GraphQlWrapper];

const mockLogger = {
  info: console.log,
  warn: console.log,
  error: console.log,
  verbose: console.log,
  debug: console.log,
};

const graphql = require('graphql');

const {
   GraphQLObjectType,
   GraphQLID,
   GraphQLString,
   GraphQLBoolean,
   GraphQLList,
   GraphQLSchema
} = graphql;

export default class GraphQlWrapper {
  constructor(db, logger = mockLogger) {
    this.db = db;
    this.logger = logger;
  }

  init() {
    const CardType = new GraphQLObjectType({
      name: 'Card',
      fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        interruption: { type: GraphQLBoolean },
      }),
    });

    const EndingType = new GraphQLObjectType({
      name: 'Ending',
      fields: () => ({
        id: { type: GraphQLID },
        ending: { type: GraphQLString },
      }),
    });

    const RoomType = new GraphQLObjectType({
      name: 'Room',
      fields: () => ({
        id: { type: GraphQLID, },
        users: {
          type: GraphQLList(UserType),
          resolve: (parentValue, args) => {
            const query = `SELECT id, name FROM "users" WHERE room=${parentValue.id}`;
            return this.db.many(query)
              .then((data) => {
                // Transform data here if needed
                return data;
              })
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
      }),
    });

    const UserType = new GraphQLObjectType({
      name: 'User',
      fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        room: { type: GraphQLID }, // roomId
      }),
    });

    // define how to retrieve each type of data defined
    const RootQuery = new GraphQLObjectType({
      name: 'RootQueryType',
      fields: {
        user: {
          type: UserType,
          args: { id: { type: GraphQLID }},
          resolve: (parentValue, args) => {
            const query = `SELECT * FROM "users" WHERE id=${args.id}`;
            return this.db.one(query)
              .then((res) => {
                console.log(res);
                return res;
              })
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
        room: {
          type: RoomType,
          args: { id: { type: GraphQLID }},
          resolve: (parentValue, args) => {
            const query = `SELECT * FROM "rooms" WHERE id=${args.id}`;
            return this.db.one(query)
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
        roomsList: {
          type: GraphQLList(RoomType),
          resolve: (parentValue, args) => {
            const query = `SELECT * FROM "rooms"`; // maybe "ilseraunefois".rooms
            return this.db.many(query)
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
        cardsList: {
          type: GraphQLList(CardType),
          resolve: (parentValue, args) => {
            const query = `SELECT * FROM "cards"`; // maybe "ilseraunefois".cards
            return this.db.many(query)
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
        endingsList: {
          type: GraphQLList(EndingType),
          resolve: (parentValue, args) => {
            const query = `SELECT * FROM "endings"`; // maybe "ilseraunefois".endings
            return this.db.many(query)
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
      },
    });

    this.schema = new GraphQLSchema({
      query: RootQuery,
    });
  }

}
