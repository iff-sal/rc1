import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  // Add other environment variables here as needed
}));