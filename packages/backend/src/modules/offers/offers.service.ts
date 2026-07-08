import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async findByCandidate(candidateId: string) {
    return this.prisma.offer.findMany({
      where: { candidateId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        approvals: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateOfferDto, userId: string) {
    return this.prisma.offer.create({
      data: {
        candidateId: dto.candidateId,
        vacancyId: dto.vacancyId,
        salary: dto.salary,
        currency: dto.currency || 'KZT',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        benefits: dto.benefits,
        letterHtml: dto.letterHtml,
        createdBy: userId,
        status: 'DRAFT',
      },
    });
  }

  async sendForApproval(id: string, approverIds: string[]) {
    const offer = await this.prisma.offer.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        approvals: {
          create: approverIds.map((userId) => ({ userId, status: 'pending' })),
        },
      },
    });
    return offer;
  }

  async approve(id: string, userId: string, approved: boolean, comment?: string) {
    const approval = await this.prisma.offerApproval.findFirst({
      where: { offerId: id, userId },
    });
    if (!approval) throw new NotFoundException('Approval not found');

    await this.prisma.offerApproval.update({
      where: { id: approval.id },
      data: { status: approved ? 'approved' : 'rejected', comment, decidedAt: new Date() },
    });

    if (!approved) {
      await this.prisma.offer.update({ where: { id }, data: { status: 'REJECTED' } });
    }

    const allApprovals = await this.prisma.offerApproval.findMany({ where: { offerId: id } });
    if (allApprovals.every((a) => a.status === 'approved')) {
      await this.prisma.offer.update({ where: { id }, data: { status: 'APPROVED' } });
    }

    return { success: true };
  }

  async markSent(id: string) {
    return this.prisma.offer.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  async respond(id: string, accepted: boolean) {
    return this.prisma.offer.update({
      where: { id },
      data: {
        status: accepted ? 'ACCEPTED' : 'REJECTED',
        respondedAt: new Date(),
      },
    });
  }
}
