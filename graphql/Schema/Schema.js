const graphql = require('graphql');

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
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

const RequestType = new GraphQLObjectType({
  name: 'Request',
  fields: () => ({
    id: { type: GraphQLID },
    destination: { type: GraphQLString },
    timeBuffer: { type: GraphQLInt },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        console.log(`userId: + ${args.id}`);
        return User.findById(args.id);
      },
    },
    requests: {
      type: new GraphQLList(RequestType),
      resolve(parent, args) {
        return Request.find();
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
