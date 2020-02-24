import GraphQLCustomQueries from './queries';
import GraphQlWrapper from './graphQLWrapper';

import Promise from 'bluebird';
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

export default class GraphQLCustomSchema extends GraphQlWrapper {
  constructor(logger) {
    super(logger);

    this.queries = new GraphQLCustomQueries(this.logger);

    this.CardType = new GraphQLObjectType({
      name: 'Card',
      fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        interruption: { type: GraphQLBoolean },
      }),
    });

    this.RoomType = new GraphQLObjectType({
      name: 'Room',
      fields: () => ({
        id: { type: GraphQLID, },
        name: { type: GraphQLString, },
        users: {
          type: GraphQLList(this.UserType),
          resolve: (parentValue) => {
            return this.getDb('pg')
              .then((pgDb) => this.queries.getUsersFromRoom(parentValue.id, pgDb))
            ;
          },
        },
      }),
    });

    this.UserType = new GraphQLObjectType({
      name: 'User',
      fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        room: { type: GraphQLID }, // roomId
        hand: {
          type: GraphQLList(this.CardType),
          resolve: (parentValue) => {
            return this.getDb('redis')
              .then((redisDb) => this.queries.getUserCards(parentValue, redisDb))
            ;
          },
        },
      }),
    });

    this.RootQuery = new GraphQLObjectType({
      name: 'RootQueryType',
      fields: {
        // user: {
        //   type: this.UserType,
        //   args: { id: { type: GraphQLID }},
        //   resolve: (parentValue, args) => {
        //     const query = `SELECT * FROM "users" WHERE id=${args.id}`;
        //     this.logger.debug('Query user', parentValue, args, query);
        //     return this.db.one(query)
        //       .catch((err) => {
        //         this.logger.error(err);
        //         throw err;
        //       })
        //     ;
        //   },
        // },
        roomById: {
          type: this.RoomType,
          args: { id: { type: GraphQLID }},
          resolve: (_, args) => {
            return this.getDb('pg')
              .tap(() => this.logger.debug('Query roomById', args))
              .then((pgDb) => this.queries.getRoomById(args.id, pgDb))
            ;
          },
        },
        // roomByName: {
        //   type: this.RoomType,
        //   args: { name: { type: GraphQLString }},
        //   resolve: (parentValue, args) => {
        //     const query = `SELECT * FROM "rooms" WHERE name='${args.name}'`;
        //     this.logger.debug('Query roomByName', parentValue, args, query);
        //     return this.db.one(query)
        //       .catch((err) => {
        //         this.logger.error(err);
        //         throw err;
        //       })
        //     ;
        //   },
        // },
        roomsList: {
          type: GraphQLList(this.RoomType),
          resolve: (parentValue) => {
            return this.getDb('pg')
              .tap(() => this.logger.debug('Query roomsList', parentValue))
              .then((pgDb) => this.queries.roomsList(pgDb))
            ;
          },
        },
        pickCard: {
          type: this.CardType,
          args: {
            roomId: { type: GraphQLID },
            userId: { type: GraphQLID },
          },
          resolve: (_, args) => {
            return Promise.all([this.getDb('pg'), this.getDb('redis')])
              .tap(() => this.logger.debug('Query pickCard', args))
              .then(([pgDb, redisDb]) => this.queries.pickCard(args.roomId, args.userId, pgDb, redisDb))
            ;
          },
        }
        // cardsList: {
        //   type: GraphQLList(this.CardType),
        //   resolve: (parentValue, args) => {
        //     const query = `SELECT * FROM "cards"`;
        //     this.logger.debug('Query cardsList', parentValue, args, query);
        //     return this.db.many(query)
        //       .catch((err) => {
        //         this.logger.error(err);
        //         throw err;
        //       })
        //     ;
        //   },
        // },
        // endingsList: {
        //   type: GraphQLList(this.EndingType),
        //   resolve: (parentValue, args) => {
        //     const query = `SELECT * FROM "endings"`;
        //     this.logger.debug('Query endingsList', parentValue, args, query);
        //     return this.db.many(query)
        //       .catch((err) => {
        //         this.logger.error(err);
        //         throw err;
        //       })
        //     ;
        //   },
        // },
      },
    });

    // this.RootMutation = new GraphQLObjectType({
    //   name: 'RootMutation',
    //   fields: {
    //     updateRoomName: {
    //       type: RoomType,
    //       args: {
    //         id: { type: GraphQLID },
    //         name: { type: GraphQLString },
    //       },
    //       resolve: (parentValue, args) => {
    //         const query = `
    //           UPDATE "rooms"
    //           SET name='${args.name}'
    //           WHERE id=${args.id}
    //           RETURNING *
    //         `;
    //         this.logger.debug('Mutation updateRoomName', args, query);
    //         return this.db.one(query)
    //           .catch((err) => {
    //             this.logger.error(err);
    //             throw err;
    //           })
    //         ;
    //       },
    //     },
    //     joinRoom: {
    //       type: UserType,
    //       args: {
    //         roomId: { type: GraphQLID },
    //         userId: { type: GraphQLID },
    //       },
    //       resolve: (parentValue, args) => {
    //         const query = `
    //           UPDATE "users"
    //           SET room='${args.roomId}'
    //           WHERE id=${args.userId}
    //           RETURNING *
    //         `;
    //         this.logger.debug('Mutation joinRoom', args, query);
    //         return this.db.one(query)
    //           .catch((err) => {
    //             this.logger.error(err);
    //             throw err;
    //           })
    //         ;
    //       }
    //     },
    //     leaveRoom: {
    //       type: UserType,
    //       args: {
    //         userId: { type: GraphQLID },
    //       },
    //       resolve: (parentValue, args) => {
    //         const query = `
    //           UPDATE "users"
    //           SET room=null
    //           WHERE id=${args.userId}
    //           RETURNING *
    //         `;
    //         this.logger.debug('Mutation leaveRoom', args, query);
    //         return this.db.one(query)
    //           .catch((err) => {
    //             this.logger.error(err);
    //             throw err;
    //           })
    //         ;
    //       },
    //     },
    //   },
    // });

    this.schema = new GraphQLSchema({
      query: this.RootQuery,
      // mutation: RootMutation,
    });
  }
}
