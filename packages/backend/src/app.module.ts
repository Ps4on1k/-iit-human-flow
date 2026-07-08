import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ProfessionsModule } from './modules/professions/professions.module';
import { VacanciesModule } from './modules/vacancies/vacancies.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { BackgroundCheckModule } from './modules/background-check/background-check.module';
import { OffersModule } from './modules/offers/offers.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ProbationModule } from './modules/probation/probation.module';
import { CommentsModule } from './modules/comments/comments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { SourcesModule } from './modules/sources/sources.module';
import { TagsModule } from './modules/tags/tags.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    ProfessionsModule,
    VacanciesModule,
    CandidatesModule,
    InterviewsModule,
    BackgroundCheckModule,
    OffersModule,
    OnboardingModule,
    ProbationModule,
    CommentsModule,
    NotificationsModule,
    DashboardModule,
    PipelinesModule,
    SourcesModule,
    TagsModule,
    ActivityLogModule,
  ],
})
export class AppModule {}
