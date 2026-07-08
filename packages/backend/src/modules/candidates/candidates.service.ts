import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(vacancyId: string, status?: string) {
    return this.prisma.candidate.findMany({
      where: {
        vacancyId,
        ...(status ? { status } : {}),
      },
      include: {
        tags: { include: { tag: true } },
        interviews: { orderBy: { createdAt: 'desc' } },
        _count: { select: { comments: true, attachments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        vacancy: true,
        creator: { select: { id: true, firstName: true, lastName: true } },
        tags: { include: { tag: true } },
        interviews: { include: { interviewer: { select: { id: true, firstName: true, lastName: true } } } },
        backgroundChecks: true,
        offers: true,
        comments: { include: { author: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
        attachments: true,
        statusHistory: { include: { changer: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
        activityLogs: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
        notes: { include: { author: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
        votes: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async create(dto: CreateCandidateDto, userId: string) {
    return this.prisma.candidate.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        source: dto.source || 'Ручное добавление',
        currentCompany: dto.currentCompany,
        experienceYears: dto.experienceYears,
        vacancyId: dto.vacancyId,
        createdBy: userId,
        statusHistory: {
          create: { toStatus: 'new', changedBy: userId },
        },
      },
      include: { vacancy: true },
    });
  }

  async updateStatus(id: string, status: string, userId: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Кандидат не найден');

    // Resolve status codes to human-readable names from pipeline stages
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { vacancies: { some: { id: candidate.vacancyId } } },
      include: { stages: true },
    });
    const stageMap: Record<string, string> = {};
    pipeline?.stages?.forEach((s: any) => { stageMap[s.code] = s.name; });
    stageMap['new'] = 'Новый';
    stageMap['screening'] = 'Скрининг';
    stageMap['interview'] = 'Собеседование';
    stageMap['offer'] = 'Оффер';
    stageMap['hired'] = 'Нанят';
    stageMap['rejected'] = 'Отказ';

    const fromName = stageMap[candidate.status] || candidate.status;
    const toName = stageMap[status] || status;

    await this.prisma.activityLog.create({
      data: {
        candidateId: id,
        userId,
        action: 'status_change',
        details: `Статус изменён: «${fromName}» → «${toName}»`,
      },
    });

    const [updated] = await this.prisma.$transaction([
      this.prisma.candidate.update({ where: { id }, data: { status } }),
      this.prisma.statusHistory.create({
        data: {
          candidateId: id,
          fromStatus: candidate.status,
          toStatus: status,
          changedBy: userId,
        },
      }),
    ]);

    return updated;
  }

  async update(id: string, dto: UpdateCandidateDto) {
    return this.prisma.candidate.update({
      where: { id },
      data: dto as any,
    });
  }

  // Notes
  async getNotes(candidateId: string, context?: string) {
    return this.prisma.candidateNote.findMany({
      where: { candidateId, ...(context ? { context } : {}) },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(candidateId: string, authorId: string, content: string, context: string = 'general') {
    const note = await this.prisma.candidateNote.create({
      data: { candidateId, authorId, content, context },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });

    await this.prisma.activityLog.create({
      data: {
        candidateId,
        userId: authorId,
        action: 'note',
        details: `Добавлена заметка: «${content.substring(0, 100)}»`,
        context,
      },
    });

    return note;
  }

  async deleteNote(id: string) {
    return this.prisma.candidateNote.delete({ where: { id } });
  }

  // Attachments
  async getAttachments(candidateId: string, context?: string) {
    return this.prisma.attachment.findMany({
      where: {
        candidateId,
        ...(context ? { context } : {}),
      },
      include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async uploadAttachment(candidateId: string, uploadedBy: string, file: { filename: string; originalname: string; mimetype: string; size: number; path: string }, context?: string) {
    const ctx = context || 'general';
    // Decode original name from latin1 bytes to UTF-8
    const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const data: any = {
      candidateId,
      uploadedBy,
      filename: file.filename,
      originalName: decodedName,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      context: ctx,
    };

    const attachment = await this.prisma.attachment.create({ data });

    const contextLabels: Record<string, string> = {
      general: 'Общее', interview: 'Собеседование', background_check: 'Проверка СБ', offer: 'Оффер',
    };

    await this.prisma.activityLog.create({
      data: {
        candidateId,
        userId: uploadedBy,
        action: 'file_upload',
        details: `Загружен файл «${decodedName}» (${(file.size / 1024).toFixed(1)} KB) в раздел «${contextLabels[ctx]}»`,
        context: ctx,
      },
    });

    return attachment;
  }

  async deleteAttachment(id: string) {
    return this.prisma.attachment.delete({ where: { id } });
  }

  async getAttachmentById(id: string) {
    return this.prisma.attachment.findUnique({ where: { id } });
  }
}
