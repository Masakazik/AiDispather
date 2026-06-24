interface Segment {
  label: string;
  count: number;
  color: string;
}

interface StatusDonutProps {
  segments: Segment[];
}

/** Conic-gradient donut with a legend. */
export function StatusDonut({ segments }: StatusDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return <div className="empty-hint">Нет данных</div>;

  let acc = 0;
  const stops = segments.map((s) => {
    const from = (acc / total) * 360;
    acc += s.count;
    const to = (acc / total) * 360;
    return `${s.color} ${from}deg ${to}deg`;
  });

  return (
    <div className="donut">
      <div className="donut__ring" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
        <div className="donut__hole">
          <span className="donut__total">{total}</span>
          <span className="donut__caption">всего</span>
        </div>
      </div>
      <div className="donut__legend">
        {segments.map((s) => (
          <div key={s.label} className="donut__legend-row">
            <span className="donut__swatch" style={{ background: s.color }} />
            <span className="donut__legend-label">{s.label}</span>
            <span className="donut__legend-count">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
