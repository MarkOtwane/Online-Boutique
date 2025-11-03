import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomLoggerService } from './auth/logger.service';
import { CategoriesModule } from './categories/categories.module';
import { ChatModule } from './chat/chat.module';
import { CommentsModule } from './comments/comments.module';
import { CommunityModule } from './community/community.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaService } from './prisma/prisma.service';
import { ProductsModule } from './products/products.module';
import { RepostsModule } from './reposts/reposts.module';
import { ReactionsModule } from './reactions/reactions.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ProductsModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    CommentsModule,
    RepostsModule,
    ReactionsModule,
    ChatModule,
    CommunityModule,
    DashboardModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, CustomLoggerService],
})
export class AppModule {}
