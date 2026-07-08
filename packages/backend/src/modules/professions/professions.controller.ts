import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfessionsService } from './professions.service';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Professions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('professions')
export class ProfessionsController {
  constructor(private professionsService: ProfessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all professions' })
  findAll() {
    return this.professionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profession by ID' })
  findOne(@Param('id') id: string) {
    return this.professionsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create profession (Admin only)' })
  create(@Body() dto: CreateProfessionDto) {
    return this.professionsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update profession (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateProfessionDto) {
    return this.professionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete profession (Admin only)' })
  remove(@Param('id') id: string) {
    return this.professionsService.remove(id);
  }
}
