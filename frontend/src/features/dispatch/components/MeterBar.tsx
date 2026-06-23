interface MeterBarProps {
  value: number; // 0..100
  color: string;
  height?: number;
}

/** Thin rounded progress meter used for SLA / load bars. */
export function MeterBar({ value, color, height = 8 }: MeterBarProps) {
  return (
    <div className="hd-meter" style={{ height }}>
      <div
        className="hd-meter__fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
