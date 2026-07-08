import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List tags (filtered by visibility for non-admin)' })
  findAll(@CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole) {
    return this.tagsService.findAll(userId, role === UserRole.ADMIN);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create tag (Admin only)' })
  create(@Body('name') name: string, @Body('color') color: string) {
    return this.tagsService.create(name, color);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tag (Admin only)' })
  update(@Param('id') id: string, @Body() data: { name?: string; color?: string }) {
    return this.tagsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete tag (Admin only)' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }

  @Get(':id/visibility')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get tag visibility (Admin only)' })
  getVisibility(@Param('id') id: string) {
    return this.tagsService.getVisibility(id);
  }

  @Patch(':id/visibility')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set tag visibility (Admin only)' })
  setVisibility(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.tagsService.setVisibility(id, userIds);
  }

  @Get('by-user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get tags assigned to user (Admin only)' })
  getUserTags(@Param('userId') userId: string) {
    return this.tagsService.getUserTags(userId);
  }

  @Patch('by-user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set tags for user (Admin only)' })
  setUserTags(@Param('userId') userId: string, @Body('tagIds') tagIds: string[]) {
    return this.tagsService.setUserTags(userId, tagIds);
  }
}
