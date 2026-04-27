const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/soynativo',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  GOOGLE_MEET_API_KEY: process.env.GOOGLE_MEET_API_KEY || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:19006',
};

export default env;
