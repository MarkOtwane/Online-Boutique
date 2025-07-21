import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  findUnique(arg0: { where: { email: string } }) {
    throw new Error('Method not implemented.');
  }
  async onModuleInit() {
    await this.$connect();
    console.log('Connected to the database via prisma');
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
