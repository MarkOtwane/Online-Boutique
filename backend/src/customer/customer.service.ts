import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService){}

  async create(data: CreateCustomerDto) {
    try{
      const customerExists = await this.prisma.customer.findUnique({
        where: {email: data.email},
      });
      if(customerExists){
        throw new ConflictException(`customer with ${customerExists.id} exist`);
      }
      return await this.prisma.customer.create({
        data:data,
      });
    }catch(error){
      if(error instanceof ConflictException){
        throw error;
      }
      throw new Error(`Failed to create: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.customer.findMany();

  }

  async findOne(id: number) {
    return await this.prisma.customer.findUnique({
      where: {id},
    })
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: {id},
      data: updateCustomerDto
    })
  }

  async remove(id: number) {
    return await this.prisma.customer.delete({
      where: {id}
    })
  }
}
