import { GraphQLServer } from 'graphql-yoga';

const PORT = 4000;

const typeDefs = `
  type Query {
    hello(name: String): String
  }
`

const resolvers = {
  Query: {
    hello: (_, { name }) => {
      return `Hello ${name || 'hello'}!`
    },
  }
}

const server = new GraphQLServer({ typeDefs, resolvers })

server.start({ port: PORT, endpoint: '/api/v1/graphql', subscriptions: '/api/v1/subscriptions', playground: '/api/v1/playground' }, ({ port }) => {
  console.log(`> Server is running in http://localhost:${port}`);
})

