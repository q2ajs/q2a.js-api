import 'dotenv/config.js';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { applyMiddleware } from 'graphql-middleware';
import { graphqlUploadExpress } from 'graphql-upload';
import { makeExecutableSchema } from '@graphql-tools/schema';
import createDatabasePromise from './db/createDatabase.js';
import resolvers from './gql/resolvers.js';
import typeDefs from './gql/types.js';
import { permissions } from './gql/permissions.js';

const port = 4000;
const path = '/graphql';

createDatabasePromise.then(async () => {
  const { Strategy, ExtractJwt } = passportJWT;
  const jwtPasswordStrategy = new Strategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    (payload, done) => {
      const user = payload;
      return done(null, user);
    }
  );

  passport.use(jwtPasswordStrategy);
  passport.initialize();

  const app = express();
  app.use(path, (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next);
  });
  app.use(path, graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  const schema = applyMiddleware(
    makeExecutableSchema({
      typeDefs,
      resolvers,
    }),
    permissions
  );
  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({
      user: req.user,
    }),
    uploads: false,
  });
  await server.start();
  server.applyMiddleware({ app, path });
  app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`));
});
