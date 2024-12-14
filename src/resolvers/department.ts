import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Department } from "../entities/department";
import { User } from "../entities/user";
import { Application } from "../entities/application";
import { modifyDepartmentInput } from "../types/department";
import { MyContext } from "../utils/context";

@Resolver(Department)
class DepartmentResolver {

    @Mutation(() => Department)
    async createDepartment(
        @Arg("name") name : string
    ) {
        const department = Department.create({
            name,
        })
        department.save()
        return department;
    }

    @Mutation(() => Boolean)
    async modifyDepartment(
        @Arg("data") data: modifyDepartmentInput
    ) {
        const department = await Department.findOne({ where: { name: data.name } })

        if(!department) throw new Error("Department Not Found")

        const { affected } = await  Department.update({ name: data.name }, {
            guideBook: data.guideBook ? data.guideBook : department.guideBook,
            coordApp: data.coordApp ? data.coordApp : department.coordApp,
            headApp: data.headApp ? data.headApp : department.headApp
        })
        return affected === 1;
    }

    // @Query(() => [User])
    // async getUsersByDepartment (
    //     @Arg("name") name : string,
    // ) {
    //     const department = await Department.findOneOrFail({ where: { name } })
    //     if (department.users) return department.users;
    //     else return [];
    // }

    @Query(() => [Department])
    async getDepartments() {
        return await Department.find()
    }

    @Query(() => [User], {nullable: true})
    async getDepartmentsUsers () {
        const deps = await Department.find({ relations: ["application"] })
        // return deps;
        const a: User[] = [];
        await Promise.all(
            deps.map(async dep => {
                const apps = dep.application;
                if (apps){
                    await Promise.all(

                        apps?.map(async app => {
                            const App = await Application.findOneOrFail({where: {id: app.id}, relations: ["user"]});
                            const us = App.user;
                            if (us) a.push(App.user)
                        })
                    )
                }
    
            })
        ) 
        return a;
    }

    @Query(() => [Application], {nullable: true})
    async getDepartmentApplications(
        @Ctx() { dep }: MyContext
    ) {
        const apps: Application[] = [];
        if(dep.application){
            await Promise.all(
                dep.application.map(async app => {
                    const appli = await Application.findOneOrFail({ where: { id: app.id }, relations: ["user"] })
                    apps.push(appli)
                })
            )
        }
        return apps;
    }

    @Query(() => String)
    async getDepartment(
        @Ctx() { dep } : MyContext
    ) {
        return dep.name;
    }
}

export default DepartmentResolver