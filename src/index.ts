import "reflect-metadata"
import { DataSource } from "typeorm"
import dotenv from "dotenv"
import { buildSchema } from "type-graphql"
import resolvers from "./resolvers"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import http from "http"
import express from "express"
import { json } from "body-parser"
import cors from "cors";
import jwt from "jsonwebtoken";
import { User } from "./entities/user"
import entities from "./entities"
import { authChecker } from "./utils/auth"
import { Department } from "./entities/department"
import { Role } from "./types/user"
import { adminUsers } from "./utils/admin"



dotenv.config()
if(!process.env.DATABASE_URI || !process.env.PORT) {
    throw new Error('Environment Variables not set')
}
const PORT = process.env.PORT

const corsOrigin = [ 'https://studio.apollographql.com', 'http://localhost:3000', 'https://app.shaastra.org', 'https://api.app.shaastra.org' ]
 
async function bootstrap () {
    try {

        const schema = await buildSchema({
            resolvers,
            authChecker,
            validate: { forbidUnknownValues: false },
        })
        const app = express();
        const httpServer = http.createServer(app)
        const server = new ApolloServer({
            schema,
            plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
        })
        await server.start();
        app.use(
            '/graphql',
            cors<cors.CorsRequest>({
                origin: corsOrigin,
                credentials: true
            }),
            json(),
            expressMiddleware(server, {
                context: async ( { req, res } : { req: express.Request, res: express.Response } ) => {
                    let user: User | null = null;
                    let dep: Department | null = null;
                    if (req.headers.cookie) {
                        const token = req.headers.cookie.split("token=")[1]
                        if (token) {
                            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
                            user = await User.findOne({ where: { id: decoded.id }, relations: ["application"] })
                            if (user?.role == Role.CORE) {
                                await Promise.all(
                                    adminUsers.map(async (el) => {
                                        if(el.cores.includes(user.rollno)) {
                                            dep = await Department.findOne({where: {name: el.department}, relations: ["application"] })
                                        }
                                    })
                                )
                            }
                        }
                    }
                    if (dep) return { req, res, user, dep }
                    else return { req, res, user }
                },
            }),
        )
    
        await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
        console.log(`Server ready at http://localhost:${PORT}/graphql`);
    } catch (err) {
        console.error('Error during Apollo Server initialization', err)
    }

}

const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URI,
    logging: true,
    synchronize: process.env.NODE_ENV !== "production",
    entities: entities,
    // ssl: true,
    // extra: {
	//     "ssl": {
	// 	    "rejectUnauthorized": false,
	//     }
    // }
})

AppDataSource.initialize()
.then(() => {
    console.log("Data Source has been initialized")
    bootstrap();
})
.catch((err) => {
    console.error("Error during Data Source initialization", err)
})
