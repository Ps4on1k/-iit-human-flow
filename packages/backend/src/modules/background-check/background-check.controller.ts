import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BackgroundCheckService } from './background-check.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Background Checks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('background-checks')
export class BackgroundCheckController {
  constructor(private bgService: BackgroundCheckService) {}

  @Get()
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get background check for candidate' })
  findByCandidate(@Query('candidateId') candidateId: string) {
    return this.bgService.findByCandidate(candidateId);
  }

  @Post()
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Initiate background check' })
  initiate(@Body('candidateId') candidateId: string, @CurrentUser('id') userId: string) {
    return this.bgService.initiate(candidateId, userId);
  }

  @Patch(':id/checklist')
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update background check checklist' })
  updateChecklist(@Param('id') id: string, @Body() dto: any) {
    return this.bgService.updateChecklist(id, dto);
  }

  @Patch(':id/complete')
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Complete background check' })
  complete(@Param('id') id: string, @Body('status') status: string) {
    return this.bgService.complete(id, status);
  }
}
