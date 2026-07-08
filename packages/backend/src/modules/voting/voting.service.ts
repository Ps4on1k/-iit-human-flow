import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VotingService {
  constructor(private prisma: PrismaService) {}

  async vote(candidateId: string, userId: string, vote: string, comment?: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Кандидат не найден');

    const existing = await this.prisma.interviewVote.findUnique({
      where: { candidateId_userId: { candidateId, userId } },
    });

    const voteText = this.voteLabel(vote);
    const details = existing ? `Голос изменён на «${voteText}»` : `Проголосовал «${voteText}»`;

    if (existing) {
      await this.prisma.interviewVote.update({ where: { id: existing.id }, data: { vote, comment } });
    } else {
      await this.prisma.interviewVote.create({ data: { candidateId, userId, vote, comment } });
    }

    await this.prisma.activityLog.create({
      data: { candidateId, userId, action: 'vote', details, context: 'interview' },
    });

    // Notify other voters
    const otherVoters = await this.prisma.interviewVote.findMany({
      where: { candidateId, userId: { not: userId } },
      select: { userId: true },
    });
    const uniqueUserIds = [...new Set(otherVoters.map((v) => v.userId))];
    const voter = await this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });

    for (const uid of uniqueUserIds) {
      await this.prisma.notification.create({
        data: {
          userId: uid,
          type: 'STATUS_CHANGE',
          title: 'Обновлён голос',
          message: `${voter?.firstName} ${voter?.lastName} ${details.toLowerCase()} по кандидату ${candidate.firstName} ${candidate.lastName}`,
          link: `/candidates/${candidateId}`,
        },
      });
    }

    return this.getVoteSummary(candidateId);
  }

  async getVotes(candidateId: string) {
    return this.prisma.interviewVote.findMany({
      where: { candidateId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVoteSummary(candidateId: string) {
    const votes = await this.prisma.interviewVote.findMany({
      where: { candidateId },
      select: { vote: true, user: { select: { id: true, firstName: true, lastName: true } } },
    });

    return {
      for: votes.filter((v) => v.vote === 'for').length,
      against: votes.filter((v) => v.vote === 'against').length,
      neutral: votes.filter((v) => v.vote === 'neutral').length,
      total: votes.length,
      votes: votes.map((v) => ({ vote: v.vote, user: v.user })),
    };
  }

  private voteLabel(vote: string): string {
    const labels: Record<string, string> = { for: 'За', against: 'Против', neutral: 'Нейтрально' };
    return labels[vote] || vote;
  }
}
