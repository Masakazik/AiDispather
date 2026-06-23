import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

/** Pill-style segmented tabs matching the design. */
export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="hd-tabs" role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            className={cn('hd-tabs__tab', active && 'hd-tabs__tab--active')}
            onClick={() => onChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && <span className="hd-tabs__count">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
