import { Request, Response } from "express";
import { TaskService } from "./task.service";

export class TaskController {
  constructor(private readonly service: TaskService = new TaskService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const page = await this.service.listForProject(
      req.params.projectId,
      req.user!.id,
      {
        limit: req.query.limit as number | undefined,
        cursor: req.query.cursor as string | undefined,
      },
    );
    res.status(200).json(page);
  };

  getOne = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.getById(
      req.params.projectId,
      req.params.taskId,
      req.user!.id,
    );
    res.status(200).json(task);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.create(
      req.params.projectId,
      req.user!.id,
      req.body,
    );
    res.status(201).json(task);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.roles.includes("admin");
    const task = isAdmin
      ? await this.service.updateAsAdmin(
          req.params.projectId,
          req.params.taskId,
          req.body,
        )
      : await this.service.update(
          req.params.projectId,
          req.params.taskId,
          req.user!.id,
          req.body,
        );
    res.status(200).json(task);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.roles.includes("admin");
    if (isAdmin) {
      await this.service.removeAsAdmin(req.params.projectId, req.params.taskId);
    } else {
      await this.service.remove(
        req.params.projectId,
        req.params.taskId,
        req.user!.id,
      );
    }
    res.status(200).json({ message: "Task deleted" });
  };
}
