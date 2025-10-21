import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLoggerService } from '../auth/logger.service';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  salesChange: number;
  ordersChange: number;
  revenueChange: number;
  customersChange: number;
}

export interface TopProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  amount: number;
  imageUrl?: string;
}

export interface RevenueData {
  month: string;
  current: number;
  previous: number;
}

export interface LocationData {
  city: string;
  sales: number;
}

export interface UserDashboardData {
  totalOrders: number;
  totalSpent: number;
  recentOrders: any[];
  memberSince: string;
  accountStatus: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private logger: CustomLoggerService,
  ) {}

  async getAdminDashboardStats(): Promise<DashboardStats> {
    this.logger.log('Fetching admin dashboard statistics');

    // Get current month data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Get previous month data
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthEnd = new Date(currentYear, currentMonth, 0);

    // Current month stats
    const currentMonthOrders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      include: { orderItems: true },
    });

    // Previous month stats
    const previousMonthOrders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      include: { orderItems: true },
    });

    // Calculate current month metrics
    const currentTotalRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const currentTotalOrders = currentMonthOrders.length;
    const currentTotalCustomers = new Set(
      currentMonthOrders.map((order) => order.userId),
    ).size;

    // Calculate previous month metrics
    const previousTotalRevenue = previousMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const previousTotalOrders = previousMonthOrders.length;
    const previousTotalCustomers = new Set(
      previousMonthOrders.map((order) => order.userId),
    ).size;

    // Calculate changes
    const revenueChange = previousTotalRevenue > 0
      ? ((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
      : 0;
    const ordersChange = previousTotalOrders > 0
      ? ((currentTotalOrders - previousTotalOrders) / previousTotalOrders) * 100
      : 0;
    const customersChange = previousTotalCustomers > 0
      ? ((currentTotalCustomers - previousTotalCustomers) / previousTotalCustomers) * 100
      : 0;

    // Get total sales (sum of all order items quantities)
    const allOrderItems = await this.prisma.orderItem.findMany();
    const totalSales = allOrderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Get total customers
    const totalCustomers = await this.prisma.user.count({
      where: { role: 'customer' },
    });

    return {
      totalSales,
      totalOrders: currentTotalOrders,
      totalRevenue: currentTotalRevenue,
      totalCustomers,
      salesChange: 0, // Would need historical data for this
      ordersChange: Math.round(ordersChange * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
      customersChange: Math.round(customersChange * 100) / 100,
    };
  }

  async getTopProducts(limit: number = 6): Promise<TopProduct[]> {
    this.logger.log(`Fetching top ${limit} products`);

    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productIds = topProducts.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    return topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category?.name || 'Uncategorized',
        quantity: item._sum.quantity || 0,
        amount: product.price * (item._sum.quantity || 0),
        imageUrl: product.imageUrl,
      };
    }).filter((item): item is TopProduct => item !== null);
  }

  async getRevenueData(): Promise<RevenueData[]> {
    this.logger.log('Fetching revenue data for charts');

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const currentYear = new Date().getFullYear();
    const revenueData: RevenueData[] = [];

    for (let i = 0; i < 6; i++) {
      const monthIndex = new Date().getMonth() - i;
      const year = monthIndex < 0 ? currentYear - 1 : currentYear;
      const actualMonthIndex = monthIndex < 0 ? 12 + monthIndex : monthIndex;

      const monthStart = new Date(year, actualMonthIndex, 1);
      const monthEnd = new Date(year, actualMonthIndex + 1, 0);

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const revenue = orders.reduce((sum, order) => sum + order.total, 0);

      revenueData.unshift({
        month: months[actualMonthIndex],
        current: revenue / 1000, // Convert to thousands for display
        previous: revenue / 1000 * 0.8, // Mock previous data
      });
    }

    return revenueData;
  }

  async getLocationData(): Promise<LocationData[]> {
    this.logger.log('Fetching location data');

    // Mock location data - in a real app, you'd have user addresses
    return [
      { city: 'New York', sales: 72000 },
      { city: 'San Francisco', sales: 39000 },
      { city: 'Sydney', sales: 25000 },
      { city: 'Singapore', sales: 61000 },
    ];
  }

  async getUserDashboardData(userId: number): Promise<UserDashboardData> {
    this.logger.log(`Fetching dashboard data for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5, // Recent 5 orders
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    const recentOrders = orders.map((order) => ({
      id: order.id,
      date: order.createdAt.toISOString(),
      status: order.status || 'Processing',
      total: order.total,
      items: order.orderItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    return {
      totalOrders: orders.length,
      totalSpent,
      recentOrders,
      memberSince: user.createdAt.toISOString(),
      accountStatus: 'Active',
    };
  }

  async generateReport(type: 'sales' | 'products' | 'customers', startDate?: Date, endDate?: Date): Promise<any> {
    this.logger.log(`Generating ${type} report`);

    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    switch (type) {
      case 'sales':
        const salesOrders = await this.prisma.order.findMany({
          where: whereClause,
          include: { orderItems: { include: { product: true } }, user: true },
          orderBy: { createdAt: 'desc' },
        });

        return {
          type: 'sales',
          period: { startDate, endDate },
          totalOrders: salesOrders.length,
          totalRevenue: salesOrders.reduce((sum, order) => sum + order.total, 0),
          orders: salesOrders,
        };

      case 'products':
        const productStats = await this.prisma.orderItem.groupBy({
          by: ['productId'],
          where: whereClause,
          _sum: { quantity: true },
          _count: { productId: true },
          orderBy: { _sum: { quantity: 'desc' } },
        });

        const productIds = productStats.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { category: true },
        });

        return {
          type: 'products',
          period: { startDate, endDate },
          products: productStats.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              id: product?.id,
              name: product?.name,
              category: product?.category?.name,
              quantitySold: item._sum.quantity,
              orderCount: item._count.productId,
            };
          }),
        };

      case 'customers':
        const customerOrders = await this.prisma.order.findMany({
          where: whereClause,
          include: { user: true },
        });

        const customerStats = customerOrders.reduce((acc, order) => {
          const userId = order.userId;
          if (!acc[userId]) {
            acc[userId] = {
              user: order.user,
              totalOrders: 0,
              totalSpent: 0,
            };
          }
          acc[userId].totalOrders++;
          acc[userId].totalSpent += order.total;
          return acc;
        }, {} as any);

        return {
          type: 'customers',
          period: { startDate, endDate },
          customers: Object.values(customerStats),
        };

      default:
        throw new Error('Invalid report type');
    }
  }
}
