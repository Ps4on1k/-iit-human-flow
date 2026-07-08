import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Get hiring funnel (aggregated)' })
  getFunnel() {
    return this.dashboardService.getFunnel();
  }

  @Get('pipeline-funnels')
  @ApiOperation({ summary: 'Get per-pipeline funnel charts' })
  getPipelineFunnels() {
    return this.dashboardService.getPipelineFunnels();
  }

  @Get('time-to-hire')
  @ApiOperation({ summary: 'Get average time to hire' })
  getTimeToHire() {
    return this.dashboardService.getTimeToHire();
  }
}
