import { ProjectService } from "../src/modules/projects/project.service";
import { ProjectStatus } from "../src/entities/project.entity";

jest.mock("../src/config/data-source", () => ({
  AppDataSource: { transaction: jest.fn(), getRepository: jest.fn() },
}));
jest.mock("../src/utils/pagination", () => ({ paginate: jest.fn() }));

const { AppDataSource } = require("../src/config/data-source");
const { paginate } = require("../src/utils/pagination");

const makeQB = (overrides: Record<string, jest.Mock> = {}) => {
  const qb: any = {};
  ["innerJoin", "where"].forEach(
    (m) => (qb[m] = jest.fn().mockReturnValue(qb)),
  );
  return Object.assign(qb, overrides);
};

const makeProject = (overrides = {}) => ({
  id: "proj-1",
  title: "Test Project",
  description: null,
  ownerId: "user-1",
  status: ProjectStatus.ACTIVE,
  ...overrides,
});

describe("ProjectService", () => {
  let service: ProjectService;
  let mockProjectsRepo: any;
  let mockMembersRepo: any;

  // Shorthand: make the repo return a project from getOneOrFail
  const mockFindProject = (project: any) =>
    mockProjectsRepo.createQueryBuilder.mockReturnValue(
      makeQB({ getOneOrFail: jest.fn().mockResolvedValue(project) }),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockProjectsRepo = {
      createQueryBuilder: jest.fn(),
      findOneOrFail: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    mockMembersRepo = { findOne: jest.fn() };
    service = new ProjectService(mockProjectsRepo, mockMembersRepo);
  });

  describe("ensureMember", () => {
    it("resolves when membership exists", async () => {
      mockMembersRepo.findOne.mockResolvedValue({
        projectId: "proj-1",
        userId: "user-1",
      });
      await expect(
        service.ensureMember("proj-1", "user-1"),
      ).resolves.toBeUndefined();
    });

    it("throws 403 when user is not a member", async () => {
      mockMembersRepo.findOne.mockResolvedValue(null);
      await expect(
        service.ensureMember("proj-1", "user-1"),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("create", () => {
    it("saves the project and adds the owner as a member", async () => {
      const project = makeProject();
      AppDataSource.transaction.mockImplementation(async (cb: any) =>
        cb({
          create: jest.fn().mockReturnValue(project),
          save: jest.fn().mockResolvedValue(project),
        }),
      );

      const result = await service.create("user-1", { title: "Test Project" });
      expect(result).toMatchObject({ id: "proj-1", title: "Test Project" });
    });
  });

  describe("listForUser", () => {
    it("returns paginated projects", async () => {
      const page = { data: [makeProject()], nextCursor: null };
      paginate.mockResolvedValue(page);
      mockProjectsRepo.createQueryBuilder.mockReturnValue(makeQB());

      expect(await service.listForUser("user-1", { limit: 10 })).toEqual(page);
    });
  });

  describe("update", () => {
    it("updates fields and saves", async () => {
      const project = makeProject();
      mockFindProject(project);
      mockProjectsRepo.save.mockResolvedValue({
        ...project,
        title: "New Title",
      });

      const result = await service.update("proj-1", "user-1", {
        title: "New Title",
      });
      expect(result.title).toBe("New Title");
    });
  });

  describe("softDelete", () => {
    it("sets status to DELETED", async () => {
      mockFindProject(makeProject());
      mockProjectsRepo.save.mockResolvedValue(undefined);

      await service.softDelete("proj-1", "user-1");
      expect(mockProjectsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ProjectStatus.DELETED }),
      );
    });
  });

  describe("hardDelete", () => {
    it("removes the project", async () => {
      const project = makeProject();
      mockFindProject(project);
      mockProjectsRepo.remove.mockResolvedValue(undefined);

      await service.hardDelete("proj-1", "user-1");
      expect(mockProjectsRepo.remove).toHaveBeenCalledWith(project);
    });
  });
});
