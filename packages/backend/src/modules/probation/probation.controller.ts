import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProbationService } from './probation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Probation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('probation')
export class ProbationController {
  constructor(private probationService: ProbationService) {}

  @Post()
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Start probation period' })
  create(@Body('candidateId') candidateId: string, @Body('userId') userId: string) {
    return this.probationService.create(candidateId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get probation status for candidate' })
  findOne(@Query('candidateId') candidateId: string) {
    return this.probationService.findOne(candidateId);
  }

  @Post('review')
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add probation review' })
  addReview(
    @Body('probationId') probationId: string,
    @Body('month') month: number,
    @Body('checklist') checklist: any,
    @Body('comment') comment: string,
    @Body('score') score: number,
    @CurrentUser('id') reviewerId: string,
  ) {
    return this.probationService.addReview(probationId, month, checklist, comment, score, reviewerId);
  }

  @Patch('verdict')
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Final probation verdict' })
  completeVerdict(
    @Body('candidateId') candidateId: string,
    @Body('verdict') verdict: string,
    @CurrentUser('id') reviewerId: string,
  ) {
    return this.probationService.completeVerdict(candidateId, verdict, reviewerId);
  }
}
