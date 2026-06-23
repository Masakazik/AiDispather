import { STATUS_SEGMENTS } from '../data';

/** Conic-gradient donut with a legend, replicating the design's status breakdown. */
export function StatusDonut() {
  const total = STATUS_SEGMENTS.reduce((sum, s) => sum + s.count, 0);

  let acc = 0;
  const stops = STATUS_SEGMENTS.map((s) => {
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
        {STATUS_SEGMENTS.map((s) => (
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
