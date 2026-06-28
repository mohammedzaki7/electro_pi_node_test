import { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entities/user.entity";
import { RoleName } from "../../entities/role.entity";
import { UserRole } from "../../entities/user-role.entity";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { AppError } from "../../utils/app-error";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterResult {
  user: { id: string; fullName: string; email: string; roles: string[] };
}

export interface AuthResult {
  accessToken: string;
}

export class AuthService {
  constructor(
    private readonly users: Repository<User> = AppDataSource.getRepository(
      User,
    ),
  ) {}

  async register(input: RegisterInput): Promise<RegisterResult> {
    const saved = await AppDataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        fullName: input.fullName,
        email: input.email,
        passwordHashed: await hashPassword(input.password),
      });
      const saved = await manager.save(user);

      const role = await manager
        .createQueryBuilder()
        .select("role")
        .from("roles", "role")
        .where("role.name = :name", { name: RoleName.USER })
        .getOneOrFail();

      await manager
        .createQueryBuilder()
        .insert()
        .into(UserRole)
        .values({
          userId: saved.id,
          roleId: role.id,
        })
        .execute();

      return saved;
    });

    return {
      user: {
        id: saved.id,
        fullName: saved.fullName,
        email: saved.email,
        roles: [RoleName.USER],
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users
      .createQueryBuilder("user")
      .addSelect("user.passwordHashed")
      .leftJoinAndSelect("user.userRoles", "userRole")
      .leftJoinAndSelect("userRole.role", "role")
      .where("user.email = :email", { email: input.email })
      .getOne();

    if (!user || !(await verifyPassword(input.password, user.passwordHashed))) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    return {
      accessToken: signAccessToken({ sub: user.id, email: user.email, roles }),
    };
  }
}
