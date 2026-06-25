import {
  EmployeePresence,
  PrismaClient,
  RequestPriority,
  RequestSource,
  RequestStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const addDays = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return d;
};

// Stable building ids so re-seeding is idempotent.
const BUILDING_IDS: Record<string, string> = {
  ap1: '11111111-0000-0000-0000-000000000001',
  ap2: '11111111-0000-0000-0000-000000000002',
  ap3: '11111111-0000-0000-0000-000000000003',
  sp1: '11111111-0000-0000-0000-000000000004',
  sp2: '11111111-0000-0000-0000-000000000005',
  rb1: '11111111-0000-0000-0000-000000000006',
};

const BUILDINGS = [
  { key: 'ap1', name: 'ЖК «Алые Паруса», корп. 1', address: 'ул. Парусная, 12к1' },
  { key: 'ap2', name: 'ЖК «Алые Паруса», корп. 2', address: 'ул. Парусная, 12к2' },
  { key: 'ap3', name: 'ЖК «Алые Паруса», корп. 3', address: 'ул. Парусная, 12к3' },
  { key: 'sp1', name: 'ЖК «Северный Парк», корп. 1', address: 'пр. Северный, 5' },
  { key: 'sp2', name: 'ЖК «Северный Парк», корп. 2', address: 'пр. Северный, 7' },
  { key: 'rb1', name: 'ЖК «Речной Бриз», корп. 1', address: 'наб. Речная, 3' },
];

interface SeedTicket {
  number: number;
  title: string;
  description: string;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  source: RequestSource;
  bKey: string;
  apt: string;
  resident: string;
  phone: string;
  assignee: string | null;
}

