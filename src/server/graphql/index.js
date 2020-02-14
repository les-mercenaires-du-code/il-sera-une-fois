// Remove when logger is injected
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
        name: { type: GraphQLString, },
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
            this.logger.debug('Query user', parentValue, args, query);
            return this.db.one(query)
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
        roomById: {
          type: RoomType,
          args: { id: { type: GraphQLID }},
          resolve: (parentValue, args) => {
            const query = `SELECT * FROM "rooms" WHERE id=${args.id}`;
            this.logger.debug('Query roomById', parentValue, args, query);
            return this.db.one(query)
              .catch((err) => {
                this.logger.error(err);
                throw err;
              })
            ;
          },
        },
        roomByName: {
          type: RoomType,
          args: { name: { type: GraphQLString }},
          resolve: (parentValue, args) => {
            const query = `SELECT * FROM "rooms" WHERE name='${args.name}'`;
            this.logger.debug('Query roomByName', parentValue, args, query);
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
            const query = `SELECT * FROM "rooms"`;
            this.logger.debug('Query roomsList', parentValue, args, query);
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
            const query = `SELECT * FROM "cards"`;
            this.logger.debug('Query cardsList', parentValue, args, query);
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
            const query = `SELECT * FROM "endings"`;
            this.logger.debug('Query endingsList', parentValue, args, query);
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
