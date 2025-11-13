const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Create a test category first
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
      },
    });
    console.log('✅ Test category created');

    // Create test products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Test Product 1',
          price: 99.99,
          imageUrl: 'https://example.com/product1.jpg',
          categoryId: category.id,
        },
      }),
      prisma.product.create({
        data: {
          name: 'Test Product 2',
          price: 149.99,
          imageUrl: 'https://example.com/product2.jpg',
          categoryId: category.id,
        },
      }),
      prisma.product.create({
        data: {
          name: 'Test Product 3',
          price: 79.99,
          imageUrl: 'https://example.com/product3.jpg',
          categoryId: category.id,
        },
      }),
    ]);

    console.log('✅ Created test products:');
    products.forEach(product => {
      console.log(`   - ${product.name} ($${product.price}) - ID: ${product.id}`);
    });

    console.log('\n🎉 Test data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();