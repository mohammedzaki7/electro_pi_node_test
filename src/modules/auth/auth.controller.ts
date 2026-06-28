import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly service: AuthService = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login({
      email: req.body.email,
      password: req.body.password,
    });
    res.status(200).json(result);
  };
}
