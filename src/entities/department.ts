import { ObjectType, Field, ID } from "type-graphql"
import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, OneToMany } from "typeorm"
import { Application } from "./application"

@ObjectType("Department")
@Entity("Department")
export class Department extends BaseEntity {
    @Field(type => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    name!: string

    @Field({nullable: true})
    @Column({nullable: true})
    guideBook!: string

    @Field({nullable: true})
    @Column({nullable: true})
    coordApp!: string

    @Field({nullable: true})
    @Column({nullable: true})
    headApp!: string

    @Field(type => [Application], { nullable: true })
    @OneToMany(() => Application, (application: Application) => application.department)
    application?: Application[]
}