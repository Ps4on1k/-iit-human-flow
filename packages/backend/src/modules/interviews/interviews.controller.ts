import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List interviews for candidate' })
  findByCandidate(@Query('candidateId') candidateId: string) {
    return this.interviewsService.findByCandidate(candidateId);
  }

  @Post()
  @ApiOperation({ summary: 'Schedule interview' })
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Patch(':id/result')
  @ApiOperation({ summary: 'Submit interview result' })
  updateResult(
    @Param('id') id: string,
    @Body('result') result: string,
    @Body('feedback') feedback?: string,
    @Body('score') score?: number,
  ) {
    return this.interviewsService.updateResult(id, result, feedback, score);
  }
}
