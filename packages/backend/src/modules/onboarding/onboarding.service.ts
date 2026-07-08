import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async create(candidateId: string, assigneeId?: string) {
    const existing = await this.prisma.onboarding.findUnique({ where: { candidateId } });
    if (existing) throw new NotFoundException('Onboarding already exists for this candidate');

    return this.prisma.onboarding.create({
      data: {
        candidateId,
        assigneeId,
        status: 'NOT_STARTED',
        tasks: {
          create: [
            { title: 'Подготовить рабочее место', category: 'first_day' },
            { title: 'Выдать оборудование', category: 'first_day' },
            { title: 'Создать доступы (email, VPN, Slack)', category: 'first_day' },
            { title: 'Назначить куратора', category: 'first_day' },
            { title: 'Знакомство с командой', category: 'first_week' },
            { title: 'Обзор процессов и инструментов', category: 'first_week' },
            { title: 'Первая задача для онбординга', category: 'first_week' },
            { title: 'Промежуточная встреча с руководителем', category: 'first_month' },
            { title: 'Оценка адаптации', category: 'first_month' },
          ],
        },
      },
      include: { tasks: true },
    });
  }

  async findOne(candidateId: string) {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { candidateId },
      include: {
        tasks: { orderBy: { createdAt: 'asc' } },
        equipment: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!onboarding) throw new NotFoundException('Onboarding not found');
    return onboarding;
  }

  async completeTask(taskId: string) {
    return this.prisma.onboardingTask.update({
      where: { id: taskId },
      data: { isCompleted: true, completedAt: new Date() },
    });
  }

  async updateStatus(candidateId: string, status: string) {
    return this.prisma.onboarding.update({
      where: { candidateId },
      data: { status: status as any },
    });
  }
}
