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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunityService } from './community.service';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createCommunityPost(@Request() req: any, @Body() dto: any) {
    return this.communityService.createCommunityPost(req.user.id, dto);
  }

  @Get('posts')
  async getCommunityPosts(@Query() filters: any) {
    return this.communityService.getCommunityPosts(filters);
  }

  @Get('posts/:id')
  async getCommunityPost(@Param('id', ParseIntPipe) postId: number) {
    return this.communityService.getCommunityPost(postId);
  }

  @Put('posts/:id')
  @UseGuards(JwtAuthGuard)
  async updateCommunityPost(
    @Request() req: any,
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: any,
  ) {
    return this.communityService.updateCommunityPost(req.user.id, postId, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCommunityPost(@Request() req: any, @Param('id', ParseIntPipe) postId: number) {
    return this.communityService.deleteCommunityPost(req.user.id, postId);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommunityComment(
    @Request() req: any,
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: any,
  ) {
    return this.communityService.createCommunityComment(req.user.id, postId, dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCommunityComment(@Request() req: any, @Param('id', ParseIntPipe) commentId: number) {
    return this.communityService.deleteCommunityComment(req.user.id, commentId);
  }

  @Post('posts/:id/reactions')
  @UseGuards(JwtAuthGuard)
  async toggleCommunityReaction(@Request() req: any, @Param('id', ParseIntPipe) postId: number) {
    return this.communityService.toggleCommunityReaction(req.user.id, postId);
  }

  @Post('posts/:id/reposts')
  @UseGuards(JwtAuthGuard)
  async repostCommunityPost(
    @Request() req: any,
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: { content?: string },
  ) {
    return this.communityService.repostCommunityPost(req.user.id, postId, body.content);
  }

  @Get('posts/type/:postType')
  async getPostsByType(@Param('postType') postType: string) {
    return this.communityService.getCommunityPosts({ postType });
  }

  @Get('posts/user/:userId')
  async getPostsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.communityService.getCommunityPosts({ userId });
  }

  @Get('posts/product/:productId')
  async getProductCommunityPosts(@Param('productId', ParseIntPipe) productId: number) {
    return this.communityService.getCommunityPosts({ productId });
  }
}