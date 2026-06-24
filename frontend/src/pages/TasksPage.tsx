import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Badge, Button, Icon, Select, type SelectOption } from '@/components/ui';
import { useTasksStore } from '@/store/tasks.store';
import type { TaskPriority } from '@/types/task';
import { cn } from '@/utils/cn';

const PRIO_LABEL: Record<TaskPriority, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
  CRITICAL: 'Критический',
};
const PRIO_COLOR: Record<TaskPriority, 'neutral' | 'brand' | 'warning' | 'error'> = {
  LOW: 'neutral',
  MEDIUM: 'brand',
  HIGH: 'warning',
  CRITICAL: 'error',
};
const PRIO_OPTIONS: SelectOption[] = (Object.keys(PRIO_LABEL) as TaskPriority[]).map((p) => ({
  value: p,
  label: PRIO_LABEL[p],
}));

function formatDue(iso: string | null): string {
  if (!iso) return 'без срока';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export default function TasksPage() {
  const { items, create, toggle, remove } = useTasksStore();
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (title.trim().length < 2) return;
    setBusy(true);
    try {
      await create({
        title: title.trim(),
        assigneeName: assignee.trim() || undefined,
        dueDate: due ? new Date(due).toISOString() : undefined,
        priority,
      });
      setTitle('');
      setAssignee('');
      setDue('');
      setPriority('MEDIUM');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 920 }}>
      {/* Add task bar */}
      <div className="hd-card task-add">
        <InputText
          className="task-add__title"
          placeholder="Новая задача…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <InputText
          className="task-add__assignee"
          placeholder="Исполнитель"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
        <input
          type="date"
          className="task-add__due"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <div className="task-add__prio">
          <Select options={PRIO_OPTIONS} value={priority} onChange={(v) => setPriority(v as TaskPriority)} />
        </div>
        <Button variant="primary" onClick={add} disabled={busy || title.trim().length < 2}>
          Добавить
        </Button>
      </div>

      {/* Task list */}
      <div className="tasks-list hd-card hd-card--flush">
        {items.length === 0 && <div className="empty-hint" style={{ padding: 20 }}>Задач пока нет</div>}
        {items.map((t) => (
          <div key={t.id} className="tasks-list__row">
            <span
              className={cn('tasks-list__check', t.done && 'tasks-list__check--done')}
              onClick={() => void toggle(t.id, !t.done)}
              role="checkbox"
              aria-checked={t.done}
            >
              {t.done && <Icon name="IconCheck" size={14} color="#fff" weight="bold" />}
            </span>
            <div className="tasks-list__main">
              <div className={cn('tasks-list__title', t.done && 'tasks-list__title--done')}>{t.title}</div>
              <div className="tasks-list__meta">
                {t.assigneeName ? `Исполнитель: ${t.assigneeName} · ` : ''}срок: {formatDue(t.dueDate)}
              </div>
            </div>
            <Badge color={PRIO_COLOR[t.priority]} size="sm">
              {PRIO_LABEL[t.priority]}
            </Badge>
            {t.done && (
              <button
                className="hd-icon-btn"
                aria-label="Удалить"
                title="Удалить выполненную задачу"
                onClick={() => void remove(t.id)}
              >
                <Icon name="IconTrash" size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
