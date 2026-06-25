import { useEffect, useRef } from 'react';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { Drawer, Badge, Avatar, Button, Icon } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { useRequestsStore } from '@/store/requests.store';
import { useStaffStore } from '@/store/staff.store';
import { PRIO, STATUS, TICKETS } from '../data';
import { decorateTicket, ticketComments, ticketTimeline } from '../selectors';
import type { TicketStatus } from '@/types/dispatch';
import { displayName } from '@/utils/format';

export function TicketDrawer() {
  const openTicketId = useDispatchStore((s) => s.openTicketId);
  const closeTicket = useDispatchStore((s) => s.closeTicket);
  const items = useRequestsStore((s) => s.items);
  const updateStatus = useRequestsStore((s) => s.updateStatus);
  const assign = useRequestsStore((s) => s.assign);
  const staff = useStaffStore((s) => s.items);
  const fetchStaff = useStaffStore((s) => s.fetch);
  const assignMenuRef = useRef<Menu>(null);

  useEffect(() => {
    void fetchStaff();
  }, [fetchStaff]);

  // Prefer live data; fall back to static mock (e.g. resident history links).
  const raw = openTicketId
    ? (items.find((t) => t.id === openTicketId) ?? TICKETS.find((t) => t.id === openTicketId))
    : undefined;
  if (!raw) return null;

  const isLive = items.some((i) => i.id === raw.id);
  const t = decorateTicket(raw);
  const timeline = ticketTimeline(raw);
  const comments = ticketComments(raw);

  const changeStatus = async (status: TicketStatus, closeAfter = false) => {
    if (isLive) await updateStatus(raw.id, status);
    if (closeAfter) closeTicket();
  };

  const assignItems: MenuItem[] = staff
    .filter((u) => u.isActive && (u.role === 'DISPATCHER' || u.role === 'TECHNICIAN'))
    .map((u) => {
      const name = displayName(u);
      return {
        label: name,
        command: () => {
          if (isLive) void assign(raw.id, name);
        },
      };
    });
  if (assignItems.length === 0) {
    assignItems.push({ label: 'Нет сотрудников', disabled: true });
  }

  const facts: { label: string; value: string; color?: string }[] = [
    { label: 'Категория', value: t.category },
    { label: 'Источник', value: t.source },
    { label: 'Дом', value: [t.buildingName, t.corp].filter(Boolean).join(', ') || '—' },
    { label: 'Квартира', value: t.apt },
    { label: 'Житель', value: t.resident },
    { label: 'Телефон', value: t.phone || '—' },
    { label: 'Создана', value: t.created },
    { label: 'SLA', value: t.sla || '—', color: t.slaColorValue },
  ];

  const header = (
    <>
      <div className="ticket-drawer__head-left">
        <span className="ticket-drawer__num">{t.num}</span>
        <Badge color={STATUS[t.status].color} size="sm">
          {t.statusLabel}
        </Badge>
        <Badge color={PRIO[t.priority].color} size="sm">
          {t.prioLabel}
        </Badge>
      </div>
      <button className="hd-icon-btn" onClick={closeTicket} aria-label="Закрыть">
        <Icon name="IconX" size={18} />
      </button>
    </>
  );

  const footer = (
    <>
      <Menu model={assignItems} popup ref={assignMenuRef} />
      <Button variant="secondary" onClick={(e) => assignMenuRef.current?.toggle(e)}>
        Назначить
      </Button>
      <Button variant="primary" onClick={() => void changeStatus('in_progress')}>
        В работу
      </Button>
      <div style={{ flex: 1 }} />
      <Button variant="ghost" onClick={() => void changeStatus('done', true)}>
        Закрыть заявку
      </Button>
    </>
  );

  return (
    <Drawer open onClose={closeTicket} width={480} header={header} footer={footer}>
      <h2 className="ticket-drawer__title">{t.title}</h2>
      <p className="ticket-drawer__desc">{t.desc}</p>

      {t.photos > 0 && (
        <section className="ticket-drawer__section">
          <div className="hd-section-label">Фотографии</div>
          <div className="ticket-drawer__photos">
            {Array.from({ length: t.photos }).map((_, i) => (
              <div key={i} className="ticket-drawer__photo">
                <Icon name="IconEye" size={20} color="var(--text-tertiary)" />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="fact-grid">
        {facts.map((f) => (
          <div key={f.label} className="fact-grid__cell">
            <div className="fact-grid__label">{f.label}</div>
            <div className="fact-grid__value" style={f.color ? { color: f.color } : undefined}>
              {f.value}
            </div>
          </div>
        ))}
      </div>

      {t.assignee && (
        <section className="ticket-drawer__section">
          <div className="hd-section-label">Исполнитель</div>
          <div className="ticket-drawer__assignee">
            <Avatar name={t.assignee} size="md" presence="online" />
            <div>
              <div className="ticket-drawer__assignee-name">{t.assignee}</div>
              <div className="ticket-drawer__assignee-sub">Назначен · на объекте</div>
            </div>
          </div>
        </section>
      )}

      <section className="ticket-drawer__section">
        <div className="hd-section-label">Хронология</div>
        <div className="timeline">
          {timeline.map((tl, i) => (
            <div key={i} className="timeline__row">
              <div className="timeline__rail">
                <span className="timeline__dot" style={{ background: tl.dot }} />
                {i < timeline.length - 1 && <span className="timeline__line" />}
              </div>
              <div className="timeline__content">
                <div className="timeline__label">{tl.label}</div>
                <div className="timeline__who">{tl.who}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {comments.length > 0 && (
        <section className="ticket-drawer__section">
          <div className="hd-section-label">Комментарии</div>
          <div className="comments">
            {comments.map((c, i) => (
              <div key={i} className="comments__row">
                <Avatar name={c.who} size="sm" />
                <div className="comments__body">
                  <div className="comments__meta">
                    <span className="comments__who">{c.who}</span>
                    <span className="comments__time">{c.time}</span>
                  </div>
                  <div className="comments__text">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Drawer>
  );
}
