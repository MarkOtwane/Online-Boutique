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
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('products/:productId/comments')
  async getProductComments(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.commentsService.getProductComments(productId);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  async createComment(@Request() req, @Body() dto: CreateCommentDto) {
    return this.commentsService.createComment(req.user.id, dto);
  }

  @Put('comments/:id')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Request() req,
    @Param('id', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(req.user.id, commentId, dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Request() req,
    @Param('id', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.deleteComment(req.user.id, commentId);
  }

  @Put('comments/:id/admin-response')
  @UseGuards(JwtAuthGuard)
  async markAsAdminResponse(
    @Request() req,
    @Param('id', ParseIntPipe) commentId: number,
    @Body() body: { isOfficialResponse?: boolean },
  ) {
    return this.commentsService.markAsAdminResponse(
      req.user.id,
      commentId,
      body.isOfficialResponse || false,
    );
  }

  @Get('admin-responses')
  @UseGuards(JwtAuthGuard)
  async getAdminResponses(
    @Request() req,
    @Param('productId', ParseIntPipe) productId?: number,
  ) {
    return this.commentsService.getAdminResponses(productId);
  }
}
