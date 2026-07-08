import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'List comments for candidate' })
  findByCandidate(@Query('candidateId') candidateId: string) {
    return this.commentsService.findByCandidate(candidateId);
  }

  @Post()
  @ApiOperation({ summary: 'Add comment to candidate' })
  create(
    @Body('candidateId') candidateId: string,
    @Body('content') content: string,
    @Body('isVoice') isVoice: boolean,
    @Body('voiceUrl') voiceUrl: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.create(candidateId, userId, content, isVoice, voiceUrl);
  }
}
