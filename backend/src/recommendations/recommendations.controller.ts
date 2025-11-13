/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  GetRecommendationsQueryDto,
  TrackBehaviorDto,
  UpdateRecommendationDto,
} from './dto/create-recommendation.dto';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRecommendations(
    @Request() req,
    @Query() query: GetRecommendationsQueryDto,
  ) {
    const userId = query.userId || req.user.id;
    return this.recommendationsService.getRecommendations({ ...query, userId });
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateRecommendations(
    @Request() req,
    @Query('userId') userId?: number,
    @Query('limit') limit: number = 10,
  ) {
    const targetUserId = userId || req.user.id;
    return this.recommendationsService.generateRecommendationsForUser(
      targetUserId,
      limit,
    );
  }

  @Post('batch-generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async batchGenerateRecommendations() {
    return this.recommendationsService.batchGenerateRecommendations();
  }

  @Post('track')
  async trackBehavior(@Body() trackBehaviorDto: TrackBehaviorDto) {
    return this.recommendationsService.trackBehavior(trackBehaviorDto);
  }

  @Put(':productId/interaction')
  @UseGuards(JwtAuthGuard)
  async updateRecommendationInteraction(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updates: UpdateRecommendationDto,
  ) {
    return this.recommendationsService.updateRecommendationInteraction(
      req.user.id,
      productId,
      updates,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getRecommendationStats(
    @Request() req,
    @Query('userId') userId?: number,
  ) {
    const targetUserId = userId || req.user.id;
    return this.recommendationsService.getRecommendationStats(targetUserId);
  }

  @Get('stats/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getAllRecommendationStats() {
    return this.recommendationsService.getRecommendationStats();
  }
}
