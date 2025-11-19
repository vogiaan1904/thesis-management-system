import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
}));
