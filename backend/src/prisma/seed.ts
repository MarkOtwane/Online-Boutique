import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const accessories = await prisma.category.create({
    data: { name: 'Accessories' },
  });
  const clothing = await prisma.category.create({
    data: { name: 'Clothing' },
  });

  // Clear existing products
  await prisma.product.deleteMany();

  // Seed products with category assignments
  await prisma.product.createMany({
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

  // Clear existing users
  await prisma.user.deleteMany();

  // Seed users with hashed passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.createMany({
    data: [
      { email: 'admin@boutique.com', password: adminPassword, role: 'admin' },
      {
        email: 'customer@boutique.com',
        password: customerPassword,
        role: 'customer',
      },
    ],
  });

  console.log('Seeded categories, products, and users successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
