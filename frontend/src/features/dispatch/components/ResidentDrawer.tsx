import { Drawer, Badge, Avatar, Button, Icon } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { RESIDENTS, STATUS } from '../data';
import { decorateResident } from '../selectors';

export function ResidentDrawer() {
  const openResidentId = useDispatchStore((s) => s.openResidentId);
  const closeResident = useDispatchStore((s) => s.closeResident);
  const openTicket = useDispatchStore((s) => s.openTicket);

  const raw = openResidentId ? RESIDENTS.find((r) => r.id === openResidentId) : undefined;
  if (!raw) return null;

  const r = decorateResident(raw);

  const facts = [
    { label: 'Телефон', value: r.phone },
    { label: 'Обращений всего', value: String(r.reqs) },
    { label: 'Квартира', value: r.apt },
    { label: 'Задолженность', value: r.debtText },
  ];

  const header = (
    <>
      <span className="ticket-drawer__num" style={{ fontSize: 16 }}>
        Профиль жителя
      </span>
      <button className="hd-icon-btn" onClick={closeResident} aria-label="Закрыть">
        <Icon name="IconX" size={18} />
      </button>
    </>
  );

  const footer = (
    <>
      <Button variant="secondary">Позвонить</Button>
      <Button variant="primary">Написать в чат</Button>
    </>
  );

  return (
    <Drawer open onClose={closeResident} width={460} header={header} footer={footer}>
      <div className="resident-drawer__head">
        <Avatar name={r.name} size="xl" />
        <div>
          <div className="resident-drawer__name">{r.name}</div>
          <div className="resident-drawer__addr">{r.address}</div>
          <div style={{ marginTop: 8 }}>
            <Badge color={r.statusColor} size="sm">
              {r.statusLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="fact-grid">
        {facts.map((f) => (
          <div key={f.label} className="fact-grid__cell">
            <div className="fact-grid__label">{f.label}</div>
            <div className="fact-grid__value">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="hd-section-label" style={{ marginBottom: 10 }}>
        История обращений
      </div>
      <div className="resident-drawer__tickets">
        {r.tickets.map((t) => (
          <div key={t.id} className="resident-drawer__ticket" onClick={() => openTicket(t.id)}>
            <span className="resident-drawer__ticket-dot" style={{ background: t.statusDot }} />
            <span className="resident-drawer__ticket-num">{t.num}</span>
            <span className="resident-drawer__ticket-title">{t.title}</span>
            <Badge color={STATUS[t.status].color} size="sm">
              {t.statusLabel}
            </Badge>
          </div>
        ))}
        {r.tickets.length === 0 && <div className="empty-hint">Обращений пока нет</div>}
      </div>
    </Drawer>
  );
}
