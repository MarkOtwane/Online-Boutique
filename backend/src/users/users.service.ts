/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
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
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        isOnline: true,
        lastSeen: true,
      }, // Exclude password
    });
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        isOnline: true,
        lastSeen: true,
      }, // Exclude password
    });
  }

  async updateUser(
    id: number,
    data: { email?: string; role?: string },
  ): Promise<UserWithoutPassword> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          isOnline: true,
          lastSeen: true,
        }, // Exclude password
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async deleteUser(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
