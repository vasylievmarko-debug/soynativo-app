import bcrypt from 'bcryptjs';
import { env } from '@config/env';
import { UserEntity } from '@modules/users/user.entity';
import { LessonEntity } from '@modules/lessons/lesson.entity';
import { LessonParticipantEntity } from '@modules/lessons/lesson-participant.entity';
import { AppDataSource } from '../data-source';

const LESSONS_PER_STUDENT = 6;
const PAST_LESSONS_PER_STUDENT = 3; // first half: past, second half: upcoming

async function seed(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    console.error('❌ Seed forbidden in production');
    process.exit(1);
  }

  const connection = AppDataSource;
  if (!connection.isInitialized) {
    await connection.initialize();
  }

  const userRepo = connection.getRepository(UserEntity);
  const lessonRepo = connection.getRepository(LessonEntity);
  const participantRepo = connection.getRepository(LessonParticipantEntity);

  // Clear existing data using safer query builder (delete({}) can be ambiguous).
  await participantRepo.createQueryBuilder().delete().execute();
  await lessonRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();

  // Create teacher
  const teacherPassword = await bcrypt.hash('teacher123', env.BCRYPT_ROUNDS);
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

  // Create 3 students
  const studentPassword = await bcrypt.hash('student123', env.BCRYPT_ROUNDS);
  const students: UserEntity[] = [];
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

  // For each student, create individual lessons (one participant per lesson).
  // Half in the past (completed), half upcoming (scheduled).
  const lessonTitles = [
    'Present Perfect',
    'Past Simple',
    'Future Tense',
    'Conditionals',
    'Reported Speech',
    'Passive Voice',
    'Subjunctive Mood',
  ];

  const now = new Date();
  let totalLessons = 0;
  let totalParticipants = 0;

  for (const [studentIdx, student] of students.entries()) {
    for (let i = 0; i < LESSONS_PER_STUDENT; i++) {
      const isPast = i < PAST_LESSONS_PER_STUDENT;
      const dayOffset = isPast ? -(PAST_LESSONS_PER_STUDENT - i) : i - PAST_LESSONS_PER_STUDENT + 1;

      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + dayOffset);
      // Spread lessons across the day to avoid teacher conflicts in mock data.
      startTime.setHours(10 + studentIdx * 2, 0, 0, 0);

      const lesson = lessonRepo.create({
        teacherId: teacher.id,
        title: `${lessonTitles[i % lessonTitles.length]} (Ученик ${studentIdx + 1})`,
        description: 'Индивидуальный урок испанского',
        language: 'es',
        level: 'B1',
        startTime,
        durationMinutes: 60,
        type: 'individual',
        status: isPast ? 'completed' : 'scheduled',
      });
      const saved = await lessonRepo.save(lesson);
      totalLessons += 1;

      // Exactly ONE participant per individual lesson — the assigned student.
      await participantRepo.save(
        participantRepo.create({
          lessonId: saved.id,
          studentId: student.id,
        })
      );
      totalParticipants += 1;
    }
  }

  console.log('✓ Database seeded successfully');
  console.log(`  - 1 teacher: teacher@example.com (password: teacher123)`);
  console.log(`  - 3 students: student1@example.com, student2@example.com, student3@example.com (password: student123)`);
  console.log(`  - ${totalLessons} individual lessons (${PAST_LESSONS_PER_STUDENT * 3} past, ${(LESSONS_PER_STUDENT - PAST_LESSONS_PER_STUDENT) * 3} upcoming)`);
  console.log(`  - ${totalParticipants} lesson_participants (1 student per lesson — true individual)`);
  console.log(`  - bcrypt rounds: ${env.BCRYPT_ROUNDS}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
