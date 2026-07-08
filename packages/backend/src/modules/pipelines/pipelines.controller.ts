import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PipelinesService } from './pipelines.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Pipelines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pipelines')
export class PipelinesController {
  constructor(private pipelinesService: PipelinesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pipelines' })
  findAll() {
    return this.pipelinesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline by ID' })
  findOne(@Param('id') id: string) {
    return this.pipelinesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create pipeline (Admin only)' })
  create(@Body('name') name: string) {
    return this.pipelinesService.create(name);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update pipeline (Admin only)' })
  update(@Param('id') id: string, @Body() data: { name?: string; isDefault?: boolean }) {
    return this.pipelinesService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete pipeline (Admin only)' })
  remove(@Param('id') id: string) {
    return this.pipelinesService.remove(id);
  }

  @Post(':id/stages')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add stage to pipeline (Admin only)' })
  addStage(@Param('id') id: string, @Body() body: { name: string; code: string; color?: string }) {
    return this.pipelinesService.addStage(id, body.name, body.code, body.color);
  }

  @Put(':id/stages/reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reorder stages (Admin only)' })
  reorderStages(@Param('id') id: string, @Body('stageIds') stageIds: string[]) {
    return this.pipelinesService.reorderStages(id, stageIds);
  }

  @Patch('stages/:stageId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update stage (Admin only)' })
  updateStage(@Param('stageId') stageId: string, @Body() data: { name?: string; color?: string; sortOrder?: number }) {
    return this.pipelinesService.updateStage(stageId, data);
  }

  @Delete('stages/:stageId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete stage (Admin only)' })
  removeStage(@Param('stageId') stageId: string) {
    return this.pipelinesService.removeStage(stageId);
  }
}