const TICKETS: SeedTicket[] = [
  { number: 10241, title: 'Не работает лифт в подъезде 2', description: 'Лифт остановился между 5 и 6 этажом, двери не открываются.', category: 'Лифт', priority: RequestPriority.HIGH, status: RequestStatus.IN_PROGRESS, source: RequestSource.TELEGRAM, bKey: 'ap1', apt: 'кв. 44', resident: 'Петрова Е.С.', phone: '+7 905 233-87-04', assignee: 'Соколов И.П.' },
  { number: 10242, title: 'Течь в подвале корпуса 3', description: 'Обнаружена течь в подвальном помещении возле трубы ГВС.', category: 'Сантехника', priority: RequestPriority.HIGH, status: RequestStatus.ASSIGNED, source: RequestSource.PHONE, bKey: 'ap3', apt: 'кв. 8', resident: 'Соколова О.Д.', phone: '+7 903 778-65-12', assignee: 'Белкин Р.С.' },
  { number: 10243, title: 'Нет горячей воды — 4 этаж', description: 'Со вчерашнего вечера отсутствует горячая вода на 4 этаже.', category: 'Водоснабжение', priority: RequestPriority.MEDIUM, status: RequestStatus.NEW, source: RequestSource.TELEGRAM, bKey: 'ap1', apt: 'кв. 33', resident: 'Кузнецова Т.В.', phone: '+7 916 540-11-29', assignee: null },
  { number: 10244, title: 'Шум ночью из кв. 33', description: 'Регулярный шум после 23:00 — громкая музыка и ремонтные работы.', category: 'Шум', priority: RequestPriority.LOW, status: RequestStatus.ASSIGNED, source: RequestSource.MAX, bKey: 'ap1', apt: 'кв. 31', resident: 'Лебедев А.Н.', phone: '+7 900 145-77-02', assignee: 'Морозова Д.А.' },
  { number: 10245, title: 'Сломан домофон — подъезд 1', description: 'Домофон не считывает ключи, дверь приходится открывать вручную.', category: 'Доступ', priority: RequestPriority.MEDIUM, status: RequestStatus.IN_PROGRESS, source: RequestSource.TELEGRAM, bKey: 'ap1', apt: 'кв. 5', resident: 'Андреев П.Т.', phone: '+7 926 771-03-44', assignee: 'Ковалёв А.И.' },
  { number: 10246, title: 'Мусор не вывезли 2 дня', description: 'Контейнерная площадка переполнена, мусор не вывозился два дня.', category: 'Благоустройство', priority: RequestPriority.MEDIUM, status: RequestStatus.NEW, source: RequestSource.TELEGRAM, bKey: 'sp2', apt: 'кв. 14', resident: 'Фёдоров И.П.', phone: '+7 904 117-43-25', assignee: null },
  { number: 10247, title: 'Шлагбаум не открывается по брелоку', description: 'Шлагбаум на въезде перестал реагировать на брелоки.', category: 'Доступ', priority: RequestPriority.MEDIUM, status: RequestStatus.IN_PROGRESS, source: RequestSource.MAX, bKey: 'rb1', apt: 'кв. 30', resident: 'Тарасова А.К.', phone: '+7 903 412-09-55', assignee: 'Зайцев О.Н.' },
  { number: 10248, title: 'Холодно в подъезде — нет отопления', description: 'В подъезде холодно, батареи не греют.', category: 'Отопление', priority: RequestPriority.HIGH, status: RequestStatus.ASSIGNED, source: RequestSource.TELEGRAM, bKey: 'ap3', apt: 'кв. 101', resident: 'Козлова А.М.', phone: '+7 919 222-54-76', assignee: 'Громов П.О.' },
  { number: 10250, title: 'Неверные начисления за март', description: 'В квитанции за март указана сумма больше обычной.', category: 'Начисления', priority: RequestPriority.LOW, status: RequestStatus.NEW, source: RequestSource.WIDGET, bKey: 'ap1', apt: 'кв. 61', resident: 'Киселёва Ю.С.', phone: '+7 925 661-09-88', assignee: null },
  { number: 10251, title: 'Вопрос по оплате за капремонт', description: 'Не приходит квитанция на капитальный ремонт.', category: 'Начисления', priority: RequestPriority.LOW, status: RequestStatus.WAITING, source: RequestSource.PHONE, bKey: 'ap1', apt: 'кв. 48', resident: 'Попов В.С.', phone: '+7 926 884-30-91', assignee: 'Морозова Д.А.' },
  { number: 10253, title: 'Затопление — прорыв трубы кв. 55', description: 'Прорвало трубу в ванной, вода льётся к соседям снизу.', category: 'Авария', priority: RequestPriority.CRITICAL, status: RequestStatus.IN_PROGRESS, source: RequestSource.TELEGRAM, bKey: 'sp2', apt: 'кв. 55', resident: 'Николаев Р.В.', phone: '+7 926 890-12-34', assignee: 'Громов П.О.' },
  { number: 10255, title: 'Просьба установить доп. камеру', description: 'Просьба рассмотреть установку доп. камеры у детской площадки.', category: 'Безопасность', priority: RequestPriority.LOW, status: RequestStatus.NEW, source: RequestSource.WIDGET, bKey: 'ap1', apt: 'кв. 7', resident: 'Васильева Н.О.', phone: '+7 927 330-88-21', assignee: null },
  { number: 10256, title: 'Спасибо, дверь больше не скрипит!', description: 'Спасибо мастеру, входная дверь починена.', category: 'Обратная связь', priority: RequestPriority.LOW, status: RequestStatus.DONE, source: RequestSource.TELEGRAM, bKey: 'ap2', apt: 'кв. 22', resident: 'Новикова М.А.', phone: '+7 915 770-22-18', assignee: 'Кузьмин Д.В.' },
  { number: 10258, title: 'Не работает розетка в холле', description: 'Розетка возле почтовых ящиков не работает.', category: 'Электрика', priority: RequestPriority.LOW, status: RequestStatus.NEW, source: RequestSource.WIDGET, bKey: 'ap1', apt: 'у почтовых ящиков', resident: 'Сидоров Д.В.', phone: '+7 926 050-71-19', assignee: null },
  { number: 10240, title: 'Замена лампы в подъезде', description: 'Перегорела лампа на лестничной площадке 7 этажа.', category: 'Электрика', priority: RequestPriority.LOW, status: RequestStatus.DONE, source: RequestSource.TELEGRAM, bKey: 'sp1', apt: 'кв. 89', resident: 'Орлова Е.Б.', phone: '+7 926 305-66-90', assignee: 'Зайцев О.Н.' },
];

