import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Query } from '@nestjs/common';

@ApiTags('Activity Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity-log')
export class ActivityLogController {
  constructor(private activityLogService: ActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity log for candidate' })
  findByCandidate(@Query('candidateId') candidateId: string) {
    return this.activityLogService.findByCandidate(candidateId);
  }
}
