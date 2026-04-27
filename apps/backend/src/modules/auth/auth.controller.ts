import type { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { AuthService } from './auth.service';
import { LoginSchema, RefreshSchema } from './dto/auth.dto';

@injectable()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

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
    // Stateless JWT — for revocation we'd add a Redis blocklist (TODO B1).
    res.status(204).send();
  };
}
