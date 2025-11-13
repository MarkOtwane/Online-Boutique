import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import { SmtpProvider } from './providers/smtp.provider';

@Module({
  imports: [ConfigModule],
  controllers: [MailerController],
  providers: [
    MailerService,
    SmtpProvider,
    PrismaService,
    {
      provide: 'EmailProvider',
      useClass: SmtpProvider,
    },
  ],
  exports: [MailerService],
})
export class MailerModule {}
