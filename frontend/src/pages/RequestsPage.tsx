import { useEffect, useMemo, useState, type DragEvent as ReactDragEvent } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge, Avatar, Button, Select, SearchInput, Tabs, type SelectOption } from '@/components/ui';
import { useDispatchStore } from '@/store/dispatch.store';
import { useRequestsStore } from '@/store/requests.store';
import { useStaffStore } from '@/store/staff.store';
import { BUILDINGS, COLUMNS, PRIO, STATUS } from '@/features/dispatch/data';
import { decorateTicket, type DecoratedTicket } from '@/features/dispatch/selectors';
import { TicketCard } from '@/features/dispatch/components/TicketCard';
import { TicketGridCard } from '@/features/dispatch/components/TicketGridCard';
import { NewRequestDialog } from '@/features/dispatch/components/NewRequestDialog';
import type { TicketPriority, TicketStatus } from '@/types/dispatch';
import { displayName } from '@/utils/format';

const VIEW_TABS = [
  { id: 'kanban', label: 'Канбан' },
  { id: 'table', label: 'Таблица' },
  { id: 'grid', label: 'Карточки' },
];

export default function RequestsPage() {
  const {
    search,
    priority,
    statusFilter,
    buildingFilter,
    assigneeFilter,
    view,
    setSearch,
    setPriority,
    setStatusFilter,
    setBuildingFilter,
    setAssigneeFilter,
    setView,
    openTicket,
  } = useDispatchStore();
  const items = useRequestsStore((s) => s.items);
  const updateStatus = useRequestsStore((s) => s.updateStatus);
  const staff = useStaffStore((s) => s.items);
  const fetchStaff = useStaffStore((s) => s.fetch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragOverCol, setDragOverCol] = useState<TicketStatus | null>(null);

  const onDropToColumn = (e: ReactDragEvent, target: TicketStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData('text/ticket-id');
    const from = e.dataTransfer.getData('text/ticket-status');
    if (id && from !== target) void updateStatus(id, target);
  };

  useEffect(() => {
    void fetchStaff();
  }, [fetchStaff]);

  const list = useMemo<DecoratedTicket[]>(() => {
    const q = search.trim().toLowerCase();
    return items.filter((t) => {
      if (priority !== 'all' && t.priority !== priority) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (buildingFilter !== 'all' && t.bId !== buildingFilter) return false;
      if (assigneeFilter !== 'all' && t.assignee !== assigneeFilter) return false;
      if (q) {
        const hay = `${t.title} ${t.num} ${t.resident} ${t.tags.join(' ')} ${t.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).map(decorateTicket);
  }, [items, search, priority, statusFilter, buildingFilter, assigneeFilter]);

  const count = (p: TicketPriority | 'all') =>
    items.filter((t) => (p === 'all' ? true : t.priority === p)).length;

  const priorityTabs = [
    { id: 'all', label: 'Все', count: count('all') },
    { id: 'critical', label: 'Критичные', count: count('critical') },
    { id: 'high', label: 'Высокий', count: count('high') },
    { id: 'medium', label: 'Средний', count: count('medium') },
    { id: 'low', label: 'Низкий', count: count('low') },
  ];

  const buildingOptions: SelectOption[] = [
    { value: 'all', label: 'Все дома' },
    ...BUILDINGS.map((b) => ({ value: b.id, label: `${b.name.replace('ЖК ', '')}, ${b.corp}` })),
  ];
  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'Все статусы' },
    ...(Object.keys(STATUS) as TicketStatus[]).map((k) => ({ value: k, label: STATUS[k].label })),
  ];
  const assigneeOptions: SelectOption[] = [
    { value: 'all', label: 'Все исполнители' },
    ...Array.from(
      new Set(
        staff
          .filter((u) => u.isActive && (u.role === 'DISPATCHER' || u.role === 'TECHNICIAN'))
          .map((u) => displayName(u)),
      ),
    ).map((name) => ({ value: name, label: name })),
  ];

  return (
    <div className="page requests-page">
      {/* Filters */}
      <div className="requests-filters">
        <div className="requests-filters__search">
          <SearchInput
            placeholder="Поиск по заявкам, жителям, тегам…"
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className="requests-filters__select requests-filters__select--building">
          <Select options={buildingOptions} value={buildingFilter} onChange={setBuildingFilter} />
        </div>
        <div className="requests-filters__select">
          <Select options={statusOptions} value={statusFilter} onChange={(v) => setStatusFilter(v as TicketStatus | 'all')} />
        </div>
        <div className="requests-filters__select requests-filters__select--assignee">
          <Select options={assigneeOptions} value={assigneeFilter} onChange={setAssigneeFilter} />
        </div>
        <div className="requests-filters__spacer" />
        <Button variant="primary" onClick={() => setDialogOpen(true)}>
          + Новая заявка
        </Button>
      </div>

      {/* Priority + view tabs */}
      <div className="requests-tabs">
        <Tabs tabs={priorityTabs} value={priority} onChange={(id) => setPriority(id as TicketPriority | 'all')} />
        <div className="requests-filters__spacer" />
        <Tabs tabs={VIEW_TABS} value={view} onChange={(id) => setView(id as typeof view)} />
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="kanban">
          {COLUMNS.map((col) => {
            const tickets = list.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className={`kanban__col${dragOverCol === col.key ? ' kanban__col--drop' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCol !== col.key) setDragOverCol(col.key);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null);
                }}
                onDrop={(e) => onDropToColumn(e, col.key)}
              >
                <div className="kanban__head" style={{ borderTopColor: col.accent }}>
                  <span className="kanban__head-label">{col.label}</span>
                  <span className="kanban__head-count">{tickets.length}</span>
                </div>
                {tickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {view === 'table' && (
        <div className="hd-card requests-table-wrap">
          <DataTable
            value={list}
            dataKey="id"
            onRowClick={(e) => openTicket((e.data as DecoratedTicket).id)}
            className="requests-table"
            rowClassName={() => 'requests-table__row'}
            emptyMessage="Заявки не найдены"
          >
            <Column
              header="№"
              style={{ width: '78px' }}
              body={(r: DecoratedTicket) => <span className="table-num tabular">{r.num}</span>}
            />
            <Column
              header="Заявка"
              style={{ minWidth: '420px', width: '420px' }}
              body={(r: DecoratedTicket) => (
                <div className="table-title">
                  {r.emergency && <span className="table-title__dot" />}
                  <span>{r.title}</span>
                </div>
              )}
            />
            <Column header="Житель" body={(r: DecoratedTicket) => <span className="muted">{r.resident}</span>} />
            <Column header="Адрес" body={(r: DecoratedTicket) => <span className="muted nowrap">{r.addressShort}</span>} />
            <Column header="Категория" body={(r: DecoratedTicket) => <Badge color="brand" size="sm">{r.category}</Badge>} />
            <Column
              header="Приоритет"
              body={(r: DecoratedTicket) => (
                <Badge color={PRIO[r.priority].color} size="sm">
                  {r.prioLabel}
                </Badge>
              )}
            />
            <Column
              header="Статус"
              body={(r: DecoratedTicket) => (
                <Badge color={STATUS[r.status].color} size="sm">
                  {r.statusLabel}
                </Badge>
              )}
            />
            <Column
              header="MAX"
              body={(r: DecoratedTicket) =>
                r.maxMessageUrl ? (
                  <a
                    href={r.maxMessageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="table-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Открыть
                  </a>
                ) : (
                  <span className="table-unassigned">—</span>
                )
              }
            />
            <Column
              header="Исполнитель"
              body={(r: DecoratedTicket) =>
                r.assignee ? (
                  <div className="table-assignee">
                    <Avatar name={r.assignee} size="xs" />
                    <span className="muted">{r.assignee}</span>
                  </div>
                ) : (
                  <span className="table-unassigned">— не назначен</span>
                )
              }
            />
          </DataTable>
        </div>
      )}

      {/* Grid */}
      {view === 'grid' && (
        <div className="ticket-grid">
          {list.map((t) => (
            <TicketGridCard key={t.id} ticket={t} />
          ))}
        </div>
      )}

      <NewRequestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
