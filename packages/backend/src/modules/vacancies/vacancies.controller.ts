import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Vacancies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vacancies')
export class VacanciesController {
  constructor(private vacanciesService: VacanciesService) {}

  @Get()
  @ApiOperation({ summary: 'List vacancies' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: any,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.vacanciesService.findAll(userId, role, departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vacancy details' })
  findOne(@Param('id') id: string) {
    return this.vacanciesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vacancy' })
  create(@Body() dto: CreateVacancyDto, @CurrentUser('id') userId: string) {
    return this.vacanciesService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vacancy' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVacancyDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: any,
  ) {
    return this.vacanciesService.update(id, dto, userId, role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update vacancy status' })
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.vacanciesService.updateStatus(id, status);
  }

  @Patch(':id/tags')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Set vacancy tags' })
  setTags(@Param('id') id: string, @Body('tagIds') tagIds: string[]) {
    return this.vacanciesService.setTags(id, tagIds);
  }
}
