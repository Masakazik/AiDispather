import { Badge, Avatar, Icon } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { PRIO, STATUS } from '../data';
import type { DecoratedTicket } from '../selectors';

/** Larger card for the grid ("Карточки") view. */
export function TicketGridCard({ ticket }: { ticket: DecoratedTicket }) {
  const openTicket = useDispatchStore((s) => s.openTicket);

  return (
    <article className="ticket-grid-card" onClick={() => openTicket(ticket.id)}>
      {ticket.emergency && <span className="ticket-card__emergency" />}
      <div className="ticket-grid-card__top">
        <span className="ticket-grid-card__id">
          <span className="ticket-card__num tabular">{ticket.num}</span>
          <Badge color={STATUS[ticket.status].color} size="sm">
            {ticket.statusLabel}
          </Badge>
        </span>
        <Badge color={PRIO[ticket.priority].color} size="sm">
          {ticket.prioLabel}
        </Badge>
      </div>

      <p className="ticket-grid-card__title">{ticket.title}</p>
      <p className="ticket-grid-card__desc">{ticket.desc}</p>

      <div className="ticket-grid-card__loc">
        <Icon name="IconMapPin" size={14} color="var(--text-tertiary)" />
        {ticket.buildingName} · {ticket.apt}
      </div>

      <div className="ticket-grid-card__foot">
        {ticket.assignee ? (
          <span className="ticket-grid-card__assignee">
            <Avatar name={ticket.assignee} size="xs" />
            <span>{ticket.assignee}</span>
          </span>
        ) : (
          <span />
        )}
        <span className="ticket-grid-card__sla" style={{ color: ticket.slaColorValue }}>
          {ticket.sla}
        </span>
      </div>
    </article>
  );
}
