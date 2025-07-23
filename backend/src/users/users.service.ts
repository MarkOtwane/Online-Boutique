/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customer, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id: userId as unknown as customer['id'] },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.customer.update({
      where: { id: userId as unknown as customer['id'] },
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.customer.findUnique({
      where: { id: userId as unknown as customer['id'] },
    });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new ForbiddenException('Incorrect current password');

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.customer.update({
      where: { id: userId as unknown as customer['id'] },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully.' };
  }

  async softDeleteUser(userId: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id: userId as unknown as customer['id'] },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role.includes(Role.ADMIN))
      throw new ForbiddenException('Admin users cannot be deleted.');
    await this.prisma.customer.update({
      where: { id: userId as unknown as customer['id'] },
      data: { deletedAt: new Date() } as Prisma.customerUpdateInput,
    });
    return { message: 'User account deactivated.' };
  }

  async getAllUsers(role: Role) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.customer.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getUserById(id: string, role: Role) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.prisma.customer.findUnique({
      where: { id: parseInt(id), deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto, role: Role) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.prisma.customer.findUnique({
      where: { id: parseInt(id), deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteUser(id: string, role: Role) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.prisma.customer.findUnique({
      where: { id: parseInt(id), deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admin from deleting themselves
    if (user.role.includes(Role.ADMIN)) {
      throw new ForbiddenException('Cannot delete admin users');
    }

    // Soft delete by setting deletedAt timestamp
    const deleted = await this.prisma.customer.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        email: true,
        role: true,
        deletedAt: true,
      },
    });

    return { message: 'User deleted successfully', user: deleted };
  }
}
