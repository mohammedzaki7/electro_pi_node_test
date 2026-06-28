import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { Role } from "./role.entity";

/**
 * Join table specifying which global role(s) belong to which user.
 */
@Entity("user_roles")
export class UserRole extends BaseEntity {
  @PrimaryColumn({ name: "user_id", type: "uuid" })
  userId: string;

  @PrimaryColumn({ name: "role_id", type: "uuid" })
  roleId: string;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role: Role;
}
