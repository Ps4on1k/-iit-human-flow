import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBackgroundCheckDto } from './dto/create-background-check.dto';

@Injectable()
export class BackgroundCheckService {
  constructor(private prisma: PrismaService) {}

  async findByCandidate(candidateId: string) {
    return this.prisma.backgroundCheck.findFirst({
      where: { candidateId },
      include: {
        initiator: { select: { id: true, firstName: true, lastName: true } },
        attachments: true,
      },
    });
  }

  async initiate(candidateId: string, initiatedBy: string) {
    return this.prisma.backgroundCheck.create({
      data: {
        candidateId,
        initiatedBy,
        status: 'PENDING',
        startedAt: new Date(),
      },
    });
  }

  async updateChecklist(id: string, dto: Partial<CreateBackgroundCheckDto>) {
    return this.prisma.backgroundCheck.update({
      where: { id },
      data: dto,
    });
  }

  async complete(id: string, status: string) {
    return this.prisma.backgroundCheck.update({
      where: { id },
      data: { status: status as any, completedAt: new Date() },
    });
  }
}
