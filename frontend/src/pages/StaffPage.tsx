import { Avatar } from '@/components/ui';
import { EMPLOYEES } from '@/features/dispatch/data';
import { MeterBar } from '@/features/dispatch/components/MeterBar';

function loadColor(load: number): string {
  if (load >= 85) return 'var(--status-error-solid)';
  if (load >= 60) return 'var(--status-warning-solid)';
  return 'var(--status-success-solid)';
}

export default function StaffPage() {
  return (
    <div className="cards-grid cards-grid--330">
      {EMPLOYEES.map((e) => (
        <div key={e.id} className="staff-card">
          <div className="staff-card__head">
            <Avatar name={e.name} size="lg" presence={e.presence} />
            <div className="staff-card__title-wrap">
              <div className="staff-card__name">{e.name}</div>
              <div className="staff-card__role">{e.role}</div>
            </div>
          </div>

          <div className="staff-card__load-head">
            <span>Загрузка</span>
            <span style={{ color: loadColor(e.load), fontWeight: 600 }}>{e.load}%</span>
          </div>
          <MeterBar value={e.load} color={loadColor(e.load)} />

          <div className="staff-card__stats">
            <div className="staff-card__stat">
              <div className="staff-card__stat-value">{e.active}</div>
              <div className="staff-card__stat-label">в работе</div>
            </div>
            <div className="staff-card__stat staff-card__stat--mid">
              <div className="staff-card__stat-value">{e.done}</div>
              <div className="staff-card__stat-label">выполнено</div>
            </div>
            <div className="staff-card__stat">
              <div className="staff-card__stat-value">{e.rating}</div>
              <div className="staff-card__stat-label">рейтинг</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
