import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema. Index strategy is opinionated for the read patterns we
 * already know (see GLOSSARY.md / API.md):
 *
 * - users: lookup by email (login), by id (everything else)
 * - lessons: list by teacher + time range; list upcoming globally
 * - bookings: list by student; list by lesson; uniqueness (lesson, student)
 * - notifications: list user's recent unread (most common feed query)
 *
 * Composite indexes are ordered by selectivity — most-selective column first
 * inside an equality, range column last. This lets PG use the index for
 * (=, =, >) queries without a sort step.
 */
export class InitialSchema1714200000000 implements MigrationInterface {
  name = 'InitialSchema1714200000000';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await qr.query(`
      CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
      CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
      CREATE TYPE lesson_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
      CREATE TYPE lesson_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
      CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
      CREATE TYPE notification_type AS ENUM (
        'lesson_created', 'lesson_rescheduled', 'booking_confirmed', 'lesson_starting', 'recording_ready'
      );
    `);

    await qr.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        "avatarUrl" VARCHAR(500),
        role user_role NOT NULL DEFAULT 'student',
        status user_status NOT NULL DEFAULT 'active',
        "telegramChatId" VARCHAR(255),
        "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        version INTEGER NOT NULL DEFAULT 1
      )
    `);

    await qr.query(`
      CREATE TABLE lessons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "teacherId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        language VARCHAR(50) NOT NULL,
        level lesson_level NOT NULL,
        "startTime" TIMESTAMPTZ NOT NULL,
        "durationMinutes" INTEGER NOT NULL,
        "maxStudents" INTEGER NOT NULL DEFAULT 20,
        status lesson_status NOT NULL DEFAULT 'scheduled',
        "googleMeetId" VARCHAR(255),
        "recordingUrl" VARCHAR(500),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        version INTEGER NOT NULL DEFAULT 1
      )
    `);

    await qr.query(`
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "lessonId" UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        "studentId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status booking_status NOT NULL DEFAULT 'pending',
        notes TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        version INTEGER NOT NULL DEFAULT 1,
        CONSTRAINT uq_bookings_lesson_student UNIQUE ("lessonId", "studentId")
      )
    `);

    await qr.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "lessonId" UUID REFERENCES lessons(id) ON DELETE SET NULL,
        type notification_type NOT NULL,
        content TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "telegramSent" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        version INTEGER NOT NULL DEFAULT 1
      )
    `);

    // Indexes — created normally on initial migration (table is empty so
    // CONCURRENTLY isn't needed). Subsequent migrations on a hot table MUST
    // use CREATE INDEX CONCURRENTLY (see migrations/README.md).

    // users: login is the hottest path. Partial index excludes soft-deleted
    // rows so the index stays small and the unique constraint allows email
    // reuse after deletion.
    await qr.query(
      `CREATE UNIQUE INDEX idx_users_email_active ON users (lower(email)) WHERE "deletedAt" IS NULL`
    );
    await qr.query(`CREATE INDEX idx_users_role ON users (role) WHERE "deletedAt" IS NULL`);

    // lessons: most queries filter by (teacherId AND startTime range). Time
    // range as last column lets PG use index for >, <, BETWEEN.
    await qr.query(`CREATE INDEX idx_lessons_teacher_time ON lessons ("teacherId", "startTime")`);
    // Upcoming lessons feed — partial index by status keeps it small.
    await qr.query(
      `CREATE INDEX idx_lessons_upcoming ON lessons ("startTime") WHERE status = 'scheduled'`
    );

    // bookings: student's list (sorted by createdAt) is most common.
    await qr.query(`CREATE INDEX idx_bookings_student_created ON bookings ("studentId", "createdAt" DESC)`);
    await qr.query(`CREATE INDEX idx_bookings_lesson ON bookings ("lessonId")`);

    // notifications: feed of user's recent items, often filtered to unread.
    await qr.query(
      `CREATE INDEX idx_notifications_user_created ON notifications ("userId", "createdAt" DESC)`
    );
    await qr.query(
      `CREATE INDEX idx_notifications_unread ON notifications ("userId", "createdAt" DESC) WHERE "isRead" = false`
    );
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS bookings CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS lessons CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS users CASCADE`);
    await qr.query(`
      DROP TYPE IF EXISTS notification_type;
      DROP TYPE IF EXISTS booking_status;
      DROP TYPE IF EXISTS lesson_status;
      DROP TYPE IF EXISTS lesson_level;
      DROP TYPE IF EXISTS user_status;
      DROP TYPE IF EXISTS user_role;
    `);
  }
}
