import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Post()
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create onboarding plan for candidate' })
  create(@Body('candidateId') candidateId: string, @CurrentUser('id') userId: string) {
    return this.onboardingService.create(candidateId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get onboarding status for candidate' })
  findOne(@Query('candidateId') candidateId: string) {
    return this.onboardingService.findOne(candidateId);
  }

  @Patch('task/:taskId')
  @ApiOperation({ summary: 'Mark onboarding task as completed' })
  completeTask(@Param('taskId') taskId: string) {
    return this.onboardingService.completeTask(taskId);
  }

  @Patch('status')
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update onboarding status' })
  updateStatus(@Body('candidateId') candidateId: string, @Body('status') status: string) {
    return this.onboardingService.updateStatus(candidateId, status);
  }
}
