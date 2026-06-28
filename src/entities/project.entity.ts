import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
} from "typeorm";
import { v7 as uuidv7 } from "uuid";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { ProjectMember } from "./project-member.entity";
import { Task } from "./task.entity";

export enum ProjectStatus {
  ACTIVE = "active",
  DELETED = "deleted",
}

@Unique(["title", "ownerId"])
@Entity("projects")
export class Project extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @BeforeInsert()
  protected assignId(): void {
    if (!this.id) this.id = uuidv7();
  }

  @Column({ type: "varchar", length: 150 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @Column({ name: "owner_id", type: "uuid" })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "owner_id" })
  owner: User;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
