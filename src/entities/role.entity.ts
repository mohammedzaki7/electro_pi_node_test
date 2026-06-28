import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { BaseEntity } from './base.entity';
import { UserRole } from './user-role.entity';

export enum RoleName {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  protected assignId(): void {
    if (!this.id) this.id = uuidv7();
  }

  @Column({ type: 'varchar', length: 50, unique: true })
  name: RoleName;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
