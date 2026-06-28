import { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Project, ProjectStatus } from "../../entities/project.entity";
import { ProjectMember } from "../../entities/project-member.entity";
import { AppError } from "../../utils/app-error";
import { CursorPage, CursorQuery, paginate } from "../../utils/pagination";

export interface CreateProjectInput {
  title: string;
  description?: string | null;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string | null;
  status?: ProjectStatus;
}

export class ProjectService {
  constructor(
    private readonly projects: Repository<Project> = AppDataSource.getRepository(
      Project,
    ),
    private readonly members: Repository<ProjectMember> = AppDataSource.getRepository(
      ProjectMember,
    ),
  ) {}

  /** Throws 403 if the user is not a member of the (non-deleted) project. */
  async ensureMember(projectId: string, userId: string): Promise<void> {
    const membership = await this.members.findOne({
      where: { projectId, userId },
    });
    if (!membership) {
      throw AppError.forbidden("You are not a member of this project");
    }
  }

  async create(ownerId: string, input: CreateProjectInput): Promise<Project> {
    return AppDataSource.transaction(async (manager) => {
      const saved = await manager.save(
        manager.create(Project, {
          title: input.title,
          description: input.description ?? null,
          ownerId: ownerId,
        }),
      );

      // Adding owner as a member of the project
      await manager.save(
        manager.create(ProjectMember, {
          projectId: saved.id,
          userId: ownerId,
        }),
      );
      return saved;
    });
  }

  // List all projects that belong to the user with excluding soft-deleted, cursor-paginated.
  async listForUser(
    userId: string,
    query: CursorQuery,
  ): Promise<CursorPage<Project>> {
    const qb = this.projects
      .createQueryBuilder("project")
      .innerJoin(
        ProjectMember,
        "member",
        "member.project_id = project.id AND member.user_id = :userId",
        { userId },
      )
      .where("project.status != :deleted", {
        deleted: ProjectStatus.DELETED,
      });

    return paginate(qb, "project", query);
  }

  async getById(projectId: string, userId: string): Promise<Project> {
    return this.projects
      .createQueryBuilder("project")
      .innerJoin("project.members", "members", "members.userId = :userId", {
        userId,
      })
      .where("project.id = :projectId", { projectId })
      .andWhere("project.status != :deleted", {
        deleted: ProjectStatus.DELETED,
      })
      .getOneOrFail();
  }

  async update(
    projectId: string,
    userId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const project = await this.getById(projectId, userId);
    return this.applyProjectUpdate(project, input);
  }

  async updateAsAdmin(
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const project = await this.projects.findOneOrFail({
      where: { id: projectId },
    });
    return this.applyProjectUpdate(project, input);
  }

  async softDelete(projectId: string, userId: string): Promise<void> {
    const project = await this.getById(projectId, userId);
    project.status = ProjectStatus.DELETED;
    await this.projects.save(project);
  }

  async softDeleteAsAdmin(projectId: string): Promise<void> {
    const project = await this.projects.findOneOrFail({
      where: { id: projectId },
    });
    project.status = ProjectStatus.DELETED;
    await this.projects.save(project);
  }

  async hardDelete(projectId: string, userId: string): Promise<void> {
    const project = await this.getById(projectId, userId);
    await this.projects.remove(project);
  }

  async hardDeleteAsAdmin(projectId: string): Promise<void> {
    const project = await this.projects.findOneOrFail({
      where: { id: projectId },
    });
    await this.projects.remove(project);
  }

  private async applyProjectUpdate(
    project: Project,
    input: UpdateProjectInput,
  ): Promise<Project> {
    if (input.title !== undefined) project.title = input.title;
    if (input.description !== undefined)
      project.description = input.description;
    if (input.status !== undefined) project.status = input.status;
    return this.projects.save(project);
  }
}
