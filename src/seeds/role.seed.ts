import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Role, RoleName } from '../entities/role.entity';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Role)
    .values(Object.values(RoleName).map((name) => ({ id: uuidv7(), name })))
    .orIgnore()
    .execute();
}
