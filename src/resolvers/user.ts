import { Resolver, Mutation, Arg, Query, Ctx, Authorized } from "type-graphql"
import { Department } from "../entities/department"
import { User } from "../entities/user"
import { LoginUserInput, RegisterUserInput, ResetPasswordInput, Role } from "../types/user"
import { MyContext } from "../utils/context"
import bcrypt from "bcryptjs"
import jwt from  "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

@Resolver(User)
class UserResolver {
    @Mutation(() => User)
    async registerUser(
        @Arg("data") data: RegisterUserInput,
        @Ctx() { res } : MyContext
    ) {      
        const alreadyUser = await User.findOne({ where: { rollno : data.rollno } })
        if (alreadyUser) throw new Error("User already created. Login to continue")

        const totCount = await User.count()
        const userId = "SH24USER" + ("000" + (totCount + 1)).slice(-4)
        
        const role = Role[data.role as keyof typeof Role]
        
        const user = User.create({
            ...data,
            role,
            userId,
        })
        await user.save()

        let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret")
        res.cookie("token", token, {httpOnly: false});

        return user
    }

    @Mutation(() => User)
    async loginUser(
        @Arg("input") { rollno, password } : LoginUserInput,
        @Ctx() { res } : MyContext
    ) {
        const ifUser = await User.findOne({ where: { rollno } })
        if (!ifUser) throw new Error("Account not found")

        const ifPass = await bcrypt.compare(password, ifUser.password)
        if (!ifPass) throw new Error("Invalid Credential")
         
        let token = jwt.sign({ id: ifUser.id }, process.env.JWT_SECRET || "secret")
        res.cookie("token", token, {httpOnly: false});

        return ifUser;
    }

    @Mutation(() => Boolean)
    async logoutUser(
        @Ctx() { res } : MyContext
    ) {
        res.cookie("token","", {httpOnly: true, maxAge: 1})
        return true;
    }

    @Mutation(() => Boolean)
    async resetPassword(
        @Arg("input") password : string,
        @Ctx() { user } : MyContext
    ) {
        const newPass = await bcrypt.hash(password, 13)
        const { affected } = await User.update(user.id, { password: newPass })
        return affected === 1
    }

    // @Authorized()
    // @Mutation(() => Boolean)
    // async editUser(
    //     @Arg("input") data : RegisterUserInput,
    //     @Ctx() { user } : MyContext
    // ) {
    //     const department = await Department.findOne({ where: { name: data.department } })
    //     if (!department) throw new Error("Department not Found")

    //     const { affected } = await User.update(user.id, { ...data, department })
        
    //     return affected === 1;
    // }

    // @Mutation(() => Boolean)
    // async corify(
    //     @Arg("input") rollno : string,
    // ) {
    //     const user = await User.findOne({where: {rollno}})
    //     if (!user) throw new Error("No user")
    //     const { affected } = await User.update(user.id, { role: Role.CORE })
    //     return affected === 1
    // }

    @Authorized()
    @Query(() => User)
    async me(
        @Ctx() { user } : MyContext,
    ) {
        return user;
    }

    @Query(() => [User])
    async getUsers() {
        return await User.find()
    }
}

export default UserResolver;
