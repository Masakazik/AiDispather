import { useMemo } from 'react';
import { useRequestsStore } from '@/store/requests.store';
import { WeekBarChart } from '@/features/dispatch/components/WeekBarChart';
import { CategoryBars } from '@/features/dispatch/components/CategoryBars';
import { MeterBar } from '@/features/dispatch/components/MeterBar';
import { analyticsMetrics } from '@/features/dispatch/metrics';

export default function AnalyticsPage() {
  const rows = useRequestsStore((s) => s.rows);
  const m = useMemo(() => analyticsMetrics(rows), [rows]);

  return (
    <div className="page">
      <div className="analytics-kpis">
        {m.kpis.map((k) => (
          <div key={k.label} className="hd-card analytics-kpi">
            <div className="analytics-kpi__label">{k.label}</div>
            <div className="analytics-kpi__row">
              <span className="analytics-kpi__value">{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row dash-row--analytics">
        <div className="hd-card">
          <h3 className="hd-h3 card-title">Динамика за неделю</h3>
          <WeekBarChart data={m.week} height={200} />
        </div>
        <div className="hd-card">
          <h3 className="hd-h3 card-title">По категориям</h3>
          <CategoryBars data={m.categories} />
        </div>
      </div>

      <div className="hd-card">
        <h3 className="hd-h3 card-title">Заявки по домам</h3>
        {m.byBuilding.length ? (
          <div className="sla-compare">
            {m.byBuilding.map((b) => (
              <div key={b.name} className="sla-compare__row">
                <span className="sla-compare__label">{b.name}</span>
                <div className="sla-compare__track">
                  <MeterBar value={(b.count / m.buildingMax) * 100} color="var(--hd-blue-500)" height={10} />
                </div>
                <span className="sla-compare__val">{b.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-hint">Нет данных по домам</div>
        )}
      </div>
    </div>
  );
}
