import { WEEK_SERIES } from '../data';

interface WeekBarChartProps {
  height?: number;
}

/** Grouped (incoming vs resolved) weekly bar chart, built with CSS like the design. */
export function WeekBarChart({ height = 190 }: WeekBarChartProps) {
  const max = Math.max(...WEEK_SERIES.map((d) => Math.max(d.incoming, d.resolved)));

  return (
    <div className="week-chart" style={{ height }}>
      {WEEK_SERIES.map((d) => (
        <div key={d.label} className="week-chart__col">
          <div className="week-chart__bars">
            <div
              className="week-chart__bar"
              style={{ height: `${Math.round((d.incoming / max) * 100)}%`, background: 'var(--hd-blue-200)' }}
              title={`Поступило: ${d.incoming}`}
            />
            <div
              className="week-chart__bar"
              style={{ height: `${Math.round((d.resolved / max) * 100)}%`, background: 'var(--hd-blue-600)' }}
              title={`Решено: ${d.resolved}`}
            />
          </div>
          <span className="week-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
