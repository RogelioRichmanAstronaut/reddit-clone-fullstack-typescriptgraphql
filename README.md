# reddit-clone-fullstack-typescriptgraphql



npm install in server and web to install dependencies
create a database with pgadmin4


i start this tutorial in 2022-2023

So if i see a error i will search the solution and put it here.


12:45 cant create the database with the command "createdb".
-Solution: https://stackoverflow.com/questions/72891177/createdb-typegraphql-example-password-authentication-failed-for-user-windows

31:38 cant create a new post for the syntax
-Solution:

const emFork = orm.em.fork(); // <-- create the fork
  const post = emFork.create(Post, {
    // <-- use the fork instead of global `orm.em`
    title: "my first post",
  });
  await emFork.persistAndFlush(post); // <-- use the fork instead of global

(if you see a syntax error: "Argument of type '{ title: string; }' is not assignable to parameter of type 'RequiredEntityData<Post>'." ||||| IGNORE IT NO PROBLEM

founded here: https://stackoverflow.com/a/72799993/17736622

38:53 use `allowGlobalContext` configuration option or `fork()` instead.');
-Solution:

const emFork = orm.em.fork(); // <-- create the fork
const posts = await emFork.find(Post, {});
console.log(posts);

founded here: https://stackoverflow.com/a/72799993/17736622
(read it is important to understand why not enable allow global contexts and use fork istead)

46:26 Looks like you use an incorrect version of the 'graphql' package: "16.5.0". Please ensure that you have installed a version that meets TypeGraphQL's requirement: "^15.3.0".
-Solution:
1. go to package.json and change "graphql" version to typegraphql requirement in my case: "^15.3.0"
2. run in terminal: yarn remove graphql
3. go to the terminal and run: yarn add graphql@15.7.2

after repair this i got a new error:
46:26 Error('You must `await server.start()` before calling `server.'
Solution:

await apolloServer.start(); //start first the apolloServer
apolloServer.applyMiddleware({ app });

56:17 Using global EntityManager instance methods for context specific actions is disallowed. If you need to work with the global instance's identity map, use `allowGlobalContext` configuration option or `fork()` instead."
Solution:
(this is the same error, 2 times the same.. in next im going to skip, the solution is the same:)
1. in the directory resolvers/post.ts
(post.ts)

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    const emFork = em.fork(); //add the fork before do anything with em...
    return emFork.find(Post, {});
  }
}


1:00:00 your schema expects an array(Iterable) but you aren't returning an array in your resolver
Solution: 
(be shure to not put the type [], around the return resolver.

@Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const emFork = em.fork();
    return emFork.findOne(Post, { id });
  }

1:02:22 Argument of type '{ title: string; }' is not assignable to parameter of type 'RequiredEntityData<Post>'.

2 solutions the first:
@Mutation(() => Post )
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const emFork = em.fork();
    const post = emFork.create(Post, {title} as RequiredEntityData<Post>)//this is the solution and import 
    await emFork.persistAndFlush(post); // <-- use the fork instead of global
    return post;
  }

the second sulution:


1. go to entities/Post.ts
2. after createdAt, and updatedAt put a "?" (this is because the Dates are not a database default)
like this:
createdAt? = new Date();

1:43:00 HOW TO INSTALL REDIS, AND IF YOU FOUND AN ERROR IN THE INSTALLATION
Solution:
1. i found this easy video that explain how to install redis on windows easy pisi
https://www.youtube.com/watch?v=_nFwPTHOMIY&ab_channel=Redis
2. i got a weird bug, but i found the solution
https://www.youtube.com/watch?v=iLSAJNP1os8&ab_channel=TroubleChute

1:48:07 (property) s.RedisStoreOptions.client?: connectRedis.Client | undefined
Solution:
(i founded here: "https://stackoverflow.com/questions/65980722/how-to-set-connect-redis-in-typescript")

1. don not create the imports of require, use exactly you found it in docs, in my case:
DONT:
import session from "express-session";
import { createClient } from "redis";
import connectRedis from 'connect-redis'

YES:
  const session = require("express-session")
  let RedisStore  = require("connect-redis")(session)

  const { createClient } = require("redis")
  let redisClient = createClient({ legacyMode: true })
  redisClient.connect().catch(console.error)

i dont know why, but this works, theres another solution in the link, that is by installing older versions of "@types/express-session": "1.17.1"
"@types/connect-redis": "^0.0.14"

1:55:00 Property 'userId' does not exist
Solution:
1. go to types.ts
2. import this two thinks
import { Request, Response } from "express"
import { Session } from "express-session"
3. in req: put this:
req: Request & { session: Session & { userId: number } }
4. save and the error was fixed, in user.ts

after this you probably got a new error in index.ts
replace the context line by this:
context: ({ req, res }: MyContext): MyContext => ({ em: orm.em, req, res }),

1:56:00 Error: connect ECONNREFUSED 127.0.0.1:6379
(i suppose you have installed redis)
1. open ubuntu or the redis you have
2. and start redis
3. this is the command: sudo service redis-server start

1:57:15 where is "request.credentials": "include"?????
This is becouse we have a new version of apollo express, but this is not a problem
here is the solution
Solution:
1. go to settings in apollo
2. enter in conecction settings -> edit
3. enable "include cookies"
4. bellow cookies, in shared headers: you need to put a in a only shared header a new value
5. in the first input put: x-forwarded-proto
6. in the same but in the second input put: https
7. Go to index.ts and search your "app.use(session..."
7.1 above your app.use add this line: app.set("trust proxy", !__prod__); 

