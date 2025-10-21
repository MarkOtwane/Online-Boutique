import { Controller, Get, UseGuards, SetMetadata, Request, Query, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles.guard';
import { DashboardService, DashboardStats, TopProduct, RevenueData, LocationData, UserDashboardData } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getAdminStats(): Promise<DashboardStats> {
    return this.dashboardService.getAdminDashboardStats();
  }

  @Get('admin/top-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getTopProducts(@Query('limit', ParseIntPipe) limit: number = 6): Promise<TopProduct[]> {
    return this.dashboardService.getTopProducts(limit);
  }

  @Get('admin/revenue-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getRevenueData(): Promise<RevenueData[]> {
    return this.dashboardService.getRevenueData();
  }

  @Get('admin/location-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getLocationData(): Promise<LocationData[]> {
    return this.dashboardService.getLocationData();
  }

  @Get('admin/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async generateReport(
    @Query('type') type: 'sales' | 'products' | 'customers',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.generateReport(type, start, end);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserDashboard(@Request() req): Promise<UserDashboardData> {
    return this.dashboardService.getUserDashboardData(req.user.id);
  }
}
