import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

// Type for user data without password (for security)
type UserWithoutPassword = Omit<User, 'password'>;

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
  async getCurrentUser(
    @Req() req: Request & { user: { id: string } },
  ): Promise<UserWithoutPassword> {
    const userId = parseInt(req.user.id, 10);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
