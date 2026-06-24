import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Avatar, Button, Icon, Select, type SelectOption } from '@/components/ui';
import { useEmployeesStore } from '@/store/employees.store';
import type { Presence } from '@/types/employee';

const PRESENCE_OPTIONS: SelectOption[] = [
  { value: 'ONLINE', label: 'На смене' },
  { value: 'AWAY', label: 'Отошёл' },
  { value: 'OFFLINE', label: 'Не на смене' },
];
const PRESENCE_MAP: Record<Presence, 'online' | 'away' | 'offline'> = {
  ONLINE: 'online',
  AWAY: 'away',
  OFFLINE: 'offline',
};

const EMPTY = { name: '', role: '', phone: '', presence: 'ONLINE' as Presence };

export default function StaffPage() {
  const { items: employees, create, remove } = useEmployeesStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (form.name.trim().length < 2 || form.role.trim().length < 2) return;
    setBusy(true);
    try {
      await create({
        name: form.name.trim(),
        role: form.role.trim(),
        phone: form.phone.trim() || undefined,
        presence: form.presence,
      });
      setForm(EMPTY);
      setDialogOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Сотрудники</h2>
          <p className="page-header__subtitle">{employees.length} в команде</p>
        </div>
        <Button variant="primary" onClick={() => setDialogOpen(true)}>
          + Добавить сотрудника
        </Button>
      </div>

      <div className="cards-grid cards-grid--330">
        {employees.map((e) => (
          <div key={e.id} className="staff-card">
            <div className="staff-card__head">
              <Avatar name={e.name} size="lg" presence={PRESENCE_MAP[e.presence]} />
              <div className="staff-card__title-wrap">
                <div className="staff-card__name">{e.name}</div>
                <div className="staff-card__role">{e.role}</div>
              </div>
              <button className="hd-icon-btn" aria-label="Удалить" onClick={() => void remove(e.id)}>
                <Icon name="IconX" size={16} />
              </button>
            </div>
            {e.phone && <div className="staff-card__phone">{e.phone}</div>}
            <div className="staff-card__stats">
              <div className="staff-card__stat">
                <div className="staff-card__stat-value">{e.activeCount}</div>
                <div className="staff-card__stat-label">в работе</div>
              </div>
              <div className="staff-card__stat staff-card__stat--mid">
                <div className="staff-card__stat-value">{e.doneCount}</div>
                <div className="staff-card__stat-label">выполнено</div>
              </div>
              <div className="staff-card__stat">
                <div className="staff-card__stat-value">{e.rating.toFixed(1)}</div>
                <div className="staff-card__stat-label">рейтинг</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        header="Новый сотрудник"
        visible={dialogOpen}
        onHide={() => setDialogOpen(false)}
        style={{ width: '420px', maxWidth: '94vw' }}
        dismissableMask
      >
        <div className="new-request-form">
          <label className="new-request-form__field">
            <span>ФИО *</span>
            <InputText value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </label>
          <label className="new-request-form__field">
            <span>Должность *</span>
            <InputText
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Сантехник, Электрик…"
            />
          </label>
          <div className="new-request-form__row">
            <label className="new-request-form__field">
              <span>Телефон</span>
              <InputText value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+7 …" />
            </label>
            <label className="new-request-form__field">
              <span>Статус</span>
              <Select
                options={PRESENCE_OPTIONS}
                value={form.presence}
                onChange={(v) => setForm({ ...form, presence: v as Presence })}
              />
            </label>
          </div>
          <div className="new-request-form__actions">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} type="button">
              Отмена
            </Button>
            <Button variant="primary" onClick={submit} disabled={busy} type="button">
              {busy ? 'Сохранение…' : 'Добавить'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
