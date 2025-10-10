/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const accessories = await prisma.category.create({
    data: { name: 'Accessories' },
  });
  const clothing = await prisma.category.create({
    data: { name: 'Clothing' },
  });

  // Seed products
  const products = await prisma.product.createMany({
    data: [
      { name: 'Silk Scarf', price: 29.99, categoryId: accessories.id },
      { name: 'Leather Handbag', price: 89.99, categoryId: accessories.id },
      { name: 'Wool Coat', price: 149.99, categoryId: clothing.id },
      { name: 'Sunglasses', price: 49.99, categoryId: accessories.id },
      { name: 'Denim Jacket', price: 79.99, categoryId: clothing.id },
      { name: 'Gold Necklace', price: 199.99, categoryId: accessories.id },
      { name: 'Sneakers', price: 99.99, categoryId: clothing.id },
    ],
  });

  // Seed users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@boutique.com',
      password: adminPassword,
      role: 'admin',
    },
  });
  const customer = await prisma.user.create({
    data: {
      email: 'customer@boutique.com',
      password: customerPassword,
      role: 'customer',
    },
  });

  // Seed orders
  await prisma.order.create({
    data: {
      userId: customer.id,
      total: 119.98,
      orderItems: {
        create: [
          { productId: 1, quantity: 2, price: 29.99 }, // Silk Scarf
          { productId: 2, quantity: 1, price: 89.99 }, // Leather Handbag
        ],
      },
    },
  });

  console.log('Seeded categories, products, users, and orders successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
