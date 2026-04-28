import { z } from 'zod';

// Auth Validators
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.enum(['student', 'teacher', 'admin']).default('student'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// Lesson Validators
export const CreateLessonSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  startTime: z.date(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  maxStudents: z.number().min(1, 'At least 1 student required').default(20),
});

// Booking Validators
export const CreateBookingSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
  notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
