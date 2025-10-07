/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  findAll(): { name: string; id: number; createdAt: Date; }[] | PromiseLike<{ name: string; id: number; createdAt: Date; }[]> {
    throw new Error('Method not implemented.');
  }
}
