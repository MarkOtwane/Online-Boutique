/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
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
import { CreateRepostDto } from './create-repost.dto';
import { RepostsService } from './reposts.service';

@Controller('reposts')
export class RepostsController {
  constructor(private readonly repostsService: RepostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRepost(@Request() req, @Body() dto: CreateRepostDto) {
    return this.repostsService.createRepost(req.user.id, dto);
  }

  @Get('products/:productId')
  async getProductReposts(@Param('productId', ParseIntPipe) productId: number) {
    return this.repostsService.getProductReposts(productId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRepost(
    @Request() req,
    @Param('id', ParseIntPipe) repostId: number,
  ) {
    return this.repostsService.deleteRepost(req.user.id, repostId);
  }
}
