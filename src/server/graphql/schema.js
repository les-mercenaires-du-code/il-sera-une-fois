import GraphQLCustomQueries from './queries';
import GraphQLCustomMutations from './mutations';
import GraphQlWrapper from './graphQLWrapper';

import Promise from 'bluebird';
import _ from 'lodash';

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
    this.mutations = new GraphQLCustomMutations(this.logger, this.queries); // mutation need queries

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
          args: { userId: { type: GraphQLID }},
          resolve: (parentValue, { userId }) => {
            return this.getDb('pg')
              .then((pgDb) => this.queries.getUsersFromRoom(parentValue.id, pgDb))
              .then((usersList) => _.filter(usersList, users => _.toString(users.id) !== userId)) // need to work on type graphqlId who's a string ...
            ;
          },
        },
        nbUsersConnected: {
          type: GraphQLInt,
          resolve: (parentValue) => {
            return this.getDb('pg')
              .then((pgDb) => this.queries.getCountUsersInRoom(pgDb, parentValue.id))
            ;
          },
        },
        connectedUser: {
          type: this.UserType,
          args: { userId: { type: GraphQLID }},
          resolve: (_, args) => {
            return this.getDb('pg')
              .then((pgDb) => this.queries.getUser(pgDb, args.userId))
            ;
          }
        },
        lastPlayedCard: {
          type: this.CardType,
          resolve: (parentValue) => {
            return this.getDb('redis')
              .then((redisDb) => this.queries.getLastPlayedCardFromRoom(redisDb, parentValue.id))
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
        handSize: {
          type: GraphQLInt,
          resolve: (parentValue) => {
            return this.getDb('redis')
              .then((redisDb) => this.queries.getHandSize(redisDb, parentValue.id))
            ;
          },
        },
        active: {
          type: GraphQLBoolean,
          resolve: (parentValue) => {
            return this.getDb('redis')
              .then((redisDb) => this.queries.getActiveUser(redisDb, parentValue))
            ;
          },
        },
      }),
    });

    this.RootQuery = new GraphQLObjectType({
      name: 'RootQueryType',
      fields: {
        roomById: {
          type: this.RoomType,
          args: {
            roomId: { type: GraphQLID },
            userId: { type: GraphQLID },
          },
          resolve: (_, { roomId, userId }) => {
            return this.getDb('pg')
              .tap(() => this.logger.debug('Query roomById', { roomId }))
              .then((pgDb) => this.queries.getRoomById(roomId, pgDb))
            ;
          },
        },
        roomsList: {
          type: GraphQLList(this.RoomType),
          resolve: () => {
            return this.getDb('pg')
              .tap(() => this.logger.debug('Query roomsList'))
              .then((pgDb) => this.queries.roomsList(pgDb))
            ;
          },
        },
      },
    });

    this.RootMutation = new GraphQLObjectType({
      name: 'RootMutation',
      fields: {
        joinRoom: {
          type: this.UserType,
          args: {
            roomId: { type: GraphQLID },
            userId: { type: GraphQLID },
          },
          resolve: (_, { userId, roomId }) => {

            return this.getDb('pg')
              .tap(() => this.logger.debug('Mutation joinRoom', { userId, roomId }))
              .then((pgDb) => this.mutations.joinRoom(pgDb, userId, roomId))
            ;
          },
        },
        leaveRoom: {
          type: this.UserType,
          args: {
            userId: { type: GraphQLID },
          },
          resolve: (_, { userId }) => {

            return this.getDb('pg')
              .tap(() => this.logger.debug('Mutation leaveRoom', { userId }))
              .then((pgDb) => this.mutations.leaveRoom(pgDb, userId))
            ;
          },
        },
        pickCards: {
          type: GraphQLList(this.CardType),
          args: {
            roomId: { type: GraphQLID },
            userId: { type: GraphQLID },
            nbCardToDraw: { type: GraphQLInt },
          },
          resolve: (_, { roomId, userId, nbCardToDraw }) => {

            return Promise.all([this.getDb('pg'), this.getDb('redis')])
              .tap(() => this.logger.debug('Mutation pickCards', { roomId, userId, nbCardToDraw }))
              .then(([pgDb, redisDb]) => this.mutations.pickCards(roomId, userId, nbCardToDraw, pgDb, redisDb))
            ;
          },
        },
        pickEndings: {
          type: GraphQLList(this.CardType),
          args: {
            roomId: { type: GraphQLID },
            userId: { type: GraphQLID },
          },
          resolve: (_, { roomId, userId }) => {

            return Promise.all([this.getDb('pg'), this.getDb('redis')])
              .tap(() => this.logger.debug('Mutation pickEndings', { roomId, userId }))
              .then(([pgDb, redisDb]) => this.mutations.pickEndings(redisDb, roomId, userId))
            ;
          },
        },
      },
    });

    this.schema = new GraphQLSchema({
      query: this.RootQuery,
      mutation: this.RootMutation,
    });
  }
}
