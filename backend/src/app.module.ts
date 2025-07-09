import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerModule } from './customer/customer.module';
import { Middleware } from 'next/dist/lib/load-custom-routes';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AdminController } from './admin/admin.controller';
import { ProductsController } from './products/products.controller';
import { CustomerController } from './customer/customer.controller';

@Module({
  imports: [AdminModule, PrismaModule, CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer
    .apply(LoggerMiddleware)
    .forRoutes(AdminController, ProductsController, CustomerController)
  }
}
