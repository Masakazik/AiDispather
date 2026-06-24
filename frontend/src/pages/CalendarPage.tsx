import { useMemo, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Badge, Button, Icon } from '@/components/ui';
import { useTasksStore } from '@/store/tasks.store';
import type { Task, TaskPriority } from '@/types/task';
import { cn } from '@/utils/cn';

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const PRIO_COLOR: Record<TaskPriority, 'neutral' | 'brand' | 'warning' | 'error'> = {
  LOW: 'neutral',
  MEDIUM: 'brand',
  HIGH: 'warning',
  CRITICAL: 'error',
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function CalendarPage() {
  const { items, create } = useTasksStore();
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<Date>(today);
  const [newTitle, setNewTitle] = useState('');

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of items) {
      if (!t.dueDate) continue;
      const k = dayKey(new Date(t.dueDate));
      const arr = map.get(k);
      if (arr) arr.push(t);
      else map.set(k, [t]);
    }
    return map;
  }, [items]);

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7; // Monday-based
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = (delta: number) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const selectedTasks = tasksByDay.get(dayKey(selected)) ?? [];

  const addOnSelected = async () => {
    if (newTitle.trim().length < 2) return;
    const due = new Date(selected);
    due.setHours(12, 0, 0, 0);
    await create({ title: newTitle.trim(), dueDate: due.toISOString() });
    setNewTitle('');
  };

  return (
    <div className="calendar-layout">
      <div className="hd-card">
        <div className="calendar-head">
          <h3 className="hd-h3" style={{ fontSize: 18, textTransform: 'capitalize' }}>
            {monthLabel}
          </h3>
          <div className="calendar-nav">
            <button className="hd-icon-btn" onClick={() => changeMonth(-1)} aria-label="Предыдущий месяц">
              <Icon name="IconArrowsDownUp" size={16} />
            </button>
            <Button variant="ghost" size="sm" onClick={() => { setView({ year: today.getFullYear(), month: today.getMonth() }); setSelected(today); }}>
              Сегодня
            </Button>
            <button className="hd-icon-btn" onClick={() => changeMonth(1)} aria-label="Следующий месяц">
              <Icon name="IconArrowsDownUp" size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-grid calendar-grid--head">
          {WEEK_DAYS.map((wd) => (
            <div key={wd} className="calendar-grid__wd">
              {wd}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const date = new Date(view.year, view.month, day);
            const isToday = dayKey(date) === dayKey(today);
            const isSelected = dayKey(date) === dayKey(selected);
            const dayTasks = tasksByDay.get(dayKey(date)) ?? [];
            return (
              <div
                key={day}
                className={cn(
                  'calendar-cell calendar-cell--clickable',
                  isToday && 'calendar-cell--today',
                  isSelected && 'calendar-cell--selected',
                )}
                onClick={() => setSelected(date)}
              >
                <span className="calendar-cell__num">{day}</span>
                {dayTasks.slice(0, 2).map((t) => (
                  <div key={t.id} className="calendar-cell__event">
                    <span
                      className="calendar-cell__event-dot"
                      style={{ background: t.done ? 'var(--hd-green-500)' : 'var(--hd-blue-500)' }}
                    />
                    <span className="calendar-cell__event-title">{t.title}</span>
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <span className="calendar-cell__more">+{dayTasks.length - 2}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hd-card">
        <h3 className="hd-h3 card-title" style={{ textTransform: 'capitalize' }}>
          {selected.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </h3>

        <div className="calendar-add">
          <InputText
            placeholder="Задача на этот день…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOnSelected()}
          />
          <Button variant="primary" size="sm" onClick={addOnSelected} disabled={newTitle.trim().length < 2}>
            +
          </Button>
        </div>

        <div className="calendar-tasks">
          {selectedTasks.length === 0 && <div className="empty-hint">На этот день задач нет</div>}
          {selectedTasks.map((t) => (
            <div key={t.id} className="calendar-task">
              <span
                className="calendar-task__dot"
                style={{ background: t.done ? 'var(--hd-green-500)' : 'var(--hd-blue-500)' }}
              />
              <span className={cn('calendar-task__title', t.done && 'calendar-task__title--done')}>
                {t.title}
              </span>
              <Badge color={PRIO_COLOR[t.priority]} size="sm">
                {t.done ? 'готово' : t.priority === 'HIGH' || t.priority === 'CRITICAL' ? 'срочно' : 'в плане'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
