import { AuthService } from "../src/modules/auth/auth.service";
import * as passwordUtils from "../src/utils/password";
import * as jwtUtils from "../src/utils/jwt";
import { RoleName } from "../src/entities/role.entity";

jest.mock("../src/config/data-source", () => ({
  AppDataSource: { transaction: jest.fn(), getRepository: jest.fn() },
}));
jest.mock("../src/utils/password");
jest.mock("../src/utils/jwt");

const { AppDataSource } = require("../src/config/data-source");
const mockHash = passwordUtils.hashPassword as jest.Mock;
const mockVerify = passwordUtils.verifyPassword as jest.Mock;
const mockSign = jwtUtils.signAccessToken as jest.Mock;

// Chainable query builder — every method returns itself unless overridden
const makeQB = (overrides: Record<string, jest.Mock> = {}) => {
  const qb: any = {};
  ["addSelect", "leftJoinAndSelect", "where", "select", "from"].forEach(
    (m) => (qb[m] = jest.fn().mockReturnValue(qb)),
  );
  return Object.assign(qb, overrides);
};

const makeUser = (overrides = {}) => ({
  id: "user-1",
  fullName: "Mohammed",
  email: "mohammed@gmail.com",
  passwordHashed: "hashed",
  userRoles: [{ role: { name: RoleName.USER } }],
  ...overrides,
});

describe("AuthService", () => {
  let service: AuthService;
  let mockUsersRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersRepo = { createQueryBuilder: jest.fn() };
    service = new AuthService(mockUsersRepo);
  });

  describe("register", () => {
    it("creates a user and returns the expected shape", async () => {
      const savedUser = {
        id: "user-1",
        fullName: "Mohammed",
        email: "mohammed@gmail.com",
      };
      mockHash.mockResolvedValue("hashed-pw");

      AppDataSource.transaction.mockImplementation(async (cb: any) =>
        cb({
          create: jest.fn().mockReturnValue(savedUser),
          save: jest.fn().mockResolvedValue(savedUser),
          createQueryBuilder: jest.fn().mockReturnValue(
            makeQB({
              getOneOrFail: jest.fn().mockResolvedValue({ id: "role-1" }),
              insert: jest.fn().mockReturnThis(),
              into: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              execute: jest.fn().mockResolvedValue(undefined),
            }),
          ),
        }),
      );

      const result = await service.register({
        fullName: "Mohammed",
        email: "mohammed@gmail.com",
        password: "secret",
      });

      expect(mockHash).toHaveBeenCalledWith("secret");
      expect(result).toEqual({
        user: {
          id: "user-1",
          fullName: "Mohammed",
          email: "mohammed@gmail.com",
          roles: [RoleName.USER],
        },
      });
    });
  });

  describe("login", () => {
    it("returns an access token for valid credentials", async () => {
      mockVerify.mockResolvedValue(true);
      mockSign.mockReturnValue("token-abc");
      mockUsersRepo.createQueryBuilder.mockReturnValue(
        makeQB({ getOne: jest.fn().mockResolvedValue(makeUser()) }),
      );

      const result = await service.login({
        email: "mohammed@gmail.com",
        password: "secret",
      });

      expect(mockVerify).toHaveBeenCalledWith("secret", "hashed");
      expect(result).toEqual({ accessToken: "token-abc" });
    });

    it("throws 401 when user is not found", async () => {
      mockUsersRepo.createQueryBuilder.mockReturnValue(
        makeQB({ getOne: jest.fn().mockResolvedValue(null) }),
      );

      await expect(
        service.login({ email: "nobody@gmail.com", password: "x" }),
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("throws 401 when password is wrong", async () => {
      mockVerify.mockResolvedValue(false);
      mockUsersRepo.createQueryBuilder.mockReturnValue(
        makeQB({ getOne: jest.fn().mockResolvedValue(makeUser()) }),
      );

      await expect(
        service.login({ email: "mohammed@gmail.com", password: "wrong" }),
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });
});
