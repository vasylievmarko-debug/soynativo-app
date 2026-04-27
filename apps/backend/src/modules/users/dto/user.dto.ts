import { z } from 'zod';
import type { UserEntity } from '../user.entity';

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  telegramChatId: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export const ListUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
});
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

export interface UserPublicDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  notificationsEnabled: boolean;
  createdAt: Date;
}

export function toUserPublicDto(u: UserEntity): UserPublicDto {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl,
    role: u.role,
    status: u.status,
    notificationsEnabled: u.notificationsEnabled,
    createdAt: u.createdAt,
  };
}
