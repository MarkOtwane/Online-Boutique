/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
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
  CreateReviewDto,
  MarkHelpfulDto,
  ReviewQueryDto,
  UpdateReviewDto,
} from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, createReviewDto);
  }

  @Get()
  async getReviews(@Query() query: ReviewQueryDto) {
    return this.reviewsService.getReviews(query);
  }

  @Get('product/:productId')
  async getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: Omit<ReviewQueryDto, 'productId'>,
  ) {
    return this.reviewsService.getReviews({ ...query, productId });
  }

  @Get('user/:userId')
  async getUserReviews(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: Omit<ReviewQueryDto, 'userId'>,
  ) {
    return this.reviewsService.getReviews({ ...query, userId });
  }

  @Get('statistics/:productId')
  async getReviewStatistics(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewsService.getReviewStatistics(productId);
  }

  @Get('can-review/:productId')
  @UseGuards(JwtAuthGuard)
  async canUserReview(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewsService.canUserReview(req.user.id, productId);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getPendingReviews(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getPendingReviews(page, limit);
  }

  @Get(':id')
  async getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.id, id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(req.user.id, id);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  async markHelpful(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() markHelpfulDto: MarkHelpfulDto,
  ) {
    return this.reviewsService.markHelpful(req.user.id, id, markHelpfulDto);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async approveReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.approveReview(id);
  }
}
