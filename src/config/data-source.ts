import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { UserRole } from "../entities/user-role.entity";
import { Project } from "../entities/project.entity";
import { ProjectMember } from "../entities/project-member.entity";
import { Task } from "../entities/task.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.name,
  logging: false,
  entities: [User, Role, UserRole, Project, ProjectMember, Task],
});
