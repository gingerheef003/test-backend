import { InputType, Field, registerEnumType } from "type-graphql"

export enum Role {
    CORE = "CORE",
    COCAS = "COCAS",
    COCAD = "COCAD",
    COORD = "COORD",
    HEAD = "HEAD"
}
registerEnumType(Role, {
    name: "Role",
    description: "Enum values for various Departments of Shaastra"
})

@InputType()
export class RegisterUserInput {
    @Field()
    name!: string

    @Field()
    rollno!: string

    @Field()
    password!: string

    @Field({defaultValue: "COORD"})
    role!: string
}

@InputType()
export class LoginUserInput {
    @Field()
    rollno!: string
    
    @Field()
    password!: string
}

@InputType()
export class ResetPasswordInput {
    @Field()
    password!: string

    @Field()
    newPassword!: string
}