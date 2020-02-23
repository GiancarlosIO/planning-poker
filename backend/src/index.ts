import path from 'path';

import * as GraphQLYoga from 'graphql-yoga';
import express from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const PORT = 4000;

const typeDefs = `
  type Query {
    hello(name: String): String
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => {
      return `Hello ${name || 'hello'}!`;
    },
  },
};

const server = new GraphQLYoga.GraphQLServer({ typeDefs, resolvers });
const serverOptions = {
  port: PORT,
  endpoint: '/api/v1/graphql',
  subscriptions: '/api/v1/subscriptions',
  playground: '/api/v1/playground',
  tracing: true,
};

if (isProduction) {
  server.express.use(
    express.static(path.join(__dirname, '../../frontend/dist'), {
      extensions: ['js', 'css'],
      index: false,
    }),
  );
  server.express.get('*', (req, res, next) => {
    if (
      req.url === serverOptions.playground ||
      req.url === serverOptions.subscriptions ||
      req.url === serverOptions.endpoint
    ) {
      return next();
    }
    return res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
} else {
  server.express.get('*', (req, res, next) => {
    if (
      req.url === serverOptions.playground ||
      req.url === serverOptions.subscriptions ||
      req.url === serverOptions.endpoint
    ) {
      return next();
    }
    res.redirect(serverOptions.playground);
  });
}

server.start(serverOptions, ({ port }) => {
  console.log(`> Server is running in http://localhost:${port}`);
})
