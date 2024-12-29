import { ApolloServer } from "apollo-server-express";
import express from "express";
import { readFileSync } from "fs";
import { resolvers } from "./resolvers";
import { authenticate } from "./auth";

const typeDefs = readFileSync("./src/schema.graphql", { encoding: "utf-8" });

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const user = await authenticate(req);
      return { user };
    },
  });

  await server.start();

  server.applyMiddleware({ app: app as any });

  app.listen({ port: 4000 }, () =>
    console.log(
      `🚀 Server listening at http://localhost:4000${server.graphqlPath}`,
    ),
  );
}

startServer();
