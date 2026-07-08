import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByCandidate(candidateId: string) {
    return this.prisma.comment.findMany({
      where: { candidateId },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(candidateId: string, authorId: string, content: string, isVoice = false, voiceUrl?: string) {
    return this.prisma.comment.create({
      data: { candidateId, authorId, content, isVoice, voiceUrl },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}
