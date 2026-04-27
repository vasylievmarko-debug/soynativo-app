export type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Lesson {
  id: string;
  teacherId: string;
  title: string;
  description?: string;
  language: string;
  level: LessonLevel;
  startTime: Date;
  duration: number; // in minutes
  maxStudents: number;
  status: LessonStatus;
  googleMeetId?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonWithTeacher extends Lesson {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  language: string;
  level: LessonLevel;
  startTime: Date;
  duration: number;
  maxStudents?: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  startTime?: Date;
  duration?: number;
  maxStudents?: number;
  status?: LessonStatus;
}
