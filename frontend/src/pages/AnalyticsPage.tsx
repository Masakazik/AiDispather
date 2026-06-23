import { ANALYTICS_KPIS, BUILDINGS } from '@/features/dispatch/data';
import { WeekBarChart } from '@/features/dispatch/components/WeekBarChart';
import { CategoryBars } from '@/features/dispatch/components/CategoryBars';
import { MeterBar } from '@/features/dispatch/components/MeterBar';

function slaColor(sla: number): string {
  if (sla >= 95) return 'var(--status-success-solid)';
  if (sla >= 90) return 'var(--status-warning-solid)';
  return 'var(--status-error-solid)';
}

export default function AnalyticsPage() {
  return (
    <div className="page">
      <div className="analytics-kpis">
        {ANALYTICS_KPIS.map((k) => (
          <div key={k.label} className="hd-card analytics-kpi">
            <div className="analytics-kpi__label">{k.label}</div>
            <div className="analytics-kpi__row">
              <span className="analytics-kpi__value">{k.value}</span>
              <span className="analytics-kpi__delta">{k.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row dash-row--analytics">
        <div className="hd-card">
          <h3 className="hd-h3 card-title">Динамика за неделю</h3>
          <WeekBarChart height={200} />
        </div>
        <div className="hd-card">
          <h3 className="hd-h3 card-title">По категориям</h3>
          <CategoryBars />
        </div>
      </div>

      <div className="hd-card">
        <h3 className="hd-h3 card-title">Сравнение домов по SLA</h3>
        <div className="sla-compare">
          {BUILDINGS.map((b) => (
            <div key={b.id} className="sla-compare__row">
              <span className="sla-compare__label">
                {b.name} · {b.corp}
              </span>
              <div className="sla-compare__track">
                <MeterBar value={b.sla} color={slaColor(b.sla)} height={10} />
              </div>
              <span className="sla-compare__val">{b.sla}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