"(the "!__prod__" means true in production, this is important to be true just in production for security)"
7.2 in your app.use(session... change the sameSite to none, like this: sameSite: "none"
7.3 again in your app.use(session.. know change the secure to true, secure: true,
this is my app.use:
  app.set("trust proxy", !__prod__);

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "none", // csrf
        secure: true, //cookie only work in https
      },
      saveUninitialized: false,
      secret: "ñsafjsalñdkfjalskdf",
      resave: false,
    })
  );

8. important: before continue we need to add a new think call cors, so go to your await apolloServer.start() or your apolloServer.applyMiddleware({ app })
above the apolloServer.applyMiddleware create a const called corsSettings or the name you want, like this:
  const corsSettings = {
    origin: ["https://studio.apollographql.com"],
    credentials: true,
  };
9. change the apolloServer and add the new cors settings:
  apolloServer.applyMiddleware({ app, cors: corsSettings });

in final it will look like this or close:

  await apolloServer.start();

  const corsSettings = {
    origin: ["https://studio.apollographql.com"],
    credentials: true,
  };

  apolloServer.applyMiddleware({ app, cors: corsSettings });

2:21:20 "Property 'children' does not exist on type 'WrapperProps'." ???

solution:

add the children into the interface props

interface WrapperProps {
    variant: 'small' | 'regular'
    children: React.ReactNode
}

2:38:55 Access to fetch at 'http://localhost:4000/graphql' from origin 'http://localhost:3000' has been blocked by CORS policy

add in the core settings the new origin url localhost:3000

await apolloServer.start();

    const corsSettings = {
        origin: ["https://studio.apollographql.com", "http://localhost:3000"],
        credentials: true,
    };

    apolloServer.applyMiddleware({ app, cors: corsSettings });


in 2:59:00 if cookie dont work, go to your app.use again... and in cookie nameSite put "lax", and in secure put "auto" or "false", what you need, and you can delete the "app.set("trust proxy", !__prod__)" line if you want


IN 3:00:00 TO 3:59:00 REPAIR FRAGMENTS in new version of gen

1.you need to go to your package.json
and remplace the gen script to this one:
"gen": "graphql-codegen --config codegen.yml"
2. create the file, the same that ben use in the tutorial
3. enjoy



3:59:00 login dont works? the petition is to localhost:3000/graphql and needs to be to localhost:4000/graphql!
just wait to 4:04:47 Ben is going to repair it xd


4:35:25 i cant register a new user
the think that Ben add a new field to the User entity, so i create the new migration but it was created with errors, i try repair the migration but i cant solve it, but finally my solution was deleting all the database with the pgAdmin4 and creating it again with the same name with the migration. and that was my solution

5:25:54 new version of typeorm!
import typeorm from "typeorm";
const DataSource = new typeorm.DataSource({})
and
DataSource.initialize();

or
import { DataSource } from "typeorm";
const dataSource = new DataSource({})
await dataSource.initialize();

5:33:32 
Type 'number' has no properties in common with type 'FindOneOptions<Post>
remplace with 
Post.findOneBy({id})
or
Post.findOne({where: {id}})

5:40:00 query builder
const result = await User.createQueryBuilder().insert().values()
      .returning('*')
      .execute()

5:55:48 delete all past posts|| DataSource is not set for this entity.

i dont know why i cant delete the post directly in my index.ts
so i go to my post resolver, and in the query that give me all the posts called async posts()
1. i add:
 await Post.delete({});

2. so now when i call the query in the playground of apollo it delete all the posts there

3. enable synchronize again and enjoy

6:10:43 
interface WrapperProps {
  variant?: WrapperVariant;
  children: React.ReactNode;
}
and
interface LayoutProps {
  variant?: WrapperVariant;
  children: React.ReactNode;
}

6:35:37
return Post.createQueryBuilder("p")
        .orderBy()
        .getMany();

6:53:46 create migrations 
i dont know how so i copy the same of Ben
so in "20230112032028" put any timestamp
and save the file with the timestamp name: 
20230112032028-FakePosts.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class FakePosts20230112032028 implements MigrationInterface {

    public async up (queryRunner: QueryRunner): Promise<void> {

    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }
}

7:20:33 resolveFieldByKey deprecated
just replace 
.resolveFieldByKey() 
with 
.resolve()

7:40:55 you got query failed for some reason
continue with the tutorial to 7:52:55 and Bend will fixed

8:12:03 getConnection?
use directly in Post, example:
const posts = await Post.query

8:46:00 error de sintaxis en o cerca de «update»
verify your post resolver
in vote

    await Post.query(
      `
      insert into updoot ("userId", "postId", value)
      values (${userId},${postId},${realValue});

      update post
      set points = points + ${realValue}
      where id = ${postId};

      `
    );

you need to add ";" before end of values and where id, i dont know why xd


9:45:00 - 9:52:00 el mensaje de «bind» entrega 2 parámetros, pero la sentencia preparada «» requiere 1 OR error: bind message supplies 2 parameters, but prepared statement "" requires 1

just continue and wait to 9:52:40, Ben got the same error and fixed

10:31:19 delete post dont work
try deleting a post that dont have votes
in 10:33:00 Ben fixed

10:41:58 .set?

    const result = await Post.createQueryBuilder()
      .update({ title, text })
      .where()
      .returning("*")
      .execute();

11:19:05 find array of id's
const users = await User.findBy({id: In(keys as number[])});

and, import 
import { In } from "typeorm";

11:32:00
          const updoots = await Updoot.findBy(keys as any);



11:38:00 dont load color of votes? 
