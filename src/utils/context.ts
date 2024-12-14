import { Request, Response } from "express"
import { User } from "../entities/user";
import { Department } from "../entities/department";

export interface MyContext {
    req: Request,
    res: Response,
    user: User
    dep: Department
}