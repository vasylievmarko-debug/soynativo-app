import type { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { UserService } from './user.service';
import { ListUsersQuerySchema, UpdateUserSchema } from './dto/user.dto';
import { UnauthorizedException } from '@shared/exceptions/http.exception';

@injectable()
export class UserController {
  constructor(private readonly users: UserService) {}

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedException();
    const user = await this.users.getById(req.user.id);
    res.json({ data: user });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.users.getById(req.params.id);
    res.json({ data: user });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const dto = UpdateUserSchema.parse(req.body);
    const user = await this.users.update(req.params.id, dto);
    res.json({ data: user });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const query = ListUsersQuerySchema.parse(req.query);
    const result = await this.users.list(query);
    res.json(result);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.users.delete(req.params.id);
    res.status(204).send();
  };
}