const COMPANY_ID = '22222222-0000-0000-0000-000000000001';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Demo управляющая компания (tenant).
  const company = await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: { name: 'УК «Демо-Сервис»', isActive: true },
    create: { id: COMPANY_ID, name: 'УК «Демо-Сервис»', inn: '7701234567', address: 'г. Москва, ул. Парусная, 12' },
  });

  // Platform administrator — no company, only the admin panel.
  await prisma.user.upsert({
    where: { email: 'superadmin@homedispatcher.local' },
    update: { role: UserRole.SUPERADMIN, companyId: null },
    create: {
      email: 'superadmin@homedispatcher.local',
      passwordHash,
      firstName: 'Платформенный',
      lastName: 'Администратор',
      role: UserRole.SUPERADMIN,
    },
  });

  // Company admin (УК login) — manages the demo company in the main app.
  const admin = await prisma.user.upsert({
    where: { email: 'admin@homedispatcher.local' },
    update: { role: UserRole.ADMIN, companyId: company.id },
    create: {
      email: 'admin@homedispatcher.local',
      passwordHash,
      firstName: 'Дарья',
      lastName: 'Морозова',
      role: UserRole.ADMIN,
      companyId: company.id,
    },
  });

  // A staff account inside the company.
  await prisma.user.upsert({
    where: { email: 'dispatcher@homedispatcher.local' },
    update: { role: UserRole.DISPATCHER, companyId: company.id },
    create: {
      email: 'dispatcher@homedispatcher.local',
      passwordHash,
      firstName: 'Олег',
      lastName: 'Зайцев',
      role: UserRole.DISPATCHER,
      companyId: company.id,
    },
  });

  for (const b of BUILDINGS) {
    await prisma.building.upsert({
      where: { id: BUILDING_IDS[b.key] },
      update: { name: b.name, address: b.address },
      create: { id: BUILDING_IDS[b.key], name: b.name, address: b.address, city: 'Москва' },
    });
  }

  await prisma.serviceRequest.createMany({
    skipDuplicates: true,
    data: TICKETS.map((t) => ({
      number: t.number,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      source: t.source,
      residentName: t.resident,
      residentPhone: t.phone,
      apartmentLabel: t.apt,
      assigneeName: t.assignee,
      buildingId: BUILDING_IDS[t.bKey],
      createdById: admin.id,
      companyId: COMPANY_ID,
    })),
  });

  if ((await prisma.employee.count()) === 0) {
    await prisma.employee.createMany({
      data: [
        { name: 'Белкин Роман Сергеевич', role: 'Сантехник', presence: EmployeePresence.ONLINE, activeCount: 4, doneCount: 128, rating: 4.8 },
        { name: 'Ковалёв Артём Игоревич', role: 'Электрик · Лифты', presence: EmployeePresence.ONLINE, activeCount: 3, doneCount: 96, rating: 4.6 },
        { name: 'Громов Павел Олегович', role: 'Сантехник', presence: EmployeePresence.AWAY, activeCount: 6, doneCount: 154, rating: 4.9 },
        { name: 'Зайцев Олег Николаевич', role: 'Электрик', presence: EmployeePresence.ONLINE, activeCount: 2, doneCount: 73, rating: 4.5 },
        { name: 'Кузьмин Денис Викторович', role: 'Благоустройство', presence: EmployeePresence.OFFLINE, activeCount: 3, doneCount: 64, rating: 4.4 },
        { name: 'Соколов Игорь Петрович', role: 'Лифтёр', presence: EmployeePresence.ONLINE, activeCount: 3, doneCount: 88, rating: 4.7 },
        { name: 'Морозова Дарья Андреевна', role: 'Старший диспетчер', presence: EmployeePresence.ONLINE, activeCount: 2, doneCount: 212, rating: 4.9 },
      ].map((e) => ({ ...e, companyId: COMPANY_ID })),
    });
  }

  if ((await prisma.task.count()) === 0) {
    await prisma.task.createMany({
      data: [
        { title: 'Закупить запчасти для лифта (корп. 2)', assigneeName: 'Соколов И.П.', dueDate: addDays(0), priority: RequestPriority.HIGH, done: false, createdById: admin.id },
        { title: 'Согласовать график опрессовки с РСО', assigneeName: 'Морозова Д.А.', dueDate: addDays(1), priority: RequestPriority.MEDIUM, done: false, createdById: admin.id },
        { title: 'Обзвонить должников по ЖКУ', assigneeName: 'ИИ-ассистент', dueDate: addDays(0), priority: RequestPriority.MEDIUM, done: true, createdById: admin.id },
        { title: 'Проверить заявки без исполнителя', assigneeName: 'Громов П.О.', dueDate: addDays(0), priority: RequestPriority.HIGH, done: false, createdById: admin.id },
        { title: 'Подготовить материалы к ОСС', assigneeName: 'Морозова Д.А.', dueDate: addDays(6), priority: RequestPriority.LOW, done: false, createdById: admin.id },
        { title: 'Обновить регламент аварийной службы', assigneeName: 'Зайцев О.Н.', dueDate: addDays(4), priority: RequestPriority.LOW, done: true, createdById: admin.id },
      ].map((t) => ({ ...t, companyId: COMPANY_ID })),
    });
  }

  // Backfill any legacy rows created before multi-tenancy to the demo company.
  await prisma.serviceRequest.updateMany({ where: { companyId: null }, data: { companyId: COMPANY_ID } });
  await prisma.employee.updateMany({ where: { companyId: null }, data: { companyId: COMPANY_ID } });
  await prisma.task.updateMany({ where: { companyId: null }, data: { companyId: COMPANY_ID } });

  console.log(`Seed complete: 1 company, ${BUILDINGS.length} buildings, ${TICKETS.length} requests.`);
  console.log('Platform admin: superadmin@homedispatcher.local / password123');
  console.log('Company (УК) admin: admin@homedispatcher.local / password123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
