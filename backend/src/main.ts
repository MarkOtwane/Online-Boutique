/* eslint-disable @typescript-eslint/no-floating-promises */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://www.googletagmanager.com',
          ],
          connectSrc: [
            "'self'",
            'https://www.google-analytics.com',
            'https://online-boutique-tv00.onrender.com',
          ],
          imgSrc: ["'self'", 'data:', 'https:'],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(
    compression({
      threshold: 1024,
    }),
  );

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
