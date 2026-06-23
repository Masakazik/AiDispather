import { CATEGORIES } from '../data';

/** Horizontal category breakdown bars. */
export function CategoryBars() {
  const max = Math.max(...CATEGORIES.map((c) => c.count));
  return (
    <div className="cat-bars">
      {CATEGORIES.map((c) => (
        <div key={c.label} className="cat-bars__row">
          <span className="cat-bars__label">{c.label}</span>
          <div className="cat-bars__track">
            <div
              className="cat-bars__fill"
              style={{ width: `${Math.round((c.count / max) * 100)}%`, background: c.color }}
            />
          </div>
          <span className="cat-bars__count tabular">{c.count}</span>
        </div>
      ))}
    </div>
  );
}
