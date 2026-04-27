export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  lessonId: string;
  studentId: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithDetails extends Booking {
  lesson: {
    id: string;
    title: string;
    startTime: Date;
    duration: number;
    teacher: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateBookingInput {
  lessonId: string;
  notes?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  notes?: string;
}
