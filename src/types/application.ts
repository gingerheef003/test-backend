import { Field, InputType } from "type-graphql";
import { Role } from "./user";

@InputType()
export class createApplicationInput {
    @Field()
    department!: string

    @Field()
    file!: string
}