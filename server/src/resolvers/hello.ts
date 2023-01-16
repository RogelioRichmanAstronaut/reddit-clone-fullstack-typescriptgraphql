import { Resolver, Query} from "type-graphql";

@Resolver()
export class HelloResolver {
//mutations and querys
    @Query(() => String)
    hello(){
        return "chao pa"
    }
}