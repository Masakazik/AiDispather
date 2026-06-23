import { Badge, Avatar, Icon } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { PRIO } from '../data';
import type { DecoratedTicket } from '../selectors';

/** Compact Kanban card. */
export function TicketCard({ ticket }: { ticket: DecoratedTicket }) {
  const openTicket = useDispatchStore((s) => s.openTicket);

  return (
    <article className="ticket-card" onClick={() => openTicket(ticket.id)}>
      {ticket.emergency && <span className="ticket-card__emergency" />}
      <div className="ticket-card__top">
        <span className="ticket-card__num tabular">{ticket.num}</span>
        <div className="ticket-card__badges">
          {ticket.dup && (
            <Badge color="warning" size="sm">
              Дубль
            </Badge>
          )}
          <Badge color={PRIO[ticket.priority].color} size="sm">
            {ticket.prioLabel}
          </Badge>
        </div>
      </div>

      <p className="ticket-card__title">{ticket.title}</p>

      {ticket.tags.length > 0 && (
        <div className="ticket-card__tags">
          {ticket.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="ticket-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="ticket-card__foot">
        <span className="ticket-card__resident">{ticket.resident}</span>
        <div className="ticket-card__meta">
          {ticket.photos > 0 && (
            <span className="ticket-card__meta-item">
              <Icon name="IconPaperclip" size={13} />
              {ticket.photos}
            </span>
          )}
          {ticket.chat > 0 && (
            <span className="ticket-card__meta-item">
              <Icon name="IconChatCircleDots" size={13} />
              {ticket.chat}
            </span>
          )}
          {ticket.assignee && <Avatar name={ticket.assignee} size="xs" />}
        </div>
      </div>
    </article>
  );
}
