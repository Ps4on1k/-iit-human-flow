import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Seeding is disabled in production');
    return;
  }

  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@innovacia.ru' },
    update: {},
    create: {
      email: 'admin@innovacia.ru',
      passwordHash,
      firstName: 'Александр',
      lastName: 'Петров',
      role: 'ADMIN',
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@innovacia.ru' },
    update: {},
    create: {
      email: 'recruiter@innovacia.ru',
      passwordHash,
      firstName: 'Елена',
      lastName: 'Сидорова',
      role: 'RECRUITER',
    },
  });

  const hr = await prisma.user.upsert({
    where: { email: 'hr@innovacia.ru' },
    update: {},
    create: {
      email: 'hr@innovacia.ru',
      passwordHash,
      firstName: 'Ольга',
      lastName: 'Козлова',
      role: 'HR',
    },
  });

  const hiringManager = await prisma.user.upsert({
    where: { email: 'manager@innovacia.ru' },
    update: {},
    create: {
      email: 'manager@innovacia.ru',
      passwordHash,
      firstName: 'Дмитрий',
      lastName: 'Волков',
      role: 'HIRING_MANAGER',
    },
  });

  // Departments
  const departments = [
    { name: 'ИТ отдел', code: 'IT', description: 'Информационные технологии' },
    { name: 'Отдел кадров', code: 'HR', description: 'Управление персоналом' },
    { name: 'Финансовый отдел', code: 'FIN', description: 'Финансы и бухгалтерия' },
    { name: 'Маркетинг', code: 'MKT', description: 'Маркетинг и коммуникации' },
    { name: 'Отдел продаж', code: 'SALES', description: 'Продажи и развитие бизнеса' },
    { name: 'Юридический отдел', code: 'LEGAL', description: 'Юридическая поддержка' },
    { name: 'Операционный отдел', code: 'OPS', description: 'Операционное управление' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  // Professions
  const professions = [
    { name: 'Frontend-разработчик', code: 'FE_DEV', description: 'Разработчик пользовательских интерфейсов' },
    { name: 'Backend-разработчик', code: 'BE_DEV', description: 'Разработчик серверной части' },
    { name: 'DevOps-инженер', code: 'DEVOPS', description: 'Инженер по инфраструктуре' },
    { name: 'UI/UX-дизайнер', code: 'UI_UX', description: 'Дизайнер интерфейсов' },
    { name: 'Руководитель проектов', code: 'PM', description: 'Менеджер проектов' },
    { name: 'HR-менеджер', code: 'HR_MGR', description: 'Менеджер по персоналу' },
    { name: 'Бизнес-аналитик', code: 'BA', description: 'Бизнес-аналитик' },
    { name: 'QA-инженер', code: 'QA', description: 'Инженер по тестированию' },
    { name: 'Аналитик данных', code: 'DATA', description: 'Аналитик данных' },
    { name: 'Системный администратор', code: 'SYS_ADMIN', description: 'Системный администратор' },
    { name: 'Специалист по маркетингу', code: 'MKT_SPEC', description: 'Специалист по маркетингу' },
    { name: 'Менеджер по продажам', code: 'SALES_MGR', description: 'Менеджер по продажам' },
    { name: 'Юрист', code: 'LAWYER', description: 'Юрист' },
    { name: 'Бухгалтер', code: 'ACCT', description: 'Бухгалтер' },
    { name: 'Операционный менеджер', code: 'OPS_MGR', description: 'Операционный менеджер' },
  ];

  for (const prof of professions) {
    await prisma.profession.upsert({
      where: { code: prof.code },
      update: {},
      create: prof,
    });
  }

  // Sources
  const sources = [
    { name: 'LinkedIn', code: 'linkedin' },
    { name: 'HeadHunter', code: 'hh' },
    { name: 'Рекомендация сотрудника', code: 'referral' },
    { name: 'Собственный сайт', code: 'website' },
    { name: 'Telegram', code: 'telegram' },
    { name: 'Резюме на HH', code: 'hh_resume' },
    { name: 'Кадровое агентство', code: 'agency' },
    { name: 'Ручное добавление', code: 'manual' },
  ];

  for (const src of sources) {
    await prisma.source.upsert({
      where: { code: src.code },
      update: {},
      create: src,
    });
  }

  // Default Pipeline with stages
  const defaultPipeline = await prisma.pipeline.upsert({
    where: { id: 'default-pipeline' },
    update: {},
    create: {
      id: 'default-pipeline',
      name: 'Стандартный набор',
      isDefault: true,
    },
  });

  const defaultStages = [
    { name: 'Новый', code: 'new', sortOrder: 0, color: '#8A94A6' },
    { name: 'Скрининг', code: 'screening', sortOrder: 1, color: '#3A8DFF' },
    { name: 'Собеседование', code: 'interview', sortOrder: 2, color: '#42D9C8' },
    { name: 'Техническое интервью', code: 'tech_interview', sortOrder: 3, color: '#1A5FCC' },
    { name: 'Оффер', code: 'offer', sortOrder: 4, color: '#FFB020' },
    { name: 'Нанят', code: 'hired', sortOrder: 5, color: '#21B573' },
    { name: 'Отказ', code: 'rejected', sortOrder: 6, color: '#E5484D' },
  ];

  for (const stage of defaultStages) {
    await prisma.pipelineStage.upsert({
      where: { pipelineId_code: { pipelineId: defaultPipeline.id, code: stage.code } },
      update: {},
      create: { ...stage, pipelineId: defaultPipeline.id },
    });
  }

  // IT pipeline
  const itPipeline = await prisma.pipeline.create({
    data: { name: 'Технический набор' },
  });

  const itStages = [
    { name: 'Новый', code: 'new', sortOrder: 0, color: '#8A94A6' },
    { name: 'Резюме просмотрено', code: 'reviewed', sortOrder: 1, color: '#3A8DFF' },
    { name: 'Тестовое задание', code: 'test_task', sortOrder: 2, color: '#FFB020' },
    { name: 'Скрининг', code: 'screening', sortOrder: 3, color: '#42D9C8' },
    { name: 'Техническое интервью', code: 'tech_interview', sortOrder: 4, color: '#1A5FCC' },
    { name: 'Интервью с руководителем', code: 'manager_interview', sortOrder: 5, color: '#42D9C8' },
    { name: 'Оффер', code: 'offer', sortOrder: 6, color: '#FFB020' },
    { name: 'Нанят', code: 'hired', sortOrder: 7, color: '#21B573' },
    { name: 'Отказ', code: 'rejected', sortOrder: 8, color: '#E5484D' },
  ];

  for (const stage of itStages) {
    await prisma.pipelineStage.create({
      data: { ...stage, pipelineId: itPipeline.id },
    });
  }

  // Sample vacancy
  const itDept = await prisma.department.findUnique({ where: { code: 'IT' } });

  await prisma.vacancy.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Senior Frontend-разработчик',
      description: 'Ищем опытного фронтенд-разработчика для работы над enterprise-приложением.',
      requirements: 'React, TypeScript, Ant Design, 3+ лет опыта',
      salaryMin: 200000,
      salaryMax: 350000,
      currency: 'RUB',
      location: 'Москва',
      grade: 'Senior',
      status: 'OPEN',
      urgency: 'NORMAL',
      headcount: 1,
      departmentId: itDept!.id,
      pipelineId: itPipeline.id,
      createdBy: hiringManager.id,
      assignments: {
        create: [
          { userId: hiringManager.id, isPrimary: true },
          { userId: recruiter.id, isPrimary: false },
        ],
      },
    },
  });

  console.log('✅ Seeded:');
  console.log(`   Admin: admin@innovacia.ru / admin123`);
  console.log(`   Recruiter: recruiter@innovacia.ru / admin123`);
  console.log(`   HR: hr@innovacia.ru / admin123`);
  console.log(`   Manager: manager@innovacia.ru / admin123`);
  console.log(`   Departments: ${departments.length}`);
  console.log(`   Professions: ${professions.length}`);
  console.log(`   Pipelines: 2 (Стандартный + Технический)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
