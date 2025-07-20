/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAdminDto) {
    try {
      const existAdmin = await this.prisma.admin.findUnique({
        where: { email: data.email },
      });
      if (existAdmin) {
        throw new ConflictException(`Admin ${existAdmin.id}`);
      }
      return await this.prisma.admin.create({
        data: data,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create : ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.admin.findMany();
  }

  findOne(id: number) {
    return this.prisma.admin.findUnique({
      where: { id },
    });
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return this.prisma.admin.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.admin.delete({
      where: { id },
    });
  }
}
