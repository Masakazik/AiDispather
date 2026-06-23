import { MAINTENANCE, WEEK_DAYS } from '@/features/dispatch/data';
import { cn } from '@/utils/cn';

const TODAY = 21;
const DAYS_IN_MONTH = 30;

export default function CalendarPage() {
  const eventsByDay = new Map<number, typeof MAINTENANCE>();
  MAINTENANCE.forEach((m) => {
    const arr = eventsByDay.get(m.day) ?? [];
    arr.push(m);
    eventsByDay.set(m.day, arr);
  });

  return (
    <div className="calendar-layout">
      <div className="hd-card">
        <h3 className="hd-h3" style={{ fontSize: 18, marginBottom: 16 }}>
          Июнь 2026
        </h3>
        <div className="calendar-grid calendar-grid--head">
          {WEEK_DAYS.map((wd) => (
            <div key={wd} className="calendar-grid__wd">
              {wd}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map((d) => (
            <div key={d} className={cn('calendar-cell', d === TODAY && 'calendar-cell--today')}>
              <span className="calendar-cell__num">{d}</span>
              {(eventsByDay.get(d) ?? []).map((ev) => (
                <div key={ev.title} className="calendar-cell__event">
                  <span className="calendar-cell__event-dot" style={{ background: ev.color }} />
                  <span className="calendar-cell__event-title">{ev.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="hd-card">
        <h3 className="hd-h3 card-title">Плановые работы</h3>
        <div className="maintenance">
          {MAINTENANCE.map((m) => (
            <div key={m.title} className="maintenance__row">
              <div className="maintenance__date">
                <div className="maintenance__day">{m.day}</div>
                <div className="maintenance__month">июня</div>
              </div>
              <div className="maintenance__main">
                <div className="maintenance__title">{m.title}</div>
                <div className="maintenance__building">{m.building}</div>
                <span className="maintenance__type">{m.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
