import { z } from 'zod';
import type { UserEntity } from '../user.entity';

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  telegramChatId: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  timezone: z.string().optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export const ListUsersCursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
});
export type ListUsersCursorQuery = z.infer<typeof ListUsersCursorQuerySchema>;

export interface UserPublicDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  timezone: string;
  subscriptionStatus: 'trial' | 'active' | 'expired';
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
    timezone: u.timezone,
    subscriptionStatus: u.subscriptionStatus,
    notificationsEnabled: u.notificationsEnabled,
    createdAt: u.createdAt,
  };
}
