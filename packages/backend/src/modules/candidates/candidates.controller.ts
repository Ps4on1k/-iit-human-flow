import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = Buffer.from(path.basename(file.originalname, ext), 'latin1').toString('utf8');
    cb(null, `${randomUUID()}-${baseName}${ext}`);
  },
});

@ApiTags('Candidates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: 'List candidates for vacancy' })
  findAll(@Query('vacancyId') vacancyId: string, @Query('status') status?: string) {
    return this.candidatesService.findAll(vacancyId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate details' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add candidate' })
  create(@Body() dto: CreateCandidateDto, @CurrentUser('id') userId: string) {
    return this.candidatesService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update candidate' })
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidatesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change candidate status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.candidatesService.updateStatus(id, status, userId);
  }

  // Notes
  @Get(':id/notes')
  @ApiOperation({ summary: 'Get candidate notes' })
  getNotes(@Param('id') id: string, @Query('context') context?: string) {
    return this.candidatesService.getNotes(id, context);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to candidate' })
  createNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('context') context: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.candidatesService.createNote(id, userId, content, context);
  }

  @Delete(':id/notes/:noteId')
  @ApiOperation({ summary: 'Delete note' })
  deleteNote(@Param('noteId') noteId: string) {
    return this.candidatesService.deleteNote(noteId);
  }

  // Attachments
  @Get(':id/attachments')
  @ApiOperation({ summary: 'Get candidate attachments' })
  getAttachments(@Param('id') id: string, @Query('context') context?: string) {
    return this.candidatesService.getAttachments(id, context);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload attachment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body('context') context: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.candidatesService.uploadAttachment(id, userId, file, context);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete attachment' })
  deleteAttachment(@Param('attachmentId') attachmentId: string) {
    return this.candidatesService.deleteAttachment(attachmentId);
  }
}
