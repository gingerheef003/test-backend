import ApplicationResolver from "./application";
import DepartmentResolver from "./department";
import UserResolver from "./user";

export default [ UserResolver, DepartmentResolver, ApplicationResolver ] as const;