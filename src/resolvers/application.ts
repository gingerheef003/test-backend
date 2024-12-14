import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Application } from "../entities/application";
import { createApplicationInput } from "../types/application";
import { Department } from "../entities/department";
import { MyContext } from "../utils/context";
import { Role } from "../types/user";
import { User } from "../entities/user";

@Resolver(Application)
class ApplicationResolver {

    @Mutation(() => Application)
    async createApplication(
        @Arg("data") data: createApplicationInput,
        @Ctx() { user } : MyContext
    ) {
        const department = await Department.findOne({ where: { name: data.department } })
        if(!department) throw new Error("Department not found")

        // const user = await User.findOne({where: {rollno: "ae22b012"}, relations: ["application"]})
        // if(!user) throw new Error("User not found")

        const date = new Date()
        // if (user.application){
        //     return Promise.all(
        //         user.application?.map(async app => {
        //                 const { affected } = await Application.update(app.id, {submittedAt: date})
        //                 return affected === 1
        //         })
        //     )
        // } else {

            const application = Application.create({
                user,
                department,
                submittedAt: date,
                file: data.file
            })
            await application.save()
    
            return application
        // }
        // const app = await Application.findOne({where: {id: "1"}})
    }
    @Query(() => [Application])
    async getApplications() {
        return await Application.find({relations: ["user", "department"]})
    }
}

export default ApplicationResolver