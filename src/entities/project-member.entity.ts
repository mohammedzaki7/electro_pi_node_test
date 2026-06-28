import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { Project } from "./project.entity";

/**
 * Association table indicating that a user is a member of a project.
 * Membership is what authorizes access to a project's tasks.
 */
@Entity("project_member")
export class ProjectMember extends BaseEntity {
  @PrimaryColumn("uuid")
  @Column({ name: "project_id", type: "uuid" })
  projectId: string;

  @PrimaryColumn("uuid")
  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project: Project;

  @ManyToOne(() => User, (user) => user.projectMemberships, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;
}
