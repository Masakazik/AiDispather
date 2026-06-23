import { Icon } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { WeekBarChart } from '@/features/dispatch/components/WeekBarChart';
import { StatusDonut } from '@/features/dispatch/components/StatusDonut';
import { CategoryBars } from '@/features/dispatch/components/CategoryBars';
import { MeterBar } from '@/features/dispatch/components/MeterBar';
import { Avatar } from '@/components/ui';
import { ACTIVITY, DASHBOARD_KPIS, EMPLOYEES, INSIGHTS, TICKETS } from '@/features/dispatch/data';
import { decorateTicket } from '@/features/dispatch/selectors';

function loadColor(load: number): string {
  if (load >= 85) return 'var(--status-error-solid)';
  if (load >= 60) return 'var(--status-warning-solid)';
  return 'var(--status-success-solid)';
}

export default function DashboardPage() {
  const openTicket = useDispatchStore((s) => s.openTicket);
  const active = TICKETS.filter((t) => t.status !== 'done' && t.status !== 'closed')
    .slice(0, 5)
    .map(decorateTicket);

  return (
    <div className="page">
      {/* KPI row */}
      <div className="kpi-grid">
        {DASHBOARD_KPIS.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-card__head">
              <span className="kpi-card__label">{k.label}</span>
              <span className="kpi-card__icon" style={{ background: k.iconBg, color: k.iconFg }}>
                <Icon name={k.icon} size={19} />
              </span>
            </div>
            <div className="kpi-card__value">{k.value}</div>
            <div className="kpi-card__foot">
              {k.delta && <span className="kpi-card__delta">{k.delta}</span>}
              <span className="kpi-card__sub">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Week chart + AI insights */}
      <div className="dash-row dash-row--2-1">
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
          <WeekBarChart />
        </div>

        <div className="hd-card ai-card">
          <div className="ai-card__head">
            <span className="ai-card__icon">
              <Icon name="IconSparkle" size={17} color="#fff" />
            </span>
            <h3 className="hd-h3" style={{ color: 'var(--hd-blue-800)' }}>
              ИИ-инсайты
            </h3>
          </div>
          <div className="ai-card__list">
            {INSIGHTS.map((ins, i) => (
              <div key={i} className="ai-card__item">
                <span className="ai-card__bullet" />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories + donut + employee load */}
      <div className="dash-row dash-row--3">
        <div className="hd-card">
          <h3 className="hd-h3 card-title">Заявки по категориям</h3>
          <CategoryBars />
        </div>

        <div className="hd-card">
          <h3 className="hd-h3 card-title">Заявки по статусам</h3>
          <StatusDonut />
        </div>

        <div className="hd-card">
          <h3 className="hd-h3 card-title">Загрузка сотрудников</h3>
          <div className="emp-load">
            {EMPLOYEES.slice(0, 6).map((e) => (
              <div key={e.id} className="emp-load__row">
                <Avatar name={e.name} size="xs" />
                <div className="emp-load__main">
                  <div className="emp-load__name">{e.name}</div>
                  <MeterBar value={e.load} color={loadColor(e.load)} />
                </div>
                <span className="emp-load__pct">{e.load}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active requests + activity feed */}
      <div className="dash-row dash-row--2">
        <div className="hd-card">
          <h3 className="hd-h3 card-title">Активные заявки</h3>
          <div className="active-list">
            {active.map((t) => (
              <div key={t.id} className="active-list__row" onClick={() => openTicket(t.id)}>
                <span className="active-list__dot" style={{ background: t.statusDot }} />
                <span className="active-list__num tabular">{t.num}</span>
                <span className="active-list__title">{t.title}</span>
                <span className="active-list__sla" style={{ color: t.slaColorValue }}>
                  {t.sla}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="hd-card">
          <div className="card-head card-head--feed">
            <span className="feed-dot" />
            <h3 className="hd-h3">Лента событий</h3>
            <span className="feed-live">в реальном времени</span>
          </div>
          <div className="feed">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="feed__row">
                <span className="feed__time tabular">{a.time}</span>
                <span className="feed__text">{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
