import { Avatar, Badge } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { RESIDENTS } from '@/features/dispatch/data';
import { decorateResident } from '@/features/dispatch/selectors';

export default function ResidentsPage() {
  const openResident = useDispatchStore((s) => s.openResident);
  const residents = RESIDENTS.map(decorateResident);

  return (
    <div className="cards-grid cards-grid--340">
      {residents.map((r) => (
        <div key={r.id} className="resident-card" onClick={() => openResident(r.id)}>
          <Avatar name={r.name} size="lg" />
          <div className="resident-card__main">
            <div className="resident-card__name">{r.name}</div>
            <div className="resident-card__addr">
              {r.buildingName} · {r.corp} · {r.apt}
            </div>
            <div className="resident-card__meta">
              <Badge color={r.statusColor} size="sm">
                {r.statusLabel}
              </Badge>
              <span className="resident-card__reqs">{r.reqs} обращений</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
