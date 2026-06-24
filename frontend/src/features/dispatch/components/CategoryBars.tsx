interface CategoryDatum {
  label: string;
  count: number;
  color: string;
}

interface CategoryBarsProps {
  data: CategoryDatum[];
}

/** Horizontal category breakdown bars. */
export function CategoryBars({ data }: CategoryBarsProps) {
  const max = Math.max(1, ...data.map((c) => c.count));
  if (data.length === 0) return <div className="empty-hint">Нет данных</div>;
  return (
    <div className="cat-bars">
      {data.map((c) => (
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
