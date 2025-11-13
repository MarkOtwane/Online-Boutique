/* eslint-disable @typescript-eslint/no-unused-vars */
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

  // // ✅ Create products individually to capture IDs
  // const silkScarf = await prisma.product.create({
  //   data: { name: 'Silk Scarf', price: 29.99, categoryId: accessories.id },
  // });
  // const leatherHandbag = await prisma.product.create({
  //   data: { name: 'Leather Handbag', price: 89.99, categoryId: accessories.id },
  // });
  // const woolCoat = await prisma.product.create({
  //   data: { name: 'Wool Coat', price: 149.99, categoryId: clothing.id },
  // });
  // const sunglasses = await prisma.product.create({
  //   data: { name: 'Sunglasses', price: 49.99, categoryId: accessories.id },
  // });
  // const denimJacket = await prisma.product.create({
  //   data: { name: 'Denim Jacket', price: 79.99, categoryId: clothing.id },
  // });
  // const goldNecklace = await prisma.product.create({
  //   data: { name: 'Gold Necklace', price: 199.99, categoryId: accessories.id },
  // });
  // const sneakers = await prisma.product.create({
  //   data: { name: 'Sneakers', price: 99.99, categoryId: clothing.id },
  // });

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

  // ✅ Seed orders with valid product references
  // await prisma.order.create({
  //   data: {
  //     userId: customer.id,
  //     total: 119.98,
  //     orderItems: {
  //       create: [
  //         { productId: silkScarf.id, quantity: 2, price: silkScarf.price },
  //         {
  //           productId: leatherHandbag.id,
  //           quantity: 1,
  //           price: leatherHandbag.price,
  //         },
  //       ],
  //     },
  //   },
  // });

  console.log('✅ Seeded categories, products, users, and orders successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
