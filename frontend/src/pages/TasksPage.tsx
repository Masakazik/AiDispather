import { useState } from 'react';
import { Badge, Icon } from '@/components/ui';
import { PRIO, TEAM_TASKS } from '@/features/dispatch/data';
import { cn } from '@/utils/cn';

export default function TasksPage() {
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(TEAM_TASKS.map((t) => [t.id, t.done])),
  );

  const toggle = (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="tasks-list hd-card hd-card--flush">
      {TEAM_TASKS.map((t) => {
        const isDone = done[t.id];
        return (
          <div key={t.id} className="tasks-list__row" onClick={() => toggle(t.id)}>
            <span className={cn('tasks-list__check', isDone && 'tasks-list__check--done')}>
              {isDone && <Icon name="IconCheck" size={14} color="#fff" weight="bold" />}
            </span>
            <div className="tasks-list__main">
              <div className={cn('tasks-list__title', isDone && 'tasks-list__title--done')}>
                {t.title}
              </div>
              <div className="tasks-list__meta">
                Исполнитель: {t.assignee} · срок: {t.due}
              </div>
            </div>
            <Badge color={PRIO[t.priority].color} size="sm">
              {PRIO[t.priority].label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
