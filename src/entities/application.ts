import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Department } from "./department";

@ObjectType("Application")
@Entity("Application")
export class Application extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field(type => User)
    @ManyToOne(() => User, (user: User) => user.applicationFrom)
    user!: User

    @Field(type => Department)
    @ManyToOne(() => Department, (department: Department) => department.application)
    department!: Department

    @Field()
    @Column()
    file!: string

    @Field({ defaultValue: false })
    @Column({ default: false })
    selected!: boolean

    @Field(() => Date)
    @Column()
    submittedAt!: Date
}