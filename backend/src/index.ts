import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { createContext, Context } from './context.js';

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
      extensions: error.extensions
    };
  }
});

const PORT = parseInt(process.env.PORT || '4000', 10);

startStandaloneServer(server, {
  listen: { port: PORT },
  context: createContext
}).then(({ url }) => {
  console.log(`
  🚀 Server ready at ${url}
  📊 GraphQL Playground: ${url}
  
  Available endpoints:
    - POST ${url} (GraphQL queries/mutations)
  `);
});
