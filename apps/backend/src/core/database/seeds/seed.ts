import * as bcrypt from 'bcryptjs';
import { UserEntity } from '@modules/users/user.entity';
import { LessonEntity } from '@modules/lessons/lesson.entity';
import { LessonParticipantEntity } from '@modules/lessons/lesson-participant.entity';
import { AppDataSource } from '../data-source';

async function seed() {
  const connection = AppDataSource;

  if (!connection.isInitialized) {
    await connection.initialize();
  }

  const userRepo = connection.getRepository(UserEntity);
  const lessonRepo = connection.getRepository(LessonEntity);
  const participantRepo = connection.getRepository(LessonParticipantEntity);

  // Clear existing data
  await participantRepo.delete({});
  await lessonRepo.delete({});
  await userRepo.delete({});

  // Create teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = userRepo.create({
    email: 'teacher@example.com',
    passwordHash: teacherPassword,
    firstName: 'María',
    lastName: 'García',
    role: 'teacher',
    timezone: 'Europe/Madrid',
    subscriptionStatus: 'active',
  });
  await userRepo.save(teacher);

  // Create students
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [];

  for (let i = 1; i <= 3; i++) {
    const student = userRepo.create({
      email: `student${i}@example.com`,
      passwordHash: studentPassword,
      firstName: `Ученик ${i}`,
      lastName: 'Иванов',
      role: 'student',
      timezone: 'Europe/Moscow',
      subscriptionStatus: 'active',
    });
    students.push(await userRepo.save(student));
  }

  // Create lessons (mix of upcoming and past)
  const now = new Date();
  const lessons = [];

  // Upcoming lessons (next 2 weeks)
  for (let i = 0; i < 6; i++) {
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() + i + 1);
    startTime.setHours(18, 0, 0, 0);

    const lesson = lessonRepo.create({
      teacherId: teacher.id,
      title: `Урок ${i + 1}: ${['Present Perfect', 'Past Simple', 'Future Tense', 'Conditionals', 'Reported Speech', 'Passive Voice'][i]}`,
      description: 'Индивидуальный урок испанского',
      language: 'es',
      level: 'B1',
      startTime,
      durationMinutes: 60,
      type: 'individual',
      status: 'scheduled',
    });
    lessons.push(await lessonRepo.save(lesson));
  }

  // Past lessons (last 2 weeks)
  for (let i = 0; i < 4; i++) {
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - (i + 1));
    startTime.setHours(18, 0, 0, 0);

    const lesson = lessonRepo.create({
      teacherId: teacher.id,
      title: `Завершённый урок ${i + 1}`,
      description: 'Индивидуальный урок испанского',
      language: 'es',
      level: 'B1',
      startTime,
      durationMinutes: 60,
      type: 'individual',
      status: 'completed',
    });
    lessons.push(await lessonRepo.save(lesson));
  }

  // Assign students to lessons
  for (const student of students) {
    for (const lesson of lessons) {
      const participant = participantRepo.create({
        lessonId: lesson.id,
        studentId: student.id,
      });
      await participantRepo.save(participant);
    }
  }

  console.log('✓ Database seeded successfully');
  console.log(`  - 1 teacher: teacher@example.com (password: teacher123)`);
  console.log(`  - 3 students: student1@example.com, student2@example.com, student3@example.com (password: student123)`);
  console.log(`  - 10 lessons (6 upcoming, 4 past)`);
  console.log(`  - All students enrolled in all lessons`);
}

seed().catch(console.error).finally(() => process.exit(0));
