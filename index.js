const { GraphQLServer } = require('graphql-yoga');
const { PrismaClient } = require('@prisma/client');
const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  type Query {
    users: [User]
    polls: [Poll]
    votes: [Vote]
    user(id: ID!): User
    poll(id: ID!): Poll
  }
  type User {
    id :ID!
    name :String!
    polls :[Poll]
  }
  type Poll {
    id :ID!
    description: :String!
    user :User!
    options :[Option!]
    votes :[Vote]
  }
  type Vote {
    id :ID!
    user :User!
    poll :Poll!
    option :Option!
  }
  type Mutation {
    createUser(name: String!): User
    createPoll(
      description: String!
      id: ID!
      options: [String!]
    ): Poll
  }
  createVote(
    userID: ID!
    pollID: ID!
    optionID: ID!
  ): Vote
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || World}`,
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
const prisma = new PrismaClient();
const server = new GraphQLServer({ 
  schema,
  context: {
    prisma
  } 
});

const options = {
  port: 8000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
};
server.start(options, ({ port }) => {
  console.log(`The server is running on port ${port} for incoming requests`);
});