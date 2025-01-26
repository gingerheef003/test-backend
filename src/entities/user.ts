import { ObjectType, Field, ID } from "type-graphql";
import { PrimaryGeneratedColumn, Column, Entity, BaseEntity,  BeforeInsert, OneToMany } from "typeorm";
import bcrypt from "bcryptjs"
import { Application } from "./application";
import { Role } from "../types/user";

@ObjectType("User")
@Entity("User")
export class User extends BaseEntity {
    @BeforeInsert()
    async setPass() {
        this.password = await bcrypt.hash(this.password, 13)
    }
    
    @Field(type => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    userId!: string

    @Field()
    @Column()
    name!: string

    @Field()
    @Column()
    rollno!: string

    @Column()
    password!: string

    @Field(type => Role)
    @Column({
        type: "enum",
        enum: Role,
        default: Role.COORD
    })
    role!: Role

    @Field(type => [Application], { nullable: true })
    @OneToMany(() => Application, (application: Application) => application.user)
    applicationFrom?: Application[]
}

