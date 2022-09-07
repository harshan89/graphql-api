import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import express from "express";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from "apollo-server-core";
import { servicesVersion } from "typescript";
import { resolvers } from "./resolvers";
import { conectToMongo } from "./utils/mongo";
import { verfyJWT } from "./utils/jwt";
import { User } from "./schema/user.schema";
import Context from "./types/context";

async function bootstrap() {
  // Build the schema
  const schema = await buildSchema({
    resolvers,
    // authChecker,
  });

  // Init express
  const app = express();
  app.use(cookieParser());

  // Create the apollo server
  const server = new ApolloServer({
    schema,
    context: (ctx: Context) => {
      const context = ctx;
      if (ctx.req.cookies.accessToken) {
        const user = verfyJWT<User>(ctx.req.cookies.accessToken);
        context.user = user;
      }
      return context;
    },
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();

  // apply middleware to server
  server.applyMiddleware({ app });

  // app.listen on express server
  app.listen({ port: 4000 }, () => {
    console.log("App is listening on ");
  });

  //connect to db
  conectToMongo();
}

bootstrap();
