import type {
  ActivityItem,
  Building,
  DocItem,
  MaintenanceItem,
  PriorityMeta,
  Resident,
  StatusMeta,
  TeamTask,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '@/types/dispatch';

export const STATUS: Record<TicketStatus, StatusMeta> = {
  new: { label: 'Новая', color: 'neutral', dot: 'var(--hd-neutral-400)' },
  assigned: { label: 'Назначена', color: 'brand', dot: 'var(--hd-blue-500)' },
  in_progress: { label: 'В работе', color: 'warning', dot: 'var(--hd-amber-500)' },
  done: { label: 'Выполнена', color: 'success', dot: 'var(--hd-green-500)' },
  closed: { label: 'Закрыта', color: 'neutral', dot: 'var(--hd-neutral-300)' },
};

export const PRIO: Record<TicketPriority, PriorityMeta> = {
  low: { label: 'Низкий', color: 'neutral' },
  medium: { label: 'Средний', color: 'brand' },
  high: { label: 'Высокий', color: 'warning' },
  critical: { label: 'Критический', color: 'error' },
};

export const COLUMNS: { key: TicketStatus; label: string; accent: string }[] = [
  { key: 'new', label: 'Новая', accent: 'var(--hd-blue-400)' },
  { key: 'assigned', label: 'Назначена', accent: 'var(--hd-blue-700)' },
  { key: 'in_progress', label: 'В работе', accent: 'var(--hd-amber-500)' },
  { key: 'done', label: 'Выполнена', accent: 'var(--hd-green-600)' },
];

export const BUILDINGS: Building[] = [
  { id: 'ap1', name: 'ЖК «Алые Паруса»', corp: 'корп. 1', addr: 'ул. Парусная, 12к1', apts: 96, manager: 'Морозова Д.А.', active: 5, emergency: 1, sla: 97 },
  { id: 'ap2', name: 'ЖК «Алые Паруса»', corp: 'корп. 2', addr: 'ул. Парусная, 12к2', apts: 84, manager: 'Морозова Д.А.', active: 3, emergency: 0, sla: 99 },
  { id: 'ap3', name: 'ЖК «Алые Паруса»', corp: 'корп. 3', addr: 'ул. Парусная, 12к3', apts: 120, manager: 'Кузьмин Д.В.', active: 6, emergency: 2, sla: 88 },
  { id: 'sp1', name: 'ЖК «Северный Парк»', corp: 'корп. 1', addr: 'пр. Северный, 5', apts: 140, manager: 'Зайцев О.Н.', active: 4, emergency: 0, sla: 95 },
  { id: 'sp2', name: 'ЖК «Северный Парк»', corp: 'корп. 2', addr: 'пр. Северный, 7', apts: 110, manager: 'Зайцев О.Н.', active: 7, emergency: 1, sla: 91 },
  { id: 'rb1', name: 'ЖК «Речной Бриз»', corp: 'корп. 1', addr: 'наб. Речная, 3', apts: 72, manager: 'Соколов И.П.', active: 2, emergency: 0, sla: 98 },
];

export const RESIDENTS: Resident[] = [
  { id: 'r1', name: 'Иванов Алексей Петрович', phone: '+7 926 110-22-13', bId: 'ap1', apt: 'кв. 12', reqs: 3, status: 'active', debt: 0 },
  { id: 'r2', name: 'Петрова Елена Сергеевна', phone: '+7 905 233-87-04', bId: 'ap1', apt: 'кв. 44', reqs: 5, status: 'active', debt: 0 },
  { id: 'r3', name: 'Кузнецова Татьяна Викторовна', phone: '+7 916 540-11-29', bId: 'ap1', apt: 'кв. 33', reqs: 2, status: 'active', debt: 0 },
  { id: 'r4', name: 'Соколова Ольга Дмитриевна', phone: '+7 903 778-65-12', bId: 'ap3', apt: 'кв. 8', reqs: 4, status: 'active', debt: 0 },
  { id: 'r5', name: 'Попов Виктор Степанович', phone: '+7 926 884-30-91', bId: 'ap1', apt: 'кв. 48', reqs: 1, status: 'active', debt: 0 },
  { id: 'r6', name: 'Козлова Анна Михайловна', phone: '+7 919 222-54-76', bId: 'ap3', apt: 'кв. 101', reqs: 6, status: 'active', debt: 0 },
  { id: 'r7', name: 'Киселёва Юлия Сергеевна', phone: '+7 925 661-09-88', bId: 'ap1', apt: 'кв. 61', reqs: 2, status: 'debt', debt: 8450 },
  { id: 'r8', name: 'Николаев Роман Викторович', phone: '+7 926 890-12-34', bId: 'sp2', apt: 'кв. 55', reqs: 3, status: 'active', debt: 0 },
  { id: 'r9', name: 'Фёдоров Иван Павлович', phone: '+7 904 117-43-25', bId: 'sp2', apt: 'кв. 14', reqs: 2, status: 'active', debt: 0 },
  { id: 'r10', name: 'Новикова Мария Александровна', phone: '+7 915 770-22-18', bId: 'ap2', apt: 'кв. 22', reqs: 1, status: 'active', debt: 0 },
  { id: 'r11', name: 'Орлова Екатерина Борисовна', phone: '+7 926 305-66-90', bId: 'sp1', apt: 'кв. 89', reqs: 2, status: 'debt', debt: 9780 },
  { id: 'r12', name: 'Тарасова Алина Константиновна', phone: '+7 903 412-09-55', bId: 'rb1', apt: 'кв. 30', reqs: 1, status: 'active', debt: 0 },
];

export const TICKETS: Ticket[] = [
  { id: 't241', num: '#10241', title: 'Не работает лифт в подъезде 2', desc: 'Лифт остановился между 5 и 6 этажом, двери не открываются. Внутри людей нет. Жители просят срочно починить.', category: 'Лифт', catIcon: 'IconArrowsDownUp', priority: 'high', status: 'in_progress', bId: 'ap1', apt: 'кв. 44', resident: 'Петрова Е.С.', phone: '+7 905 233-87-04', assignee: 'Соколов И.П.', created: '21.06 · 08:12', updated: '10 мин назад', sla: 'просрочено', slaState: 'over', tags: ['лифт', 'безопасность'], photos: 2, chat: 3, source: 'Telegram', ai: true, aiConf: 94, aiNote: 'Распознано из чата дома: остановка лифта между этажами. Категория «Лифт» определена автоматически, приоритет повышен.', emergency: false },
  { id: 't242', num: '#10242', title: 'Течь в подвале корпуса 3', desc: 'Обнаружена течь в подвальном помещении возле трубы горячего водоснабжения. Вода скапливается на полу.', category: 'Сантехника', catIcon: 'IconDrop', priority: 'high', status: 'assigned', bId: 'ap3', apt: 'кв. 8', resident: 'Соколова О.Д.', phone: '+7 903 778-65-12', assignee: 'Белкин Р.С.', created: '21.06 · 07:31', updated: '35 мин назад', sla: 'осталось 35 мин', slaState: 'warn', tags: ['протечка', 'подвал', 'ГВС'], photos: 1, chat: 1, source: 'Телефон', ai: true, aiConf: 96, aiNote: 'Звонок от жителя кв. 8. ИИ распознал проблему: течь трубы ГВС в подвале, создана заявка и назначен сантехник.', emergency: false },
  { id: 't243', num: '#10243', title: 'Нет горячей воды — 4 этаж', desc: 'Со вчерашнего вечера отсутствует горячая вода на 4 этаже. Соседи жалуются на ту же проблему.', category: 'Водоснабжение', catIcon: 'IconThermometer', priority: 'medium', status: 'new', bId: 'ap1', apt: 'кв. 33', resident: 'Кузнецова Т.В.', phone: '+7 916 540-11-29', assignee: null, created: '21.06 · 09:05', updated: '3 ч назад', sla: 'осталось 3 ч', slaState: 'ok', tags: ['ГВС', 'отсутствие воды'], photos: 0, chat: 0, source: 'Telegram', ai: true, aiConf: 90, aiNote: 'Возможный дубль обращения #10242 — связано с течью ГВС в том же контуре. Рекомендуется объединить.', emergency: false, dup: true },
  { id: 't244', num: '#10244', title: 'Шум ночью из кв. 33', desc: 'Регулярный шум после 23:00 — громкая музыка и ремонтные работы. Просьба провести беседу.', category: 'Шум', catIcon: 'IconBell', priority: 'low', status: 'assigned', bId: 'ap1', apt: 'кв. 31', resident: 'Лебедев А.Н.', phone: '+7 900 145-77-02', assignee: 'Морозова Д.А.', created: '20.06 · 23:40', updated: '9 ч назад', sla: 'осталось 9 ч', slaState: 'ok', tags: ['шум', 'ночное время'], photos: 0, chat: 2, source: 'MAX', ai: true, aiConf: 88, aiNote: 'Жалоба на нарушение тишины. ИИ направил уведомление и поставил задачу диспетчеру.', emergency: false },
  { id: 't245', num: '#10245', title: 'Сломан домофон — подъезд 1', desc: 'Домофон не считывает ключи, дверь приходится открывать вручную. Нужна замена считывателя.', category: 'Доступ', catIcon: 'IconKey', priority: 'medium', status: 'in_progress', bId: 'ap1', apt: 'кв. 5', resident: 'Андреев П.Т.', phone: '+7 926 771-03-44', assignee: 'Ковалёв А.И.', created: '20.06 · 18:20', updated: '22 ч назад', sla: 'осталось 22 ч', slaState: 'ok', tags: ['домофон', 'доступ'], photos: 1, chat: 0, source: 'Telegram', ai: true, aiConf: 93, aiNote: 'Неисправность домофона. ИИ назначил электрика и заказал считыватель со склада.', emergency: false },
  { id: 't246', num: '#10246', title: 'Мусор не вывезли 2 дня', desc: 'Контейнерная площадка переполнена, мусор не вывозился два дня. Прикладываю фото.', category: 'Благоустройство', catIcon: 'IconTrash', priority: 'medium', status: 'new', bId: 'sp2', apt: 'кв. 14', resident: 'Фёдоров И.П.', phone: '+7 904 117-43-25', assignee: null, created: '21.06 · 09:30', updated: '40 мин назад', sla: 'осталось 6 ч', slaState: 'ok', tags: ['мусор', 'вывоз'], photos: 1, chat: 0, source: 'Telegram', ai: true, aiConf: 92, aiNote: 'Обращение с фото. ИИ распознал переполнение контейнеров и создал заявку для подрядчика.', emergency: false },
  { id: 't247', num: '#10247', title: 'Шлагбаум не открывается по брелоку', desc: 'Шлагбаум на въезде перестал реагировать на брелоки. У соседей такая же проблема.', category: 'Доступ', catIcon: 'IconKey', priority: 'medium', status: 'in_progress', bId: 'rb1', apt: 'кв. 30', resident: 'Тарасова А.К.', phone: '+7 903 412-09-55', assignee: 'Зайцев О.Н.', created: '21.06 · 07:00', updated: '2 ч назад', sla: 'осталось 5 ч', slaState: 'ok', tags: ['шлагбаум', 'доступ'], photos: 1, chat: 1, source: 'MAX', ai: true, aiConf: 91, aiNote: 'Сбой контроллера шлагбаума. ИИ объединил два похожих обращения в одну заявку.', emergency: false },
  { id: 't248', num: '#10248', title: 'Холодно в подъезде — нет отопления', desc: 'В подъезде холодно, батареи не греют. Просьба проверить систему отопления МОП.', category: 'Отопление', catIcon: 'IconThermometer', priority: 'high', status: 'assigned', bId: 'ap3', apt: 'кв. 101', resident: 'Козлова А.М.', phone: '+7 919 222-54-76', assignee: 'Громов П.О.', created: '21.06 · 06:50', updated: '1 ч назад', sla: 'осталось 1 ч', slaState: 'warn', tags: ['отопление', 'подъезд'], photos: 0, chat: 1, source: 'Telegram', ai: true, aiConf: 89, aiNote: 'Отсутствие отопления в местах общего пользования. Назначен сантехник, приоритет высокий.', emergency: false },
  { id: 't250', num: '#10250', title: 'Неверные начисления за март', desc: 'В квитанции за март указана сумма больше обычной. Прошу сделать перерасчёт.', category: 'Начисления', catIcon: 'IconFileText', priority: 'low', status: 'new', bId: 'ap1', apt: 'кв. 61', resident: 'Киселёва Ю.С.', phone: '+7 925 661-09-88', assignee: null, created: '20.06 · 14:10', updated: '19 ч назад', sla: 'осталось 2 дн', slaState: 'ok', tags: ['начисления', 'перерасчёт'], photos: 0, chat: 0, source: 'Виджет', ai: true, aiConf: 87, aiNote: 'Вопрос по начислениям передан в бухгалтерию. ИИ приложил историю платежей жителя.', emergency: false },
  { id: 't251', num: '#10251', title: 'Вопрос по оплате за капремонт', desc: 'Не приходит квитанция на капитальный ремонт. Как оплатить и куда обращаться?', category: 'Начисления', catIcon: 'IconFileText', priority: 'low', status: 'assigned', bId: 'ap1', apt: 'кв. 48', resident: 'Попов В.С.', phone: '+7 926 884-30-91', assignee: 'Морозова Д.А.', created: '19.06 · 11:05', updated: '2 дн назад', sla: 'ожидает жителя', slaState: 'ok', tags: ['капремонт', 'начисления'], photos: 0, chat: 1, source: 'Телефон', ai: true, aiConf: 85, aiNote: 'ИИ отправил инструкцию по оплате капремонта и реквизиты. Ожидается ответ жителя.', emergency: false },
  { id: 't253', num: '#10253', title: 'Затопление — прорыв трубы кв. 55', desc: 'Прорвало трубу в ванной, вода льётся к соседям снизу. Жилец не может перекрыть стояк.', category: 'Авария', catIcon: 'IconWarningOctagon', priority: 'critical', status: 'in_progress', bId: 'sp2', apt: 'кв. 55', resident: 'Николаев Р.В.', phone: '+7 926 890-12-34', assignee: 'Громов П.О.', created: '21.06 · 06:22', updated: '5 мин назад', sla: 'аварийная', slaState: 'over', tags: ['авария', 'прорыв', 'эскалация'], photos: 3, chat: 5, source: 'Telegram', ai: true, aiConf: 98, aiNote: 'Экстренное обращение. ИИ распознал аварию, мгновенно эскалировал на дежурного диспетчера и аварийную бригаду.', emergency: true },
  { id: 't255', num: '#10255', title: 'Просьба установить доп. камеру', desc: 'Просьба рассмотреть установку дополнительной камеры видеонаблюдения у детской площадки.', category: 'Безопасность', catIcon: 'IconShieldWarning', priority: 'low', status: 'new', bId: 'ap1', apt: 'кв. 7', resident: 'Васильева Н.О.', phone: '+7 927 330-88-21', assignee: null, created: '20.06 · 16:45', updated: '17 ч назад', sla: 'осталось 3 дн', slaState: 'ok', tags: ['видеонаблюдение', 'безопасность'], photos: 0, chat: 0, source: 'Виджет', ai: true, aiConf: 90, aiNote: 'Предложение по благоустройству. ИИ создал заявку на рассмотрение и поставил в очередь на ОСС.', emergency: false },
  { id: 't256', num: '#10256', title: 'Спасибо, дверь больше не скрипит!', desc: 'Спасибо мастеру, входная дверь в подъезд починена и больше не скрипит. Отличная работа!', category: 'Обратная связь', catIcon: 'IconCheckCircle', priority: 'low', status: 'done', bId: 'ap2', apt: 'кв. 22', resident: 'Новикова М.А.', phone: '+7 915 770-22-18', assignee: 'Кузьмин Д.В.', created: '20.06 · 10:05', updated: '1 дн назад', sla: 'выполнено в срок', slaState: 'ok', tags: ['обратная связь', 'позитив'], photos: 0, chat: 1, source: 'Telegram', ai: true, aiConf: 95, aiNote: 'ИИ распознал положительный отзыв и отметил заявку как подтверждённую жителем.', emergency: false },
  { id: 't258', num: '#10258', title: 'Не работает розетка в холле', desc: 'Розетка возле почтовых ящиков не работает. Раньше заряжали электросамокаты.', category: 'Электрика', catIcon: 'IconLightning', priority: 'low', status: 'new', bId: 'ap1', apt: 'у почтовых ящиков', resident: 'Сидоров Д.В.', phone: '+7 926 050-71-19', assignee: null, created: '21.06 · 10:32', updated: 'только что', sla: 'осталось 2 дн', slaState: 'ok', tags: ['электрика', 'МОП'], photos: 0, chat: 0, source: 'Виджет', ai: true, aiConf: 91, aiNote: 'Только что создано ИИ из обращения в виджете. Категория «Электрика», ожидает назначения.', emergency: false },
  { id: 't240', num: '#10240', title: 'Замена лампы в подъезде', desc: 'Перегорела лампа на лестничной площадке 7 этажа. Просьба заменить.', category: 'Электрика', catIcon: 'IconLightning', priority: 'low', status: 'done', bId: 'sp1', apt: 'кв. 89', resident: 'Орлова Е.Б.', phone: '+7 926 305-66-90', assignee: 'Зайцев О.Н.', created: '19.06 · 09:15', updated: '2 дн назад', sla: 'выполнено в срок', slaState: 'ok', tags: ['освещение', 'МОП'], photos: 0, chat: 0, source: 'Telegram', ai: true, aiConf: 96, aiNote: 'Стандартная заявка на замену освещения. Закрыта, подтверждена жителем.', emergency: false },
];

export const MAINTENANCE: MaintenanceItem[] = [
  { title: 'ТО лифтового оборудования', date: '24 июня', day: 24, building: 'ЖК «Алые Паруса», корп. 1–2', type: 'Плановое', color: 'var(--hd-blue-500)' },
  { title: 'Опрессовка системы отопления', date: '26 июня', day: 26, building: 'ЖК «Северный Парк»', type: 'Сезонное', color: 'var(--hd-amber-500)' },
  { title: 'Проверка газового оборудования', date: '23 июня', day: 23, building: 'ЖК «Речной Бриз»', type: 'Инспекция', color: 'var(--hd-red-500)' },
  { title: 'Промывка фасада и витражей', date: '30 июня', day: 30, building: 'ЖК «Алые Паруса», корп. 3', type: 'Клининг', color: 'var(--hd-green-500)' },
  { title: 'Дезинсекция подвалов', date: '25 июня', day: 25, building: 'ЖК «Северный Парк», корп. 2', type: 'Санитарное', color: 'var(--hd-blue-400)' },
];

export const ACTIVITY: ActivityItem[] = [
  { time: '10:32', text: 'Новое обращение в Telegram: «Не работает розетка в холле» — ИИ создал заявку #10258', tone: 'ai' },
  { time: '10:28', text: 'Заявка #10241 (лифт) — Соколов И.П. прибыл на объект, начал ремонт', tone: 'info' },
  { time: '10:15', text: 'ИИ совершил исходящий звонок Киселёвой Ю.С. — напоминание о задолженности', tone: 'ai' },
  { time: '10:00', text: 'Заявка #10240 (освещение) закрыта — подтверждено жителем', tone: 'success' },
  { time: '09:42', text: 'Эскалация: #10253 (прорыв трубы) передана аварийной бригаде', tone: 'error' },
  { time: '09:30', text: 'Фёдоров И.П. прислал фото переполненного контейнера — заявка #10246', tone: 'info' },
];

export const INSIGHTS: string[] = [
  'Рост обращений по категории «Лифт» на 23% — рекомендуется внеплановое ТО лифтов в корп. 1 и 2.',
  '78% обращений в ЖК «Северный Парк» связаны с ГВС — вероятна системная проблема в контуре отопления.',
  'Среднее время реакции на критические заявки снизилось до 8 минут — лучший показатель за квартал.',
  'Удовлетворённость жителей выросла на 0.3 пункта после запуска авто-уведомлений о статусе заявок.',
];

export const TEAM_TASKS: TeamTask[] = [
  { id: 'k1', title: 'Закупить запчасти для лифта (корп. 2)', assignee: 'Соколов И.П.', due: '23 июня', priority: 'high', done: false },
  { id: 'k2', title: 'Согласовать график опрессовки с РСО', assignee: 'Морозова Д.А.', due: '24 июня', priority: 'medium', done: false },
  { id: 'k3', title: 'Обзвонить должников по ЖКУ (12 квартир)', assignee: 'ИИ-ассистент', due: 'сегодня', priority: 'medium', done: true },
  { id: 'k4', title: 'Проверить заявки без исполнителя', assignee: 'Громов П.О.', due: 'сегодня', priority: 'high', done: false },
  { id: 'k5', title: 'Подготовить материалы к ОСС', assignee: 'Морозова Д.А.', due: '30 июня', priority: 'low', done: false },
  { id: 'k6', title: 'Обновить регламент аварийной службы', assignee: 'Зайцев О.Н.', due: '28 июня', priority: 'low', done: true },
];

export const DOCS: DocItem[] = [
  { name: 'Договор управления — ЖК «Алые Паруса»', type: 'PDF', size: '2.4 МБ', date: '01.03.2026', color: 'var(--hd-red-600)' },
  { name: 'Протокол ОСС №14', type: 'PDF', size: '880 КБ', date: '12.05.2026', color: 'var(--hd-red-600)' },
  { name: 'Акт приёмки лифта корп. 2', type: 'PDF', size: '1.1 МБ', date: '18.06.2026', color: 'var(--hd-red-600)' },
  { name: 'Тариф на содержание 2026', type: 'XLSX', size: '64 КБ', date: '10.01.2026', color: 'var(--hd-green-600)' },
  { name: 'Паспорт готовности к зиме', type: 'PDF', size: '3.2 МБ', date: '15.09.2025', color: 'var(--hd-red-600)' },
  { name: 'Смета на ремонт кровли', type: 'XLSX', size: '120 КБ', date: '02.06.2026', color: 'var(--hd-green-600)' },
  { name: 'Регламент аварийной службы', type: 'DOCX', size: '210 КБ', date: '28.04.2026', color: 'var(--hd-blue-600)' },
  { name: 'Отчёт по SLA за май', type: 'PDF', size: '540 КБ', date: '03.06.2026', color: 'var(--hd-red-600)' },
];

/* ---- Dashboard / analytics datasets ---- */
export const WEEK_SERIES = [
  { label: 'Пн', incoming: 38, resolved: 31 },
  { label: 'Вт', incoming: 52, resolved: 47 },
  { label: 'Ср', incoming: 34, resolved: 36 },
  { label: 'Чт', incoming: 61, resolved: 52 },
  { label: 'Пт', incoming: 45, resolved: 44 },
  { label: 'Сб', incoming: 22, resolved: 24 },
  { label: 'Вс', incoming: 16, resolved: 18 },
];

export const CATEGORIES = [
  { label: 'Водоснабжение', count: 68, color: 'var(--hd-blue-600)' },
  { label: 'Лифт', count: 52, color: 'var(--hd-blue-500)' },
  { label: 'Электрика', count: 45, color: 'var(--hd-blue-400)' },
  { label: 'Отопление', count: 38, color: 'var(--hd-sky-300)' },
  { label: 'Благоустройство', count: 31, color: 'var(--hd-neutral-300)' },
  { label: 'Доступ', count: 22, color: 'var(--hd-neutral-200)' },
];

export const STATUS_SEGMENTS = [
  { label: 'Новые', count: 5, color: 'var(--hd-neutral-400)' },
  { label: 'Назначенные', count: 6, color: 'var(--hd-blue-500)' },
  { label: 'В работе', count: 5, color: 'var(--hd-amber-500)' },
  { label: 'Выполненные', count: 23, color: 'var(--hd-green-500)' },
];

export const DASHBOARD_KPIS = [
  { label: 'Открытые заявки', value: '14', icon: 'IconStack', iconBg: 'var(--surface-brand-subtle)', iconFg: 'var(--hd-blue-600)', delta: '+3', sub: 'из них 2 аварийные' },
  { label: 'Выполнено сегодня', value: '23', icon: 'IconCheckCircle', iconBg: 'var(--status-success-bg)', iconFg: 'var(--status-success-solid)', delta: '+18%', sub: 'за смену' },
  { label: 'Просрочено', value: '3', icon: 'IconWarning', iconBg: 'var(--status-error-bg)', iconFg: 'var(--status-error-solid)', delta: '', sub: 'требуют внимания' },
  { label: 'SLA в срок', value: '96%', icon: 'IconGauge', iconBg: 'var(--status-info-bg)', iconFg: 'var(--hd-blue-600)', delta: '+4%', sub: 'за месяц' },
] as const;

export const ANALYTICS_KPIS = [
  { label: 'Всего заявок за месяц', value: '342', delta: '+8%' },
  { label: 'Среднее время реакции', value: '8 мин', delta: '−34%' },
  { label: 'Выполнение SLA', value: '96%', delta: '+4%' },
  { label: 'Обработано ИИ', value: '94%', delta: '+18%' },
  { label: 'Оценка CSAT', value: '4.6', delta: '+0.3' },
  { label: 'Повторные обращения', value: '3%', delta: '−2%' },
];

export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
