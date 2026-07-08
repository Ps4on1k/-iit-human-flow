import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sources')
export class SourcesController {
  constructor(private sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List all sources' })
  findAll() { return this.sourcesService.findAll(); }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create source (Admin only)' })
  create(@Body('name') name: string, @Body('code') code: string) { return this.sourcesService.create(name, code); }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update source (Admin only)' })
  update(@Param('id') id: string, @Body('name') name: string) { return this.sourcesService.update(id, { name }); }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete source (Admin only)' })
  remove(@Param('id') id: string) { return this.sourcesService.remove(id); }
}
