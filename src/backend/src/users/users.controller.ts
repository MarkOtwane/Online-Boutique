import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
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

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async findAll(): Promise<UserWithoutPassword[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithoutPassword | null> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { email?: string; role?: string },
  ): Promise<UserWithoutPassword> {
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async delete(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deleteUser(id);
  }
}
