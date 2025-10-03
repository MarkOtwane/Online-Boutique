import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() data: { email: string; password: string; role?: string },
  ): Promise<User> {
    return this.usersService.createUser(data);
  }
}
