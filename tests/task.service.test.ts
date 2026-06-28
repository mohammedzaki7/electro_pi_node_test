import { TaskService } from "../src/modules/tasks/task.service";
import { TaskStatus } from "../src/entities/task.entity";

jest.mock("../src/config/data-source", () => ({
  AppDataSource: { getRepository: jest.fn() },
}));
jest.mock("../src/utils/pagination", () => ({ paginate: jest.fn() }));

const { paginate } = require("../src/utils/pagination");

const makeQB = (overrides: Record<string, jest.Mock> = {}) => {
  const qb: any = {};
  ["innerJoin", "where"].forEach(
    (m) => (qb[m] = jest.fn().mockReturnValue(qb)),
  );
  return Object.assign(qb, overrides);
};

const makeTask = (overrides = {}) => ({
  id: "task-1",
  projectId: "proj-1",
  title: "Do something",
  description: null,
  status: TaskStatus.TODO,
  priority: 1,
  dueDate: null,
  ...overrides,
});

describe("TaskService", () => {
  let service: TaskService;
  let mockTasksRepo: any;
  let mockMembersRepo: any;

  // Shorthand: make the repo return a task from getOneOrFail
  const mockFindTask = (task: any) =>
    mockTasksRepo.createQueryBuilder.mockReturnValue(
      makeQB({ getOneOrFail: jest.fn().mockResolvedValue(task) }),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockTasksRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      remove: jest.fn(),
    };
    mockMembersRepo = { findOne: jest.fn() };
    service = new TaskService(mockTasksRepo, mockMembersRepo);
  });

  describe("listForProject", () => {
    it("returns paginated tasks for a member", async () => {
      const page = { data: [makeTask()], nextCursor: null };
      mockMembersRepo.findOne.mockResolvedValue({
        projectId: "proj-1",
        userId: "user-1",
      });
      paginate.mockResolvedValue(page);
      mockTasksRepo.createQueryBuilder.mockReturnValue(makeQB());

      expect(
        await service.listForProject("proj-1", "user-1", { limit: 10 }),
      ).toEqual(page);
    });

    it("throws 403 when user is not a member", async () => {
      mockMembersRepo.findOne.mockResolvedValue(null);
      paginate.mockResolvedValue({ data: [], nextCursor: null });
      mockTasksRepo.createQueryBuilder.mockReturnValue(makeQB());

      await expect(
        service.listForProject("proj-1", "user-1", { limit: 10 }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("getById", () => {
    it("returns the task when found", async () => {
      const task = makeTask();
      mockFindTask(task);
      expect(await service.getById("proj-1", "task-1", "user-1")).toEqual(task);
    });

    it("throws when task is not found", async () => {
      mockFindTask(null);
      mockTasksRepo.createQueryBuilder.mockReturnValue(
        makeQB({
          getOneOrFail: jest.fn().mockRejectedValue(new Error("not found")),
        }),
      );
      await expect(
        service.getById("proj-1", "missing", "user-1"),
      ).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("creates and saves a task", async () => {
      const task = makeTask();
      mockMembersRepo.findOne.mockResolvedValue({
        projectId: "proj-1",
        userId: "user-1",
      });
      mockTasksRepo.create.mockReturnValue(task);
      mockTasksRepo.save.mockResolvedValue(task);

      expect(
        await service.create("proj-1", "user-1", { title: "Do something" }),
      ).toEqual(task);
    });

    it("throws 403 when user is not a member", async () => {
      mockMembersRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create("proj-1", "user-1", { title: "Task" }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("defaults status to TODO and priority to 1", async () => {
      mockMembersRepo.findOne.mockResolvedValue({
        projectId: "proj-1",
        userId: "user-1",
      });
      mockTasksRepo.create.mockImplementation((args: any) => args);
      mockTasksRepo.save.mockImplementation((t: any) => Promise.resolve(t));

      const result = await service.create("proj-1", "user-1", {
        title: "Task",
      });
      expect(result.status).toBe(TaskStatus.TODO);
      expect(result.priority).toBe(1);
    });
  });

  describe("update", () => {
    it("updates task fields", async () => {
      const task = makeTask();
      mockFindTask(task);
      mockTasksRepo.save.mockResolvedValue({
        ...task,
        title: "Updated",
        status: TaskStatus.IN_PROGRESS,
      });

      const result = await service.update("proj-1", "task-1", "user-1", {
        title: "Updated",
        status: TaskStatus.IN_PROGRESS,
      });
      expect(result.title).toBe("Updated");
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe("remove", () => {
    it("removes the task", async () => {
      const task = makeTask();
      mockFindTask(task);
      mockTasksRepo.remove.mockResolvedValue(undefined);

      await service.remove("proj-1", "task-1", "user-1");
      expect(mockTasksRepo.remove).toHaveBeenCalledWith(task);
    });
  });
});
