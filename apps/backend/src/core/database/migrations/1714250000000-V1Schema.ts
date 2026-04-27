import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V1Schema1714250000000 implements MigrationInterface {
  name = 'V1Schema1714250000000';

  public async up(qr: QueryRunner): Promise<void> {
    // Add new enums
    await qr.query(
      `CREATE TYPE lesson_type AS ENUM ('individual', 'group')`
    );

    await qr.query(
      `CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'expired')`
    );

    // Add columns to users table
    await qr.query(
      `ALTER TABLE users ADD COLUMN "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC'`
    );

    await qr.query(
      `ALTER TABLE users ADD COLUMN "subscriptionStatus" subscription_status NOT NULL DEFAULT 'active'`
    );

    // Add type column to lessons table
    await qr.query(
      `ALTER TABLE lessons ADD COLUMN "type" lesson_type NOT NULL DEFAULT 'individual'`
    );

    // Create lesson_participants table
    await qr.query(`
      CREATE TABLE lesson_participants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "lessonId" UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        "studentId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        version INTEGER NOT NULL DEFAULT 1,
        CONSTRAINT uq_lesson_participants_lesson_student UNIQUE ("lessonId", "studentId")
      )
    `);

    // Add index on studentId for fast lookup of student's lessons
    await qr.query(`
      CREATE INDEX idx_lesson_participants_student_id ON lesson_participants("studentId")
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    // Drop lesson_participants table
    await qr.query(`DROP TABLE lesson_participants`);

    // Remove type column from lessons
    await qr.query(`ALTER TABLE lessons DROP COLUMN "type"`);

    // Remove columns from users
    await qr.query(`ALTER TABLE users DROP COLUMN "subscriptionStatus"`);
    await qr.query(`ALTER TABLE users DROP COLUMN "timezone"`);

    // Drop enums
    await qr.query(`DROP TYPE subscription_status`);
    await qr.query(`DROP TYPE lesson_type`);
  }
}
