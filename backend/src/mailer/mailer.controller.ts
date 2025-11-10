/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SendEmailDto } from './dto/send-email.dto';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async sendEmail(@Body() dto: SendEmailDto) {
    await this.mailerService.sendEmail({
      to: dto.to,
      template: dto.template,
      context: dto.context,
      from: dto.from,
    });
    return { message: 'Email queued successfully' };
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getEmailLogs(
    @Query('status') status?: string,
    @Query('template') template?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.mailerService.getEmailLogs({
      status,
      template,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getEmailStats() {
    return this.mailerService.getEmailStats();
  }
}
