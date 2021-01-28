const { GraphQLServer } = require('graphql-yoga');
const { PrismaClient } = require('@prisma/client');
const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
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