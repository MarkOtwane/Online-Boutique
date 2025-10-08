/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Type for user data without password (for security)
type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    email: string;
    password: string;
    role?: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role || 'customer',
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true }, // Exclude password
    });
  }
}
