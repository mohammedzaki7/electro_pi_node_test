import { Request, Response } from "express";
import { ProjectService } from "./project.service";

export class ProjectController {
  constructor(
    private readonly service: ProjectService = new ProjectService(),
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const project = await this.service.create(req.user!.id, {
      title: req.body.title,
      description: req.body.description ?? null,
    });
    res.status(201).json(project);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const page = await this.service.listForUser(req.user!.id, {
      limit: req.query.limit as number | undefined,
      cursor: req.query.cursor as string | undefined,
    });
    res.status(200).json(page);
  };

  getOne = async (req: Request, res: Response): Promise<void> => {
    const project = await this.service.getById(req.params.id, req.user!.id);
    res.status(200).json(project);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.roles.includes("admin");
    const input = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
    };
    const project = isAdmin
      ? await this.service.updateAsAdmin(req.params.id, input)
      : await this.service.update(req.params.id, req.user!.id, input);
    res.status(200).json(project);
  };

  // DELETE /projects/:id            -> soft delete (status = deleted)
  // DELETE /projects/:id?hard=true  -> permanent delete
  remove = async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.roles.includes("admin");
    const hard = req.query.hard === "true";
    if (hard) {
      isAdmin
        ? await this.service.hardDeleteAsAdmin(req.params.id)
        : await this.service.hardDelete(req.params.id, req.user!.id);
      res.status(200).json({ message: "Project permanently deleted" });
      return;
    }
    isAdmin
      ? await this.service.softDeleteAsAdmin(req.params.id)
      : await this.service.softDelete(req.params.id, req.user!.id);
    res.status(200).json({ message: "Project deleted" });
  };
}
