import { DataSource } from 'typeorm';
import { Role, RoleName } from '../entities/role.entity';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Role)
    .values(Object.values(RoleName).map((name) => ({ name })))
    .orIgnore()
    .execute();
}
