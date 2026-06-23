import { Avatar, Badge, Icon } from '@/components/ui';
import { BUILDINGS } from '@/features/dispatch/data';
import { MeterBar } from '@/features/dispatch/components/MeterBar';

function slaColor(sla: number): string {
  if (sla >= 95) return 'var(--status-success-solid)';
  if (sla >= 90) return 'var(--status-warning-solid)';
  return 'var(--status-error-solid)';
}

export default function BuildingsPage() {
  return (
    <div className="cards-grid cards-grid--360">
      {BUILDINGS.map((b) => (
        <div key={b.id} className="building-card">
          <div className="building-card__head">
            <span className="building-card__icon">
              <Icon name="IconBuildings" size={24} />
            </span>
            <div className="building-card__title-wrap">
              <div className="building-card__name">{b.name}</div>
              <div className="building-card__addr">
                {b.corp} · {b.addr}
              </div>
            </div>
            {b.emergency > 0 && (
              <Badge color="error" size="sm" dot>
                {b.emergency} авар.
              </Badge>
            )}
          </div>

          <div className="building-card__stats">
            <div className="building-card__stat">
              <div className="building-card__stat-value">{b.apts}</div>
              <div className="building-card__stat-label">квартир</div>
            </div>
            <div className="building-card__stat">
              <div className="building-card__stat-value">{b.active}</div>
              <div className="building-card__stat-label">активных заявок</div>
            </div>
            <div className="building-card__stat">
              <div className="building-card__stat-value">{b.sla}%</div>
              <div className="building-card__stat-label">SLA в срок</div>
            </div>
          </div>

          <MeterBar value={b.sla} color={slaColor(b.sla)} height={6} />

          <div className="building-card__foot">
            <span className="building-card__manager">
              <Avatar name={b.manager} size="xs" />
              {b.manager}
            </span>
            <span className="building-card__manager-label">управляющий</span>
          </div>
        </div>
      ))}
    </div>
  );
}
