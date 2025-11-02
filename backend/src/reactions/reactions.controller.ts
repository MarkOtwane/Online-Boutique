/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReactionsService } from './reactions.service';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('products/:productId')
  @UseGuards(JwtAuthGuard)
  async toggleReaction(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reactionsService.toggleReaction(req.user.id, productId);
  }

  @Get('products/:productId')
  async getProductReactions(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reactionsService.getProductReactions(productId);
  }

  @Get('products/:productId/user')
  @UseGuards(JwtAuthGuard)
  async getUserReaction(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reactionsService.getUserReaction(req.user.id, productId);
  }
}