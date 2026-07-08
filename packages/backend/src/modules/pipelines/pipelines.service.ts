import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PipelinesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pipeline.findMany({
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { vacancies: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
        vacancies: { select: { id: true, title: true, status: true } },
      },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async create(name: string) {
    return this.prisma.pipeline.create({
      data: { name },
      include: { stages: true },
    });
  }

  async update(id: string, data: { name?: string; isDefault?: boolean }) {
    const pipeline = await this.prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    if (data.isDefault) {
      await this.prisma.pipeline.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    return this.prisma.pipeline.update({ where: { id }, data });
  }

  async remove(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({ where: { id }, include: { _count: { select: { vacancies: true } } } });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    if (pipeline.isDefault) throw new ConflictException('Cannot delete default pipeline');
    if (pipeline._count.vacancies > 0) throw new ConflictException('Cannot delete pipeline with existing vacancies');
    return this.prisma.pipeline.delete({ where: { id } });
  }

  async addStage(pipelineId: string, name: string, code: string, color?: string) {
    const pipeline = await this.prisma.pipeline.findUnique({ where: { id: pipelineId }, include: { stages: true } });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    const maxOrder = pipeline.stages.length > 0 ? Math.max(...pipeline.stages.map(s => s.sortOrder)) + 1 : 0;
    const existing = pipeline.stages.find(s => s.code === code);
    if (existing) throw new ConflictException('Stage with this code already exists');
    return this.prisma.pipelineStage.create({
      data: { pipelineId, name, code, sortOrder: maxOrder, color },
    });
  }

  async updateStage(id: string, data: { name?: string; color?: string; order?: number }) {
    const stage = await this.prisma.pipelineStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Stage not found');
    return this.prisma.pipelineStage.update({ where: { id }, data });
  }

  async reorderStages(pipelineId: string, stageIds: string[]) {
    const pipeline = await this.prisma.pipeline.findUnique({ where: { id: pipelineId } });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    const updates = stageIds.map((stageId, index) =>
      this.prisma.pipelineStage.update({ where: { id: stageId }, data: { sortOrder: index } }),
    );
    await this.prisma.$transaction(updates);
    return this.prisma.pipelineStage.findMany({
      where: { pipelineId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async removeStage(id: string) {
    const stage = await this.prisma.pipelineStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Stage not found');
    return this.prisma.pipelineStage.delete({ where: { id } });
  }
}
