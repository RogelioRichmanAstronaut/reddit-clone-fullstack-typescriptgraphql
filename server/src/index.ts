import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import session from "express-session";
// import { createClient } from "redis";
import Redis from "ioredis";
import connectRedis from "connect-redis";
// import { MyContext } from "./types";
import cors from "cors";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { DataSource } from "typeorm";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const main = async () => {
  //aquí es donde puedo usar mongodb
  const dataSource = new DataSource({
    type: "postgres",
    // host: "localhost",
    database: "lireddit2",
    username: "dani",
    password: "123",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  // await Post.delete({});

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  // redis.connect().catch(console.error);

  app.set("trust proxy", !__prod__);

  app.use(
    cors({
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: "auto", //cookie only work in https
      },
      saveUninitialized: false,
      secret: "ñsafjsalñdkfjalskdf",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });
  // await apolloServer.start()
  // apolloServer.applyMiddleware({ app })

  await apolloServer.start();

  // const corsSettings = {
  //   origin: ["https://studio.apollographql.com", "http://localhost:3000"],
  //   credentials: true,
  // };

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("tamo activo en localhost:4000");
  });
};

main();
