import { useMemo } from 'react';
import { Avatar, Icon } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { useRequestsStore } from '@/store/requests.store';
import { WeekBarChart } from '@/features/dispatch/components/WeekBarChart';
import { StatusDonut } from '@/features/dispatch/components/StatusDonut';
import { CategoryBars } from '@/features/dispatch/components/CategoryBars';
import { MeterBar } from '@/features/dispatch/components/MeterBar';
import { decorateTicket } from '@/features/dispatch/selectors';
import { dashboardMetrics, isOpen } from '@/features/dispatch/metrics';

export default function DashboardPage() {
  const openTicket = useDispatchStore((s) => s.openTicket);
  const rows = useRequestsStore((s) => s.rows);
  const items = useRequestsStore((s) => s.items);

  const m = useMemo(() => dashboardMetrics(rows), [rows]);
  const active = useMemo(
    () =>
      items
        .filter((t) => t.status !== 'done' && t.status !== 'closed')
        .slice(0, 6)
        .map(decorateTicket),
    [items],
  );
  const openIds = new Set(rows.filter(isOpen).map((r) => r.id));

  return (
    <div className="page">
      {/* KPI row */}
      <div className="kpi-grid">
        {m.kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-card__head">
              <span className="kpi-card__label">{k.label}</span>
              <span className="kpi-card__icon" style={{ background: k.iconBg, color: k.iconFg }}>
                <Icon name={k.icon} size={19} />
              </span>
            </div>
            <div className="kpi-card__value">{k.value}</div>
            <div className="kpi-card__foot">
              <span className="kpi-card__sub">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly dynamics */}
      <div className="hd-card">
        <div className="card-head">
          <h3 className="hd-h3">Динамика заявок за неделю</h3>
          <div className="legend">
            <span className="legend__item">
              <span className="legend__swatch" style={{ background: 'var(--hd-blue-200)' }} />
              Поступило
            </span>
            <span className="legend__item">
              <span className="legend__swatch" style={{ background: 'var(--hd-blue-600)' }} />
              Решено
            </span>
          </div>
        </div>
        <WeekBarChart data={m.week} />
      </div>

      {/* Categories + status donut + assignee load */}
      <div className="dash-row dash-row--3">
        <div className="hd-card">
          <h3 className="hd-h3 card-title">Заявки по категориям</h3>
          <CategoryBars data={m.categories} />
        </div>

        <div className="hd-card">
          <h3 className="hd-h3 card-title">Заявки по статусам</h3>
          <StatusDonut segments={m.statusSegments} />
        </div>

        <div className="hd-card">
          <h3 className="hd-h3 card-title">Загрузка исполнителей</h3>
          {m.load.length ? (
            <div className="emp-load">
              {m.load.map((e) => (
                <div key={e.name} className="emp-load__row">
                  <Avatar name={e.name} size="xs" />
                  <div className="emp-load__main">
                    <div className="emp-load__name">{e.name}</div>
                    <MeterBar
                      value={(e.count / m.loadMax) * 100}
                      color="var(--hd-blue-500)"
                    />
                  </div>
                  <span className="emp-load__pct">{e.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-hint">Нет назначенных заявок</div>
          )}
        </div>
      </div>

      {/* Active requests + activity feed */}
      <div className="dash-row dash-row--2">
        <div className="hd-card">
          <h3 className="hd-h3 card-title">Активные заявки</h3>
          {active.length ? (
            <div className="active-list">
              {active.map((t) => (
                <div key={t.id} className="active-list__row" onClick={() => openTicket(t.id)}>
                  <span className="active-list__dot" style={{ background: t.statusDot }} />
                  <span className="active-list__num tabular">{t.num}</span>
                  <span className="active-list__title">{t.title}</span>
                  <span className="active-list__sla muted">{t.statusLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-hint">Активных заявок нет</div>
          )}
        </div>

        <div className="hd-card">
          <div className="card-head card-head--feed">
            <span className="feed-dot" />
            <h3 className="hd-h3">Лента событий</h3>
            <span className="feed-live">по обновлениям</span>
          </div>
          {m.activity.length ? (
            <div className="feed">
              {m.activity.map((a, i) => (
                <div key={i} className="feed__row">
                  <span className="feed__time tabular">{a.time}</span>
                  <span className="feed__text">{a.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-hint">Пока нет событий</div>
          )}
        </div>
      </div>

      {openIds.size === 0 && rows.length === 0 && (
        <div className="empty-hint">Загрузка данных…</div>
      )}
    </div>
  );
}
