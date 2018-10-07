const graphql = require('graphql');
const db = require('../../db/db');

const {
  buildSchema,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} = graphql;
const _ = require('lodash');
const User = require('../../models/user');
const Request = require('../../models/request');

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    profile_pic: { type: GraphQLString },
  }),
});

const RequestType = new GraphQLObjectType({
  name: 'Request',
  fields: () => ({
    request_id: { type: GraphQLID },
    location_start: { type: GraphQLString },
    location_end: { type: GraphQLString },
    // time_departure: {type: Graph}
    destination: { type: GraphQLString },
    time_buffer: { type: GraphQLInt },
  }),
});

const MatchType = new GraphQLObjectType({
  name: 'Match',
  fields: () => ({
    match_id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    request_id: { type: GraphQLID },
    // match_user returns a UserType with parent value of id which is = to the match_user_id return from the query
    match_user: {
      type: UserType,
      async resolve(parent) {
        console.log(parent);
        const { match_user_id } = parent;
        const res = await db.query(`SELECT * from users WHERE id = ${match_user_id}`);
        return res.rows[0];
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        console.log(`userId: ${args.id}`);
        const res = await db.query(`SELECT * FROM users WHERE id = ${args.id}`);
        return res.rows[0];
      },
    },
    requests: {
      type: new GraphQLList(RequestType),
      // type: RequestType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        const res = await db.query(`SELECT * FROM requests WHERE id = ${args.id}`);
        return res.rows;
      },
    },
    matches: {
      type: new GraphQLList(MatchType),
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        const { id } = args;
        const res = await db.query(
          `SELECT * FROM matches INNER JOIN users ON matches.user_id = users.id WHERE user_id = ${id}`
        );
        return res.rows;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // add user to the database with first/last name and email
    addUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve(parent, args) {
        const user = new User({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
        });

        return user.save();
      },
    },
    addRequest: {
      type: RequestType,
      args: {
        destination: { type: GraphQLString },
        timeBuffer: { type: GraphQLInt },
      },
      resolve(parent, args) {
        const request = new Request({
          destination: args.destination,
          timeBuffer: args.timeBuffer,
        });
        return request.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
