/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunityService } from './community.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs/promises';
import cloudinary from '../cloudinary.config';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `community-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
          return cb(
            new Error('Only JPG, JPEG, PNG, WEBP, and GIF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async createCommunityPost(
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const body = req.body as Record<string, string>;
    let imageUrl = body.imageUrl?.trim();

    if (file) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'boutique-community',
          public_id: `community-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        });
        imageUrl = result.secure_url;
      } catch (error) {
        console.error('Community image upload failed:', error);
      } finally {
        try {
          await fs.unlink(file.path);
        } catch {
          // ignore cleanup errors
        }
      }
    }

    const content = body.content?.trim();
    if (!content) {
      throw new BadRequestException('Content is required');
    }

    const productId = body.productId ? Number(body.productId) : undefined;

    return this.communityService.createCommunityPost(req.user.id, {
      content,
      caption: body.caption?.trim() || content,
      imageUrl,
      productId,
      postType: (body.postType as any) || 'GENERAL',
    });
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
  async updateCommunityPost(
    @Req() req: any,
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: any,
  ) {
    return this.communityService.updateCommunityPost(req.user.id, postId, dto);
  }

  @Delete('posts/:id')
  async deleteCommunityPost(
    @Req() req: any,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.communityService.deleteCommunityPost(req.user.id, postId);
  }

  @Get('posts/:id/comments')
  async getCommunityPostComments(@Param('id', ParseIntPipe) postId: number) {
    return this.communityService.getCommunityPostComments(postId);
  }

  @Post('posts/:id/comments')
  async createCommunityComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: any,
  ) {
    return this.communityService.createCommunityComment(req.user.id, postId, {
      content: dto.content,
      parentId: dto.parentId ? Number(dto.parentId) : undefined,
    });
  }

  @Delete('comments/:id')
  async deleteCommunityComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) commentId: number,
  ) {
    return this.communityService.deleteCommunityComment(req.user.id, commentId);
  }

  @Post('posts/:id/like')
  async likeCommunityPost(
    @Req() req: any,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.communityService.likeCommunityPost(req.user.id, postId);
  }

  @Delete('posts/:id/like')
  async unlikeCommunityPost(
    @Req() req: any,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.communityService.unlikeCommunityPost(req.user.id, postId);
  }

  @Post('posts/:id/reactions')
  async toggleCommunityReaction(
    @Req() req: any,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.communityService.toggleCommunityReaction(req.user.id, postId);
  }

  @Post('posts/:id/reposts')
  async repostCommunityPost(
    @Req() req: any,
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: { content?: string },
  ) {
    return this.communityService.repostCommunityPost(
      req.user.id,
      postId,
      body.content,
    );
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
  async getProductCommunityPosts(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.communityService.getCommunityPosts({ productId });
  }

  @Post('discussions')
  async createCommunityDiscussion(@Req() req: any, @Body() body: any) {
    return this.communityService.createCommunityDiscussion(req.user.id, {
      productId: Number(body.productId),
      message: body.message,
    });
  }

  @Get('discussions/:productId')
  async getCommunityDiscussions(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.communityService.getCommunityDiscussions(productId);
  }

  @Get('chat/messages')
  async getCommunityChatMessages(@Query('limit') limit?: string) {
    return this.communityService.getCommunityChatMessages(
      limit ? Number(limit) : 100,
    );
  }

  @Post('chat/messages')
  async createCommunityChatMessage(@Req() req: any, @Body() body: any) {
    return this.communityService.createCommunityChatMessage(req.user.id, {
      message: body.message,
    });
  }
}
