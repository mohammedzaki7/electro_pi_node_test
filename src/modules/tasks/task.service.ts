import { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Task, TaskStatus } from "../../entities/task.entity";
import { ProjectMember } from "../../entities/project-member.entity";
import { AppError } from "../../utils/app-error";
import { CursorPage, CursorQuery, paginate } from "../../utils/pagination";

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: number;
  dueDate?: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export class TaskService {
  constructor(
    private readonly tasks: Repository<Task> = AppDataSource.getRepository(
      Task,
    ),
    private readonly members: Repository<ProjectMember> = AppDataSource.getRepository(
      ProjectMember,
    ),
  ) {}

  async listForProject(
    projectId: string,
    userId: string,
    query: CursorQuery,
  ): Promise<CursorPage<Task>> {
    const [membership, page] = await Promise.all([
      this.members.findOne({ where: { projectId, userId } }),
      paginate(
        this.tasks
          .createQueryBuilder("task")
          .where("task.projectId = :projectId", { projectId }),
        "task",
        query,
      ),
    ]);
    if (!membership)
      throw AppError.forbidden("You are not a member of this project");
    return page;
  }

  async getById(
    projectId: string,
    taskId: string,
    userId: string,
  ): Promise<Task> {
    const task = await this.tasks
      .createQueryBuilder("task")
      .innerJoin(
        ProjectMember,
        "pm",
        "pm.projectId = task.projectId AND pm.userId = :userId",
        { userId },
      )
      .where("task.id = :taskId AND task.projectId = :projectId", {
        taskId,
        projectId,
      })
      .getOneOrFail();
    return task;
  }

  async create(
    projectId: string,
    userId: string,
    input: CreateTaskInput,
  ): Promise<Task> {
    const membership = await this.members.findOne({
      where: { projectId, userId },
    });
    if (!membership) {
      throw AppError.forbidden("You are not a member of this project");
    }

    const task = this.tasks.create({
      projectId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? 1,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });
    return this.tasks.save(task);
  }

  async update(
    projectId: string,
    taskId: string,
    userId: string,
    input: UpdateTaskInput,
  ): Promise<Task> {
    const task = await this.getById(projectId, taskId, userId);
    return this.applyTaskUpdate(task, input);
  }

  async updateAsAdmin(
    projectId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<Task> {
    const task = await this.tasks.findOneOrFail({
      where: { id: taskId, projectId },
    });
    return this.applyTaskUpdate(task, input);
  }

  async remove(
    projectId: string,
    taskId: string,
    userId: string,
  ): Promise<void> {
    const task = await this.getById(projectId, taskId, userId);
    await this.tasks.remove(task);
  }

  async removeAsAdmin(projectId: string, taskId: string): Promise<void> {
    const task = await this.tasks.findOneOrFail({
      where: { id: taskId, projectId },
    });
    await this.tasks.remove(task);
  }

  private async applyTaskUpdate(
    task: Task,
    input: UpdateTaskInput,
  ): Promise<Task> {
    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) {
      task.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    return this.tasks.save(task);
  }
}
