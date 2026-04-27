import type { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { AuthService } from './auth.service';
import { LoginSchema, RefreshSchema, RegisterSchema } from './dto/auth.dto';

@injectable()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const dto = RegisterSchema.parse(req.body);
    const result = await this.auth.register(dto);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const dto = LoginSchema.parse(req.body);
    const result = await this.auth.login(dto);
    res.json(result);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const dto = RefreshSchema.parse(req.body);
    const tokens = await this.auth.refresh(dto.refreshToken);
    res.json({ tokens });
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    // Stateless JWT — for revocation we'd add a Redis blocklist (TODO).
    res.status(204).send();
  };
}
