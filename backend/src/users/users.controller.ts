/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() data: { email: string; password: string; role?: string },
  ): Promise<User> {
    return this.usersService.createUser(data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req): Promise<User> {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user;
  }
}
