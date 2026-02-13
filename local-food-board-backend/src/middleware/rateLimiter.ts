import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 300, // 100 запросов
  message: 'Слишком много запросов, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 попыток логина
  message: 'Слишком много попыток входа, попробуйте через минуту',
  skipSuccessfulRequests: true
});