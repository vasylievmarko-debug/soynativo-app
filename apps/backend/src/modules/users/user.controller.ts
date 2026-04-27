import type { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { UserService } from './user.service';
import { UnauthorizedException } from '@shared/exceptions/http.exception';

@injectable()
export class UserController {
  constructor(private readonly users: UserService) {}

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedException();
    const user = await this.users.getById(req.user.id);
    res.json({ data: user });
  };
}
