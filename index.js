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
    description :String!
    user :User!
    options :[Option!]
    votes :[Vote]
  }
  type Option {
    id          :ID!
    text        :String!
    poll        :Poll!
    votes       :[Vote]
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
    createVote(
      userID: ID!
      pollID: ID!
      optionID: ID!
    ): Vote
  }
`;

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      const { id } = args;
      return context.prisma.user.findOne({
        where: {
          id,
        },
        include: { polls: true },
      });
    },
    users: async (parent, args, context) => {
      return context.prisma.user.findMany({
        include: { polls: true },
      });
    },
    poll: async (parent, args, context) => {
      const { id } = args;
      return context.prisma.poll.findOne({
        where: {
          id,
        },
        include: {
          user: true,
          options: true,
          votes: {
            select: { user: true, option: true },
          },
        },
      });
    },
    polls: async (parent, args, context) => {
      return context.prisma.poll.findMany({
        include: {
          user: true,
          options: true,
          votes: {
            select: { user: true, option: true },
          },
        },
      });
    },
  },
  Mutation: {
    createUser: (parent, args, context, info) => {
      const newUser = context.prisma.user.create({
        data: {
          name: args.name,
        },
      });
      return newUser;
    },
    createPoll: (parent, args, context, info) => {
      const { description, id, options } = args;
      const newPoll = context.prisma.poll.create({
        data: {
          description,
          user: {
            connect: { id },
          },
          options: {
            create: options.map((option) => ({ text: option })),
          },
        },
      });
      return newPoll;
    },
    createVote: (parent, args, context, info) => {
      const { userID, pollID, optionID } = args;
      const newVote = context.prisma.vote.create({
        data: {
          user: {
            connect: { id: userID },
          },
          poll: {
            connect: { id: pollID },
          },
          option: {
            connect: { id: optionID },
          }
        }
      });
      return newVote;
    }
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
    prisma,
  },
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
