import { Field, InputType } from "type-graphql";

@InputType()
export class modifyDepartmentInput {
    @Field()
    name!: string

    @Field()
    guideBook!: string

    @Field()
    coordApp!: string

    @Field()
    headApp!: string
}